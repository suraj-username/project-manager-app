import { TaskState } from './TaskState.js';

/**
 * Represents a task that is actively being worked on.
 * Transitions: moveToDone -> 'Done'
 * Transitions: moveBackToToDo -> 'To Do'
 */
export class InProgressState extends TaskState {
  moveToDone(user) {
    // FR3.6: Any team member can move
    if (!this.isTeamMember(user)) {
      throw new Error('Not authorized: You are not a member of this project.');
    }
    this.task.status = 'Done';
  }

  moveBackToToDo(user) {
    // FR3.6: Any team member can move
    if (!this.isTeamMember(user)) {
      throw new Error('Not authorized: You are not a member of this project.');
    }
    this.task.status = 'To Do';
    this.task.assignees = [];
  }
}
