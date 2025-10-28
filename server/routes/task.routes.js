import express from 'express';
import protect from '../middleware/auth.middleware.js';
import {
  isTaskTeamMember,
  isTaskProjectCreator,
} from '../middleware/taskAuthorization.js';
import {
  deleteTask,
  updateTaskStatus,
  changeTaskPriority,
  updateTask,
} from '../controllers/task.controller.js';

const router = express.Router();

// Route for updating status (PUT /api/tasks/:taskId/status)
router
  .route('/:taskId/status')
  .put(protect, isTaskTeamMember, updateTaskStatus);

// Route for updating priority (PUT /api/tasks/:taskId/priority)
router
  .route('/:taskId/priority')
  .put(protect, isTaskProjectCreator, changeTaskPriority); 

// Route for general task operations
router
  .route('/:taskId')
  .put(protect, isTaskTeamMember, updateTask)
  .delete(protect, isTaskProjectCreator, deleteTask);

export default router;