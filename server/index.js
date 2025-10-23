import 'dotenv/config';
import express from 'express';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './config/passport.js';
configurePassport(passport);
import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/task.routes.js';

connectDB();

const app = express();

app.use(express.json());

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // Don't save session if unmodified
  saveUninitialized: false // Don't create session until something is stored
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session()); // Enables persistent login sessions

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects',projectRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('API is running...');
});
// 404 Not Found handler
app.use(notFound);

// Master error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});