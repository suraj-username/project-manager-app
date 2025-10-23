import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // The user's unique ID provided by Google.
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  // The user's full name provided by Google.
  displayName: {
    type: String,
    required: true
  },
  // The user's primary email address provided by Google.
  email: {
    type: String,
    required: true,
    unique: true
  },
  // A URL to the user's profile picture provided by Google.
  image: {
    type: String
  }
}, {
  // Automatically add 'createdAt' and 'updatedAt' fields to the document.
  timestamps: true
});

// Create the User model from the schema - a collection named 'users' (pluralized, lowercase) is created in MongoDB
const User = mongoose.model('User', userSchema);

// Export the model
export default User;
