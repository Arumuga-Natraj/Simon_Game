// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL pool setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test DB connection
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// POST endpoint to submit a score
app.post('/api/scores', async (req, res) => {
  const { player_name, score } = req.body;
  console.log('📥 Incoming Score Submission:', player_name, score);

  try {
    await pool.query(
      'INSERT INTO scores (player_name, score) VALUES ($1, $2)',
      [player_name, score]
    );
    console.log('✅ Score inserted into DB');
    res.send('Score added successfully');
  } catch (err) {
    console.error('❌ DB Insert Error:', err.message);
    res.status(500).send('Error saving score');
  }
});
  

// GET endpoint to fetch top scores
app.get('/api/scores', async (req, res) => {
  try {
    // Fetch only the top 5 scores sorted by score in descending order
    const result = await pool.query('SELECT * FROM scores ORDER BY score DESC LIMIT 5');
    res.json(result.rows);  // Send only the top 5 scores
  } catch (err) {
    console.error('Error fetching scores:', err);
    res.status(500).send('Error fetching scores');
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
