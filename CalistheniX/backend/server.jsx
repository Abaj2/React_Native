const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4003;
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
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

const generateJWT = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email, username: user.username },
    jwtSecret,
    { expiresIn: "72h" }
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
      // at the top to check instantly
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
    console.log(req.user);

    if (req.user.user_id !== user_id) {
      return res.status(403).json({ error: "Unauthorized to modify this data"})
    }

    const result = await pool.query("INSERT INTO skills (skill, progressions, current, goal, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING skill, progressions, current, goal, user_id",
    [skill, progression, current, goal, user_id])

    res.status(200).json({ message: "Successfully inserted skills" })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" })
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
