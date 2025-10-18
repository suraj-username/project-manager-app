const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware.js');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, (req, res) => { // Run the protect middleware and proceed only if protect calls next()
  // The user's information is now available in `req.user`.
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = router;