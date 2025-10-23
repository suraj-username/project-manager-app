// server/config/passport.js
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';
import User from '../models/user.model.js'; // Make sure this path is correct

// We will export this function as the default
export default function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        // PULL THESE FROM YOUR .env FILE
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback', // Your full callback URL
      },
      async (accessToken, refreshToken, profile, done) => {
        // This is the verify callback, using modern async/await
        const newUser = {
          googleId: profile.id,
          name: profile.displayName, // Changed from displayName to name
          email: profile.emails[0].value,
          // image: profile.photos[0].value, // Make sure 'image' is in your User schema
        };

        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, log them in
            return done(null, user);
          } else {
            // Create a new user (FR1.2)
            user = await User.create(newUser);
            return done(null, user);
          }
        } catch (err) {
          console.error(err);
          return done(err, null);
        }
      }
    )
  );

  // Serializes user into the session
  passport.serializeUser((user, done) => {
    done(null, user.id); // Store just the user's _id in the session
  });

  // Deserializes user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user); // Attach the full user object to req.user
    } catch (err) {
      done(err, null);
    }
  });
}