// File: server/controllers/task.controller.js
import Project from '../models/Project.js';
import User from '../models/user.model.js';
import Task from '../models/Task.js'; // Ensure Task is imported
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createTaskState } from '../services/taskState/TaskStateFactory.js';

// @desc Creating a new task or subtask
// @route POST /api/projects/:projectId/tasks
// @access Private (Team Member) - We add this protection in routes later
export const createTask = asyncHandler(async (req, res) => {
  const { name, description, parentId } = req.body; // parentId might be null
  const { projectId } = req.params;

  if (!name) {
    res.status(400);
    throw new Error('Task name is required');
  }

  // Ensure project exists (middleware might handle this later too)
  const project = req.project; // Assuming isTeamMember middleware ran
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const taskData = {
    name,
    description: description || '',
    project: projectId,
    createdBy: req.user._id, // User ID from 'protect' middleware
    status: 'Pending Approval', // Default state
    priority: 'Low', // Default priority
    parentId: parentId || null,
  };

  // --- SUBTASK LOGIC CHANGE ---
  if (parentId) {
    const parentTask = await Task.findById(parentId);
    if (!parentTask) {
      res.status(404);
      throw new Error('Parent task not found.');
    }
    // Prevent nesting subtasks under existing subtasks
    if (parentTask.parentId) {
       res.status(400);
       throw new Error('Cannot create a subtask under another subtask.');
    }
    // Subtasks inherit parent priority initially & simplify status concept
    taskData.priority = parentTask.priority; // Inherit
    // We could add a simple boolean 'isDone' field for subtasks,
    // but for now, we'll just manage their display/interaction on the frontend.
    // Let's keep the standard status field but prevent frontend changes.
  }
  // --- END SUBTASK LOGIC CHANGE ---

  const task = await Task.create(taskData);

  res.status(201).json(task);
});

// @desc Get all tasks for a specific project
// @route GET /api/projects/:projectId/tasks
// @access Private (Team Member)
export const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const tasks = await Task.find({ project: projectId })
    .populate('createdBy', 'name email') // Populate creator details
    .populate('assignees', 'name email'); // Populate assignee details

  // Define priority order for sorting
  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

  // Sort primarily by priority, then maybe by creation date?
  tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // Optional: Add secondary sort, e.g., by creation date
      // return new Date(a.createdAt) - new Date(b.createdAt);
      return 0; // Or keep original order if priorities match
  });


  // Separate root tasks and subtasks
  const rootTasks = [];
  const subtasksMap = {}; // Use a map for easier lookup: { parentId: [subtasks] }

  tasks.forEach(task => {
    if (task.parentId) {
      const parentIdStr = task.parentId.toString();
      if (!subtasksMap[parentIdStr]) {
        subtasksMap[parentIdStr] = [];
      }
      subtasksMap[parentIdStr].push(task);
    } else {
      rootTasks.push(task);
    }
  });

   // Ensure subtasks within each parent are also sorted (optional but good)
   for (const parentId in subtasksMap) {
       subtasksMap[parentId].sort((a, b) => {
            // Subtasks don't have independent priority/status logic per user req.
            // Sort by creation date or name perhaps?
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
   }


  res.status(200).json({ root: rootTasks, subtasks: subtasksMap });
});


// @desc Delete a task and its subtasks
// @route DELETE /api/tasks/:taskId
// @access Private (Project Creator)
export const deleteTask = asyncHandler(async (req, res) => {
  const task = req.task; // Assuming isTaskProjectCreator middleware attached the task

  // Find and delete all direct subtasks first
  await Task.deleteMany({ parentId: task._id });

  // Delete the main task
  await Task.deleteOne({ _id: task._id });

  res.status(200).json({ message: 'Task and its subtasks deleted successfully.' });
});

// @desc Update task status based on action
// @route PUT /api/tasks/:taskId/status
// @access Private (Team Member, with specific actions restricted by state/role)
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { action, assignees } = req.body;
  const task = req.task; // Assuming isTaskTeamMember middleware attached the task
  const project = req.project; // Assuming isTaskTeamMember middleware attached the project
  const user = req.user;

  // Prevent status changes on subtasks directly (frontend should hide buttons)
  if (task.parentId) {
      res.status(400);
      throw new Error('Cannot change status of a subtask directly.');
  }

  const state = createTaskState(task, project);

  // Use a switch or if/else based on the action string
  switch (action) {
    case 'approve':
      state.approve(user);
      break;
    case 'moveToInProgress':
      // Ensure assignees are provided and are valid IDs (basic check)
      if (!assignees || !Array.isArray(assignees) || assignees.length === 0) {
         res.status(400);
         throw new Error('Assignees array is required to move task to In Progress.');
      }
      // TODO: We could add validation here to check if assignees are actual team members
      state.moveToInProgress(user, assignees);
      break;
    case 'moveToDone':
      state.moveToDone(user);
      break;
    case 'moveBackToToDo':
        state.moveBackToToDo(user);
        break;
    case 'moveBackToInProgress':
       state.moveBackToInProgress(user);
       break;
    default:
      res.status(400);
      throw new Error(`Invalid action: ${action}`);
  }

  const updatedTask = await task.save();

  // Populate necessary fields before sending back
  await updatedTask.populate('createdBy', 'name email');
  await updatedTask.populate('assignees', 'name email');

  res.status(200).json(updatedTask);
});

// @desc Change task priority
// @route PUT /api/tasks/:taskId/priority
// @access Private (Project Creator)
export const changeTaskPriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  const task = req.task; // Assuming isTaskProjectCreator middleware attached the task
  const project = req.project;
  const user = req.user;

   // Prevent priority changes on subtasks directly (frontend should hide buttons)
   if (task.parentId) {
        res.status(400);
        throw new Error('Cannot change priority of a subtask directly.');
    }


  if (!['Low', 'Medium', 'High'].includes(priority)) {
    res.status(400);
    throw new Error('Invalid priority value.');
  }

  // Use the state object just for the permission check inside changePriority
  const state = createTaskState(task, project);
  state.changePriority(user, priority); // This throws if not creator, and sets task.priority

  const updatedTask = await task.save();

  // Populate necessary fields
  await updatedTask.populate('createdBy', 'name email');
  await updatedTask.populate('assignees', 'name email');

  res.status(200).json(updatedTask);
});

// @desc    Update a task's details (name, description)
// @route   PUT /api/tasks/:taskId
// @access  Private (Team Member)
export const updateTask = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const task = req.task; // Assuming isTaskTeamMember middleware attached the task

  // Basic validation
  if (name !== undefined && !name.trim()) {
    res.status(400);
    throw new Error('Task name cannot be empty.');
  }

  // Update fields if they were provided in the request body
  if (name !== undefined) {
    task.name = name.trim();
  }
  if (description !== undefined) {
    task.description = description.trim();
  }

  const updatedTask = await task.save();

  // Populate necessary fields before sending back
  await updatedTask.populate('createdBy', 'name email');
  await updatedTask.populate('assignees', 'name email');

  res.status(200).json(updatedTask);
});