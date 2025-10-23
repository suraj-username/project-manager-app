import express from 'express';
import passport from 'passport';
// We'll need to fix generateToken next, but let's assume it's fixed for now
import generateToken from '../utils/generateToken.js'; 
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
    const token = generateToken(req.user.id);

    // This is the URL of our React frontend.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to a frontend route to handle the token
    res.redirect(`${frontendUrl}/login/success?token=${token}`);
  }
);

export default router;