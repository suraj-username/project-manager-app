import jwt from 'jsonwebtoken'
import User from '../models/user.model.js';

const protect = async (req, res, next) => {
  let token;

  // Check if the request headers contain the 'authorization' header
  // and if it starts with 'Bearer'.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the 'Authorization' header.
      // It's in the format 'Bearer TOKEN', so we split by space and take the second part.
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our JWT_SECRET.
      // This function will throw an error if the token is invalid or expired.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database using the ID that was embedded in the token.
      // We exclude the password field from the returned user object for security.
      req.user = await User.findById(decoded.id).select('-password');

      // If the user is found, call the next middleware in the chain.
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // If no token is found in the header, the request is unauthorized.
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

export default protect;