export class TaskState {
  constructor(task, project) {
    this.task = task;
    this.project = project;
  }

  isProjectCreator(user) {
    return user._id.toString() === this.project.projectCreator.toString();
  }

  isTeamMember(user) {
    const userId = user._id.toString();
    if (this.isProjectCreator(user)) return true;
    
    return this.project.teamMembers.some(
      (memberId) => memberId.toString() === userId
    );
  }

  // CORRECTED: Using template literal backticks (`) instead of single quotes (')
  throwForbidden(action) {
    throw new Error(`Action '${action}' is not allowed in state '${this.task.status}'.`);
  }

  approve(user) {
    this.throwForbidden('approve');
  }

  moveToInProgress(user, assignees) {
    this.throwForbidden('moveToInProgress');
  }

  moveToDone(user) {
    this.throwForbidden('moveToDone');
  }

  moveBackToToDo(user) {
    this.throwForbidden('moveBackToToDo');
  }

  moveBackToInProgress(user) {
    this.throwForbidden('moveBackToInProgress');
  }

  changePriority(user, newPriority) {
    if (!this.isProjectCreator(user)) {
      throw new Error('Not authorized: Only the project creator can change priority.');
    }
    this.task.priority = newPriority;
  }
}