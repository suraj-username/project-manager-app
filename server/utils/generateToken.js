const jwt = require('jsonwebtoken');

// This function generates a signed JWT.
// It takes the user's MongoDB ID as a payload.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The token will be valid for 30 days
  });
};

module.exports = generateToken;