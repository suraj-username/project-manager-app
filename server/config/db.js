const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Access DB connection string from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Export the connectDB function so it can be imported and used in other files
module.exports = connectDB;
