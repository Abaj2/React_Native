const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4005;
const postgresPassword = process.env.PASSWORD;
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

app.use(express.json());
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

  try {
    const progressionsArray = [progression];
    const currentArray = [current];
    const goalArray = [goal];

    if (req.user.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this data" });
    }

    const result = await pool.query(
      "INSERT INTO skills (skill, progressions, current, goal, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING skill, progressions, current, goal, user_id",
      [skill.trim(), progressionsArray, currentArray, goalArray, user_id]
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/addprogression", verifyToken, async (req, res) => {
  try {
    const { skill, addProgressionTrimmed, addCurrent, addGoal, user_id } =
      req.body;

    const result = await pool.query(
      "UPDATE skills set progressions = CASE WHEN user_id = $1 AND skill = $2 THEN array_append(progressions, $3) ELSE progressions END, current = CASE WHEN user_id = $1 AND skill = $2 THEN array_append(current, $4) ELSE current END, goal = CASE WHEN user_id = $1 AND skill = $2 THEN array_append(goal, $5) ELSE goal END WHERE user_id = $1 AND skill = $2",
      [user_id, skill, addProgressionTrimmed, addCurrent, addGoal]
    );

    console.log("Inserted progressions");

    if (req.user.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this data" });
    }
    res.status(200).json({ message: "Received skills" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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

    console.log(
      "SQL Variables:",
      editIndex,
      editProgressionNameTrimmed,
      user_id,
      skill
    );

    if (editProgression !== editProgressionNameTrimmed) {
      const updateName = await pool.query(
        `UPDATE skills SET progressions[$1] = $2 WHERE user_id = $3 AND skill = $4`,
        [editIndex + 1, editProgressionNameTrimmed, user_id, skill]
      );
      console.log(`Number of rows affected: ${updateName.rowCount}`);
    }
    if (editCurrent !== oldCurrent) {
      const updateCurrent = await pool.query(
        `UPDATE skills SET current[$1] = $2 WHERE user_id = $3 AND skill = $4`,
        [editIndex + 1, editCurrent, user_id, skill]
      );
    }
    if (editGoal !== oldGoal) {
      const updateGoal = await pool.query(
        `UPDATE skills SET goal[$1] = $2 WHERE user_id = $3 AND skill = $4`,
        [editIndex + 1, editGoal, user_id, skill]
      );
    }
    res.status(201).json({ message: "Updated name for progression" });

    console.log("Edited Progressions");

    if (req.user.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this data" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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

    const addWorkout = await pool.query(
      `INSERT INTO workouts(user_id, title, level, date) VALUES($1, $2, $3, $4) RETURNING workout_id`,
      [user_id, workoutSummary.title, workoutSummary.level, workoutSummary.date]
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
          `INSERT INTO sets(exercise_id, reps, duration, notes, completed, user_id, workout_id) VALUES($1, $2, $3, $4, $5, $6, $7)`,
          [exercise_id, set.reps, set.duration, set.notes, set.completed, user_id, workout_id]
        );
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/getworkouts", verifyToken, async (req, res) => {
  console.log("Received Request")
  const userId = req.user.user_id;

  const userWorkouts = await pool.query("SELECT * FROM workouts WHERE user_id = $1", [
    userId
  ]);
  const userExercises = await pool.query("SELECT * FROM exercises WHERE user_id = $1", [
    userId
  ])
  const userSets = await pool.query("SELECT * FROM sets WHERE user_id = $1", [
    userId
  ])
  
  res.status(200).json({ workouts: userWorkouts.rows, exercises: userExercises.rows, sets: userSets.rows });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
