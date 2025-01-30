const express = require("express");
const { OAuth2Client } = require("google-auth-library");
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
  user: "postgres",
  host: "localhost",
  database: "calisthenix",
  password: postgresPassword,
  port: 5432,
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
  const { email, username, password, confirmPassword } = req.body;
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
      "INSERT INTO users(email, username, password_hash) VALUES ($1, $2, $3) RETURNING user_id, email, username",
      [email, username, hashedPassword]
    );

    const token = generateJWT(result.rows[0]);
    const user = result.rows[0];

    res.status(201).json({
      message: "User created successfully",
      user: {
        username: user.username,
        email: user.email,
        user_id: user.user_id,
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

    res.status(200).json({
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
        user_id: user.user_id,
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
    const userId = req.user.user_id;

    const result = await pool.query("SELECT * FROM skills WHERE user_id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No skill found" });
    }
    res.status(200).json({ skills: result.rows });
    console.log(JSON.stringify(result.rows));
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
    console.log(user_id);
    console.log(workoutSummary.title);
    console.log(workoutSummary.level);
    console.log(workoutSummary.date);
    console.log(workoutSummary.duration);

    const addWorkout = await pool.query(
      `INSERT INTO workouts(user_id, title, level, duration) VALUES($1, $2, $3, $4) RETURNING workout_id`,
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
  console.log("Received Request");
  const userId = req.user.user_id;

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
      `INSERT INTO workouts(user_id, title, custom, level, duration) values($1, $2, $3, $4, $5) RETURNING workout_id`,
      [user_id, title.trim(), true, level, duration]
    );
    console.log(`Number of rows affected: ${addWorkout.rowCount}`);
    const workout_id = addWorkout.rows[0].workout_id;

    for (const exercise of workoutSummary) {
      const addExercise = await pool.query(
        `INSERT INTO exercises(workout_id, name, user_id) values($1, $2, $3) RETURNING exercise_id`,
        [workout_id, exercise.name, user_id]
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
          `INSERT INTO sets(exercise_id, reps, duration, notes, user_id, workout_id) VALUES($1, $2, $3, $4, $5, $6)`,
          [
            exercise_id,
            integerReps,
            integerDuration,
            set.notes,
            user_id,
            workout_id,
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
  const { profile_pic, username } = req.body;

  if (!profile_pic) {
    return res.status(400).send({ message: "No file uploaded." });
  }

  const imageBuffer = Buffer.from(profile_pic, "base64");

  try {
    const query = `UPDATE users SET profile_pic = $1 WHERE username = $2`;
    const values = [imageBuffer, username];

    await pool.query(query, values);
    res.send({ message: "Profile picture uploaded successfully" });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).send({ message: "Failed to upload profile picture. " });
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
      `SELECT duration FROM workouts WHERE user_id = $1`,
      [user_id]
    );
    console.log(totalDuration);

    const stats = {
      totalWorkouts: totalWorkouts.rows.length,
      totalSkills: totalSkills.rows.length,
      totalDuration: totalDuration.rows,
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
      `SELECT EXTRACT(EPOCH FROM SUM(duration::interval)) AS total_duration_seconds
FROM workouts
WHERE date >= date_trunc('week', NOW()) AND date < date_trunc('week', NOW()) + INTERVAL '7 days' AND user_id = $1;
`,
      [user_id]
    );

    const lastWeekDuration = await pool.query(
      `SELECT EXTRACT(EPOCH FROM SUM(duration::interval)) AS total_duration_seconds
       FROM workouts
       WHERE date >= date_trunc('week', NOW()) - INTERVAL '7 days'
       AND date < date_trunc('week', NOW()) 
       AND user_id = $1`,
      [user_id]
    );

    const getCustomWorkouts = await pool.query(
      `SELECT title FROM workouts WHERE custom = true AND user_id = $1`,
      [user_id]
    )
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
