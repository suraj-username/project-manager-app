import { TaskState } from './TaskState.js';

/**
 * Represents a task that has been completed.
 * Transitions: moveBackToInProgress -> 'In Progress'
 */
export class DoneState extends TaskState {
  moveBackToInProgress(user) {
    // FR3.6: Any team member can move
    if (!this.isTeamMember(user)) {
      throw new Error('Not authorized: You are not a member of this project.');
    }
    if (this.task.assignees.length === 0) {
      throw new Error(
        'Cannot move back to "In Progress" without an assignee. Please re-assign.'
      );
    }
    this.task.status = 'In Progress';
  }
}
