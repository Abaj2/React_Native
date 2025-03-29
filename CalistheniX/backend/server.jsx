const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 4005;
const postgresPassword = process.env.PASSWORD;
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

app.use(express.json({ limit: "10mb" }));
app.use(cors());

const pool = new Pool({
  connectionString: process.env.CONNECTIONSTRING,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL database successfully."))
  .catch((err) =>
    console.error("Failed to connect to the PostgreSQL database:", err)
  );

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

const generateJWT = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email, username: user.username },
    jwtSecret,
    { expiresIn: "3d" }
  );
};
const formatDate = () => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

app.post("/signup", async (req, res) => {
  const { email, username, password, confirmPassword, name } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9._]{3,15}$/;
  console.log("received request:", email);

  try {
    if (!usernameRegex.test(username)) {
      res.status(405).json({ error: "Invalid username" });
    }
    const emailExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const usernameExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (emailExists.rows.length > 0) {
      res.status(409).json({ error: "Account with email already exists" });
      return;
    } else if (password !== confirmPassword) {
      res.status(408).json({ error: "Passwords do not match" });
      return;
    } else if (!emailRegex.test(email)) {
      res.status(407).json({ error: "Invalid email" });
      return;
    } else if (usernameExists.rows.length > 0 && !emailExists.rows.length > 0) {
      res.status(404).json({ error: "Username exists." });
      return;
    } else if (!email || !password || !confirmPassword || !username) {
      res.status(406).json({ error: "Enter all details" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users(email, username, password_hash, name) VALUES ($1, $2, $3, $4) RETURNING user_id, email, username, name",
      [email, username, hashedPassword, name]
    );

    const token = generateJWT(result.rows[0]);
    const user = result.rows[0];

    res.status(201).json({
      message: "User created successfully",
      user: {
        username: user.username,
        email: user.email,
        user_id: user.user_id,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/signin", async (req, res) => {
  const { email, username, password } = req.body;

  console.log("received request", email);

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(410).json({ error: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(409).json({ error: "Invalid password" });
    }

    const token = generateJWT(user);

    if (user.profile_pic) {
      console.log(user.profile_pic[(0, 10)]);
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
        user_id: user.user_id,
        name: user.name,
        profile_pic: user.profile_pic,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/skills", verifyToken, async (req, res) => {
  const { skill, progression, current, goal, user_id } = req.body;

  const date = Date.now();
  const dateFormatted = formatDate();

  try {
    const progressionsArray = [progression.trim()];
    const currentArray = JSON.stringify([[current]]);
    const goalArray = JSON.stringify([[goal]]);
    const dateArray = JSON.stringify([[date]]);
    const dateFormattedArray = JSON.stringify([[dateFormatted]]);

    if (req.user.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this data" });
    }

    const result = await pool.query(
      "INSERT INTO skills (skill, progressions, current, goal, date, date_formatted, user_id) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7) RETURNING skill, progressions, current, goal, user_id",
      [
        skill.trim(),
        progressionsArray,
        currentArray,
        goalArray,
        dateArray,
        dateFormattedArray,
        user_id,
      ]
    );

    res.status(200).json({ message: "Successfully inserted skills" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/fetchskills", verifyToken, async (req, res) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const result = await pool.query("SELECT * FROM skills WHERE user_id = $1", [
      userId,
    ]);

    res.status(200).json({ skills: result.rows || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/addprogression", verifyToken, async (req, res) => {
  try {
    const { skill, addProgressionTrimmed, addCurrent, addGoal, user_id } =
      req.body;
    const date = Date.now();
    const formattedDate = formatDate();

    if (req.user.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this data" });
    }

    console.log("Incoming data:", {
      user_id,
      skill,
      addProgressionTrimmed,
      addCurrent,
      addGoal,
    });

    const insertProgression = await pool.query(
      `UPDATE skills 
       SET progressions = array_append(progressions, $3)
       WHERE user_id = $1 AND skill = $2`,
      [user_id, skill, addProgressionTrimmed]
    );

    const getCurrentAndGoal = await pool.query(
      `SELECT current, goal FROM skills WHERE user_id = $1 AND skill = $2`,
      [user_id, skill]
    );
    const getDates = await pool.query(
      `SELECT date, date_formatted FROM skills WHERE user_id = $1 AND skill = $2`,
      [user_id, skill]
    );

    const currentAndGoals = getCurrentAndGoal.rows[0];
    const dates = getDates.rows[0];

    currentAndGoals.current.push([addCurrent]);
    currentAndGoals.goal.push([addGoal]);
    dates.date.push([date]);
    dates.date_formatted.push([formattedDate]);

    const currentJson = JSON.stringify(currentAndGoals.current);
    const goalJson = JSON.stringify(currentAndGoals.goal);
    const dateJson = JSON.stringify(dates.date);
    const dateFormattedJson = JSON.stringify(dates.date_formatted);

    const insertCurrentAndGoal = await pool.query(
      `UPDATE skills SET current = $1, goal = $2 WHERE user_id = $3 AND skill = $4`,
      [currentJson, goalJson, user_id, skill]
    );
    const insertDates = await pool.query(
      `UPDATE skills SET date = $1, date_formatted = $2 WHERE user_id = $3 AND skill = $4`,
      [dateJson, dateFormattedJson, user_id, skill]
    );

    if (insertProgression.rowCount === 0) {
      return res.status(404).json({ error: "Update failed" });
    }

    res.status(200).json({
      message: "Progression added successfully",
      updatedRecord: insertProgression.rows[0],
    });
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});
app.post("/editprogression", verifyToken, async (req, res) => {
  try {
    const {
      skill,
      editProgression,
      editCurrent,
      oldCurrent,
      editGoal,
      oldGoal,
      editIndex,
      editProgressionNameTrimmed,
      user_id,
    } = req.body;

    const date = Date.now();
    const formattedDate = formatDate();

    const getCurrentAndGoal = await pool.query(
      `SELECT current, goal FROM skills WHERE user_id = $1 AND skill = $2`,
      [user_id, skill]
    );
    const getDates = await pool.query(
      `SELECT date, date_formatted FROM skills WHERE user_id = $1 AND skill = $2`,
      [user_id, skill]
    );

    const dates = getDates.rows[0];
    const currentAndGoals = getCurrentAndGoal.rows[0];

    if (oldCurrent !== editCurrent && editCurrent) {
      currentAndGoals.current[editIndex].push(editCurrent);
      dates.date[editIndex].push(date);
      dates.date_formatted[editIndex].push(formattedDate);
    }
    if (oldGoal !== editGoal && editGoal) {
      currentAndGoals.goal[editIndex].push(editGoal);
    }

    const currentJson = JSON.stringify(currentAndGoals.current);
    const goalJson = JSON.stringify(currentAndGoals.goal);
    const dateJson = JSON.stringify(dates.date);
    const dateFormattedJson = JSON.stringify(dates.date_formatted);

    const insertEdit = await pool.query(
      `UPDATE skills SET current = $1, goal = $2, date = $3, date_formatted = $4 WHERE user_id = $5 AND skill = $6`,
      [currentJson, goalJson, dateJson, dateFormattedJson, user_id, skill]
    );

    if (req.user.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this data" });
    }

    if (editProgression !== editProgressionNameTrimmed) {
      try {
        const updateName = await pool.query(
          `UPDATE skills SET progressions[$1] = $2 WHERE user_id = $3 AND skill = $4`,
          [editIndex + 1, editProgressionNameTrimmed, user_id, skill]
        );
        console.log(
          `Progression name updated. Rows affected: ${updateName.rowCount}`
        );
      } catch (error) {
        console.error("Error updating progression name:", error);
        return res
          .status(500)
          .json({ error: "Failed to update progression name" });
      }
    }

    if (editGoal !== oldGoal) {
      try {
        const updateGoal = await pool.query(``, [
          editIndex + 1,
          editGoal,
          user_id,
          skill,
        ]);
        console.log(`Goal updated. Rows affected: ${updateGoal.rowCount}`);
      } catch (error) {
        console.error("Error updating goal:", error);
        return res.status(500).json({ error: "Failed to update goal" });
      }
    }

    res.status(200).json({ message: "Successfully updated progression" });
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: "Server error occurred" });
  }
});

app.post("/submitworkout", verifyToken, async (req, res) => {
  try {
    console.log("received workout");
    const { workoutSummary, user_id } = req.body;
    //console.log("Workout Summary:", JSON.stringify(workoutSummary, null, 2));
    console.log(JSON.stringify(workoutSummary, null, 2));

    console.log(workoutSummary.title);
    console.log(workoutSummary.level);
    console.log(workoutSummary.date);
    console.log(workoutSummary.duration);

    const addWorkout = await pool.query(
      `INSERT INTO workouts(user_id, title, level, workout_time) VALUES($1, $2, $3, $4) RETURNING workout_id`,
      [
        user_id,
        workoutSummary.title,
        workoutSummary.level,
        workoutSummary.duration,
      ]
    );
    console.log(`Number of rows affected: ${addWorkout.rowCount}`);
    const workout_id = addWorkout.rows[0].workout_id;

    for (const exercise of workoutSummary.exercises) {
      const addExercises = await pool.query(
        `INSERT INTO exercises(workout_id, name, user_id) VALUES($1, $2, $3) RETURNING exercise_id`,
        [workout_id, exercise.name, user_id]
      );
      console.log(`Number of rows affected: ${addExercises.rowCount}`);
      const exercise_id = addExercises.rows[0].exercise_id;

      for (const set of exercise.sets) {
        await pool.query(
          `INSERT INTO sets(exercise_id, reps, duration, notes, user_id, workout_id) VALUES($1, $2, $3, $4, $5, $6)`,
          [exercise_id, set.reps, set.duration, set.notes, user_id, workout_id]
        );
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/getworkouts", verifyToken, async (req, res) => {
  const userId = req.query.user_id;

  const userWorkouts = await pool.query(
    "SELECT * FROM workouts WHERE user_id = $1",
    [userId]
  );
  const userExercises = await pool.query(
    "SELECT * FROM exercises WHERE user_id = $1",
    [userId]
  );
  const userSets = await pool.query("SELECT * FROM sets WHERE user_id = $1", [
    userId,
  ]);

  res.status(200).json({
    workouts: userWorkouts.rows,
    exercises: userExercises.rows,
    sets: userSets.rows,
  });
});
app.post("/deleteskill", verifyToken, async (req, res) => {
  const { user_id, skill } = req.body;
  console.log("user_id", user_id);
  console.log("skill", skill);

  try {
    const deleteSkill = await pool.query(
      "DELETE FROM skills WHERE skill = $1 AND user_id = $2",
      [skill, user_id]
    );
    console.log(`Number of rows affected: ${deleteSkill.rowCount}`);
    res.status(200).json({ success: "Deleted skill" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/postcustomworkout", verifyToken, async (req, res) => {
  const { workoutSummary, title, user_id, duration } = req.body;
  console.log(JSON.stringify(workoutSummary), title, user_id);
  const level = "Custom";

  try {
    const addWorkout = await pool.query(
      `INSERT INTO workouts(user_id, title, custom, level, workout_time) values($1, $2, $3, $4, $5) RETURNING workout_id`,
      [user_id, title.trim(), true, level, duration]
    );
    console.log(`Number of rows affected: ${addWorkout.rowCount}`);
    const workout_id = addWorkout.rows[0].workout_id;

    for (const exercise of workoutSummary) {
      const addExercise = await pool.query(
        `INSERT INTO exercises(workout_id, name, user_id, custom) values($1, $2, $3, $4) RETURNING exercise_id`,
        [workout_id, exercise.name, user_id, true]
      );
      const exercise_id = addExercise.rows[0].exercise_id;
      console.log(`Number of rows affected: ${addExercise.rowCount}`);

      for (const set of exercise.sets) {
        const integerReps = isNaN(parseInt(set.reps))
          ? null
          : parseInt(set.reps);
        const integerDuration = isNaN(parseInt(set.duration))
          ? null
          : parseInt(set.duration);
        await pool.query(
          `INSERT INTO sets(exercise_id, reps, duration, notes, user_id, workout_id, custom) VALUES($1, $2, $3, $4, $5, $6, $7)`,
          [
            exercise_id,
            integerReps,
            integerDuration,
            set.notes,
            user_id,
            workout_id,
            true,
          ]
        );
      }
    }
    res.status(200).json({ success: "Inserted into the database" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/profilepicture", async (req, res) => {
  const { profile_pic, user_id } = req.body;

  if (!profile_pic) {
    return res.status(400).json({ message: "No image data received." });
  }

  try {
    const checkQuery = "SELECT profile_pic FROM users WHERE user_id = $1";
    const checkResult = await pool.query(checkQuery, [user_id]);

    if (checkResult.rows.length > 0 && checkResult.rows[0].profile_pic) {
      const updateQuery =
        "UPDATE users SET profile_pic = $1 WHERE user_id = $2";
      await pool.query(updateQuery, [profile_pic, user_id]);
      res.json({ message: "Profile picture updated successfully" });
    } else {
      const insertQuery =
        "UPDATE users SET profile_pic = $1 WHERE user_id = $2";
      await pool.query(insertQuery, [profile_pic, user_id]);
      res.json({ message: "Profile picture inserted successfully" });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Failed to upload profile picture." });
  }
});

app.get("/getprofilepicture", async (req, res) => {
  const { user_id } = req.query;

  try {
    const result = await pool.query(
      "SELECT profile_pic FROM users WHERE user_id = $1",
      [user_id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the profile picture exists or is null
    const profilePicUrl =
      result.rows[0].profile_pic ||
      "https://calisthenix.s3.ap-southeast-2.amazonaws.com/profile_pics/blackDefaultProfilePic.png"; // Default if none exists

    res.status(200).json({ profile_pic: profilePicUrl });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getstats", verifyToken, async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id parameter." });
  }

  try {
    const totalWorkouts = await pool.query(
      `SELECT workout_id FROM workouts WHERE user_id = $1`,
      [user_id]
    );
    const totalSkills = await pool.query(
      `SELECT id FROM skills WHERE user_id = $1`,
      [user_id]
    );

    const totalDuration = await pool.query(
      `SELECT workout_time FROM workouts WHERE user_id = $1`,
      [user_id]
    );

    const following = await pool.query(
      `
      SELECT following_id FROM followers WHERE follower_id = $1`,
      [user_id]
    );

    const followers = await pool.query(
      `
      SELECT follower_id FROM followers WHERE following_id = $1`,
      [user_id]
    );

    const workoutDates = await pool.query(
      `SELECT date FROM workouts WHERE user_id = $1`,
      [user_id]
    );

    const stats = {
      totalWorkouts: totalWorkouts.rows.length,
      totalSkills: totalSkills.rows.length,
      totalDuration: totalDuration.rows,
      following: following.rows,
      followers: followers.rows,
      workoutDates: workoutDates.rows,
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).send({ message: "Failed to get data" });
  }
});

app.get("/getduration", verifyToken, async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id parameter." });
  }

  try {
    const thisWeekDuration = await pool.query(
      `SELECT EXTRACT(EPOCH FROM SUM(workout_time::interval)) AS total_duration_seconds
FROM workouts
WHERE date >= date_trunc('week', NOW()) AND date < date_trunc('week', NOW()) + INTERVAL '7 days' AND user_id = $1;
`,
      [user_id]
    );

    const lastWeekDuration = await pool.query(
      `SELECT EXTRACT(EPOCH FROM SUM(workout_time::interval)) AS total_duration_seconds
       FROM workouts
       WHERE date >= date_trunc('week', NOW()) - INTERVAL '7 days'
       AND date < date_trunc('week', NOW()) 
       AND user_id = $1`,
      [user_id]
    );

    const getCustomWorkouts = await pool.query(
      `SELECT title FROM workouts WHERE custom = true AND user_id = $1 AND routine = true`,
      [user_id]
    );
    const getCustomWorkoutsLength = getCustomWorkouts.rows.length;

    res.status(200).json({
      thisWeekDuration: thisWeekDuration.rows[0],
      lastWeekDuration: lastWeekDuration.rows[0],
      routineLength: getCustomWorkoutsLength,
    });
  } catch (error) {
    console.error("Error getting this week's duration:", error);
    res.status(500).send({ message: "Failed to get data" });
  }
});

app.get("/getcustomworkouts", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const userWorkouts = await pool.query(
      "SELECT * FROM workouts WHERE user_id = $1 AND level = 'Custom' AND routine = true",
      [userId]
    );
    const userExercises = await pool.query(
      "SELECT * FROM exercises WHERE user_id = $1 AND custom = true AND routine = true",
      [userId]
    );
    const userSets = await pool.query(
      "SELECT * FROM sets WHERE user_id = $1 AND custom = true AND routine = true",
      [userId]
    );

    res.status(200).json({
      workouts: userWorkouts.rows,
      exercises: userExercises.rows,
      sets: userSets.rows,
    });
  } catch (error) {
    console.error("Error getting custom workouts:", error);
    res.status(500).send({ message: "Failed to get data" });
  }
});

app.get("/getprofilegraph", verifyToken, async (req, res) => {
  const userId = req.query.user_id;

  const workoutDates = await pool.query(
    `SELECT date FROM workouts WHERE user_id = $1`,
    [userId]
  );
  const workoutTime = await pool.query(
    `SELECT workout_time FROM workouts WHERE user_id = $1`,
    [userId]
  );

  res.status(200).json({
    workoutDates: workoutDates.rows,
    workoutTime: workoutTime.rows,
  });

  try {
    console.log("Received get request");
  } catch (error) {
    console.error("Error getting graph data:", error);
    res.status(500).send({ message: "Failed to get data" });
  }
});

app.post("/sendotp", verifyToken, async (req, res) => {
  try {
    const { user_id, otp, newUsername, newEmail, oldEmail } = req.body;
    // console.log(user_id || "empty user id", otp || "empty otp", newUsername || "empty username", newEmail || "empty username", oldEmail || "no email");

    if (!user_id || !otp) {
      return res.status(400).json({ message: "user_id and otp are required" });
    }

    if (!oldEmail) {
      return res.status(400).json({ message: "Old email is required" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: oldEmail,
      subject: "Your OTP Code for CalistheniX",
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: `OTP sent successfully to ${oldEmail}` });
    });
  } catch (error) {
    console.error("Error receiving OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/editprofilesettings", verifyToken, async (req, res) => {
  const { user_id, otp, newUsername, newEmail, oldEmail } = req.body;

  try {
    console.log("inserting data");
    const updateProfile = await pool.query(
      `UPDATE users SET email = $1, username = $2 WHERE user_id = $3`,
      [newEmail.trim(), newUsername.trim(), user_id]
    );
    res.status(200).json({ message: "Sucessfully updated profile settings" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

app.post("/deleteroutine", verifyToken, async (req, res) => {
  const { user_id, workout_id } = req.body;
  try {
    const deleteSets = await pool.query(
      `UPDATE sets SET routine = false WHERE workout_id = $1 AND user_id = $2`,
      [workout_id, user_id]
    );

    const deleteExercises = await pool.query(
      `UPDATE exercises SET routine = false WHERE workout_id = $1 AND user_id = $2`,
      [workout_id, user_id]
    );

    const deleteWorkout = await pool.query(
      `UPDATE workouts SET routine = false WHERE workout_id = $1 AND user_id = $2`,
      [workout_id, user_id]
    );
    res.status(200).json({ message: "Routine deleted successfully" });
  } catch (error) {
    console.error("Error receiving data:", error);
  }
});

app.get("/leaderboardstats", verifyToken, async (req, res) => {
  try {
    const workoutStats = await pool.query(
      `SELECT workout_id, user_id FROM workouts WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`,
      []
    );

    const workoutTime = await pool.query(
      `SELECT workout_id, user_id, workout_time FROM workouts WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`
    );

    const users = await pool.query(`SELECT user_id, username FROM users`);

    res.status(200).json({
      workoutStats: workoutStats.rows,
      users: users.rows,
      workoutTime: workoutTime.rows,
    });
  } catch (error) {
    console.error("Error getting data:", error);
  }
});

app.get("/getusers", verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const users = await pool.query(
      `SELECT user_id, username, profile_pic FROM users WHERE user_id != $1`,
      [userId]
    );

    const workouts = await pool.query(
      `SELECT user_id, COUNT(*) AS workout_count FROM workouts GROUP BY user_id ORDER BY workout_count DESC`
    );

    const followers = await pool.query(
      `SELECT follower_id, following_id
FROM followers;

`
    );

    res.status(200).json({
      users: users.rows,
      workouts: workouts.rows,
      followers: followers.rows,
      current_user_id: userId,
    });
  } catch (err) {
    console.error("Error getting data:", err);
  }
});

app.post("/followuser", verifyToken, async (req, res) => {
  const { follower_id, following_id } = req.body;
  try {
    const insertFollower = await pool.query(
      `INSERT INTO followers(follower_id, following_id) VALUES($1, $2)`,
      [follower_id, following_id]
    );

    console.log(insertFollower.rowCount);
  } catch (err) {
    console.error("Error inserting follower", err);
  }
});

app.post("/unfollowuser", verifyToken, async (req, res) => {
  const { follower_id, following_id } = req.body;
  try {
    const deleteFollower = await pool.query(
      `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`,
      [follower_id, following_id]
    );

    console.log(deleteFollower);
  } catch (err) {
    console.error("Error inserting follower", err);
  }
});

app.post("/removefollower", verifyToken, async (req, res) => {
  const { currentUsersId, followersUserId } = req.body;
  console.log(currentUsersId, followersUserId);
  try {
    const deleteFollower = await pool.query(
      `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`,
      [followersUserId, currentUsersId]
    );

    res.status(200).json({ message: "Follower removed successfully" });
  } catch (err) {
    console.error("Error inserting follower", err);
  }
})

app.get("/userdetails", async (req, res) => {
  const { user_id } = req.query;

  try {
    const userDetails = await pool.query(
      `SELECT username, name FROM users WHERE user_id = $1`,
      [user_id]
    );

    const followers = await pool.query(
      `SELECT follower_id FROM followers WHERE following_id = $1`,
      [user_id]
    );

    const following = await pool.query(
      `SELECT following_id FROM followers WHERE follower_id = $1`,
      [user_id]
    );

    res.status(200).json({
      userDetails: userDetails.rows,
      followers: followers.rows,
      following: following.rows,
    });
  } catch (err) {
    console.error("Error getting users profile details", err);
  }
});

app.post("/changepassword", verifyToken, async (req, res) => {
  const { user_id, currentPassword, newPassword } = req.body;

  const passwordHash = await pool.query(
    "SELECT password_hash FROM users WHERE user_id = $1",
    [user_id]
  );

  const isMatch = await bcrypt.compare(
    currentPassword.trim(),
    passwordHash.rows[0].password_hash.trim()
  );

  console.log(passwordHash.rows[0].password_hash.trim());
  console.log(isMatch);

  if (!isMatch) {
    return res.status(401).json({ error: "Invalid password" });
  }

  if (currentPassword.trim() === newPassword.trim()) {
    return res.status(402).json({
      error: "New password cannot be the same as the current password",
    });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  const insertHashedNewPassword = await pool.query(
    "UPDATE users SET password_hash = $1 WHERE user_id = $2",
    [hashedNewPassword, user_id]
  );

  res.status(200).json({ message: "Password changed successfully" });
  console.log(insertHashedNewPassword);
});

app.get("/getfollowstats", verifyToken, async (req, res) => {
  try {
  const { user_id } = req.query;

  const followers = await pool.query(
    `SELECT follower_id FROM followers WHERE following_id = $1`,
    [user_id]
  );

  const following = await pool.query(
    `SELECT following_id FROM followers WHERE follower_id = $1`,
    [user_id]
  );


  const followerIds = followers.rows.map((row) => row.follower_id);
  const followingIds = following.rows.map((row) => row.following_id);

  let followerUsers = [];
  let followingUsers = [];

  if (followerIds.length > 0) {
    followerUsers = await pool.query(
      `SELECT * FROM users WHERE user_id = ANY($1)`,
      [followerIds]
    );
  }
  
  if (followingIds.length > 0) {
    followingUsers = await pool.query(
      `SELECT * FROM users WHERE user_id = ANY($1)`,
      [followingIds]
    );
  }
  

  res.status(200).json({
    followers: followerUsers.rows,
    following: followingUsers.rows
  });
} catch (error) {
  console.error("Error getting follow stats:", error);
  res.status(500).send({ message: "Failed to get data" });
}
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
