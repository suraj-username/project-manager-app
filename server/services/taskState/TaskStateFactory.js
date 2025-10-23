import { PendingApprovalState } from './PendingApproval.js';
import { ToDoState } from './ToDoState.js';
import { InProgressState } from './InProgressState.js';
import { DoneState } from './DoneState.js';

/**
 * A factory function that creates the appropriate state object
 * based on the task's current status string.
 *
 * @param {Object} task - The Mongoose task document
 * @param {Object} project - The Mongoose project document
 * @returns {TaskState} An instance of a concrete state class
 */
export const createTaskState = (task, project) => {
  switch (task.status) {
    case 'Pending Approval':
      return new PendingApprovalState(task, project);
    case 'To Do':
      return new ToDoState(task, project);
    case 'In Progress':
      return new InProgressState(task, project);
    case 'Done':
      return new DoneState(task, project);
    default:
      throw new Error(`Invalid task status: ${task.status}`);
  }
};
