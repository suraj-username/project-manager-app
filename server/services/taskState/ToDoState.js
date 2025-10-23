import { TaskState } from './TaskState.js';

/**
 * Represents a task that is approved and ready to be worked on.
 * Transitions: moveToInProgress -> 'In Progress'
 */
export class ToDoState extends TaskState {
  moveToInProgress(user, assignees) {
    // FR3.6: Any team member can move
    if (!this.isTeamMember(user)) {
      throw new Error('Not authorized: You are not a member of this project.');
    }
    // FR3.5: Must have assignees to move to 'In Progress'
    if (!assignees || assignees.length === 0) {
      throw new Error(
        'Cannot move to "In Progress" without at least one assignee.'
      );
    }

    this.task.status = 'In Progress';
    this.task.assignees = assignees;
  }
}
