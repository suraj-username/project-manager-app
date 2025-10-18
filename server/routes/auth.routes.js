const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, generate a token.
    // req.user is available because Passport's `deserializeUser` has run and attached the user to the request.
    const token = generateToken(req.user.id);

    // This is the URL of our React frontend.
    // We will redirect the user to a special route on the frontend
    // and pass the token as a query parameter.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login/success?token=${token}`);
  }
);

module.exports = router;