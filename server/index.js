const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load the environment variables from the .env file.
dotenv.config();

connectDB();

const app = express();

// Access PORT from .env with fallback
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
