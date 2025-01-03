require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const port = process.env.PORT || 4003;
const postgresPassword = process.env.PASSWORD;

app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "netflix",
  password: postgresPassword,
  port: 5432,
});

pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL database successfully."))
  .catch((err) =>
    console.error("Failed to connect to the PostgreSQL database:", err)
  );

app.post("/signup", async (req, res) => {
  const { usernameInputValue, passwordInputValue } = req.body;

  try {
    const usernameExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [usernameInputValue]
    );
    if (usernameExists.rows.length > 0) {
      res.status(409).json({ error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(passwordInputValue, 10);

    const result = await pool.query(
      "INSERT INTO users(username, password_hash) VALUES ($1, $2) RETURNING user_id, username",
      [usernameInputValue, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/signin", async (req, res) => {
  const { usernameInputValue, passwordInputValue } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [usernameInputValue]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = result.rows[0];


    const isMatch = await bcrypt.compare(passwordInputValue, user.password_hash);

    if (isMatch) {
      return res.status(200).json({ message: "Login successful", username: user.username });
    } else {
      return res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign in user" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
