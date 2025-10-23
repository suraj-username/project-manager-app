import Task from '../models/Task.js';
import Project from '../models/Project.js'; // We need this for populating
import { asyncHandler } from './asyncHandler.js';
/**
 * @desc Middleware to check if the user is a team member (or creator) of the project
 * that the task belongs to.
 */
export const isTaskTeamMember = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  const project = await Project.findById(task.project);
  if (!project) {
    res.status(404);
    throw new Error('Project associated with this task not found');
  }
  const creatorId = project.projectCreator.toString();
  const isMember = project.teamMembers.some(
    (memberId) => memberId.toString() === userId
  );

  if (creatorId === userId || isMember) {
    req.task = task;
    req.project = project;
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized: You are not a member of this project.');
  }
});

/**
 * @desc Middleware to check if the user is the Project Creator of the project
 * that the task belongs to.
 */
export const isTaskProjectCreator = asyncHandler(async (req, res, next) => {
  let project = req.project;
  if (!project) {
    const { taskId } = req.params;
    const userId = req.user.id;
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    project = await Project.findById(task.project);
    if (!project) {
      res.status(404);
      throw new Error('Project associated with this task not found');
    }
    req.task = task;
    req.project = project;
  }
  const creatorId = project.projectCreator.toString();
  if (creatorId !== req.user.id) {
    res.status(403); 
    throw new Error('Not authorized: Only the project creator can perform this action.');
  }
  next();
});