// File: server/routes/task.routes.js
import express from 'express';
import protect from '../middleware/auth.middleware.js'; // General authentication
import {
  isTaskTeamMember, // Checks if user is on the project for THIS task
  isTaskProjectCreator, // Checks if user is the creator for THIS task's project
} from '../middleware/taskAuthorization.js';
import {
  deleteTask,
  updateTaskStatus,
  changeTaskPriority,
  updateTask, // <-- ADD THIS IMPORT
} from '../controllers/task.controller.js';

const router = express.Router();

// Route for updating status (PUT /api/tasks/:taskId/status)
router
  .route('/:taskId/status')
  .put(protect, isTaskTeamMember, updateTaskStatus);

// Route for updating priority (PUT /api/tasks/:taskId/priority)
router
  .route('/:taskId/priority')
  .put(protect, isTaskProjectCreator, changeTaskPriority); // Only creator

// Route for general task operations (GET - maybe later, PUT, DELETE)
router
  .route('/:taskId')
  // .get(protect, isTaskTeamMember, getTaskById) // We might add GET later if needed
  .put(protect, isTaskTeamMember, updateTask) // <-- ADD THIS ROUTE (Any team member can edit name/desc)
  .delete(protect, isTaskProjectCreator, deleteTask); // Only creator can delete

export default router;