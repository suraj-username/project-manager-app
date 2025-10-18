const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');

// Load the environment variables from the .env file
dotenv.config();

// We pass the `passport` instance to our configuration file and we configure the instance
require('./config/passport')(passport);

connectDB();

const app = express();

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // Don't save session if unmodified
  saveUninitialized: false // Don't create session until something is stored
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session()); // Enables persistent login sessions

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});