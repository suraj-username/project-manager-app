import React, { useState } from 'react';
import apiClient from '../services/apiClient';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';

const TaskCard = ({ task, subtasks = [], project, currentUser, onRefresh }) => {
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isCreator = currentUser?._id === project?.projectCreator?._id;
  const isSubtask = !!task.parentId;
  // Any team member can edit task details
  const isTeamMember = project?.teamMembers?.some(member => member._id === currentUser?._id) || isCreator;


  // --- API Call Handlers ---
  const updateStatus = async (action, assignees = null) => {
    if (isSubtask) {
        alert("Subtask status cannot be changed directly.");
        return;
    }
    try {
      const payload = { action };
      if (assignees) payload.assignees = assignees;
      await apiClient(`/api/tasks/${task._id}/status`, { method: 'PUT', data: payload });
      onRefresh();
    } catch (err) {
      console.error(`Error performing action ${action}:`, err);
      alert(`Error: ${err.message}`);
    }
  };
  const handleApprove = () => updateStatus('approve');
  const handleSetPriority = async (newPriority) => {
     if (isSubtask) {
        alert("Subtask priority cannot be changed directly.");
        return;
    }
    try {
      await apiClient(`/api/tasks/${task._id}/priority`, { method: 'PUT', data: { priority: newPriority } });
      onRefresh();
    } catch (err) {
      console.error('Error changing priority:', err);
      alert(`Error: ${err.message}`);
    }
  };
  const handleMoveSimple = (action) => {
    if (isSubtask) return;
     switch(action) {
        case 'Done': updateStatus('moveToDone'); break;
        case 'To Do': updateStatus('moveBackToToDo'); break;
        case 'In Progress': updateStatus('moveBackToInProgress'); break;
        default: console.error("Unknown simple move action:", action);
     }
  };
  const handleStartTask = () => {
    if (isSubtask) return;
    const assignees = [currentUser._id]; // Placeholder
    if (!assignees || assignees.length === 0) {
        alert("Cannot move to 'In Progress' without assignees.");
        return;
    }
    updateStatus('moveToInProgress', assignees);
  };
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this ${isSubtask ? 'subtask' : 'task and its subtasks'}?`)) {
      try {
        await apiClient(`/api/tasks/${task._id}`, { method: 'DELETE' });
        onRefresh();
      } catch (err) {
        console.error('Error deleting task:', err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  // --- Allowed Actions ---
  const allowedActions = () => {
    const actions = {
        canApprove: false,
        canSetPriority: false,
        canMoveToToDo: false,
        canMoveToInProgress: false,
        canMoveToDone: false,
        canMoveBackToInProgress: false,
        canDelete: false,
        canAddSubtask: !isSubtask,
        canEdit: isTeamMember,
      };

      if (isCreator) {
        actions.canSetPriority = !isSubtask;
        actions.canDelete = true;
      }

      if (!isSubtask) {
        switch (task.status) {
          case 'Pending Approval':
            if (isCreator) actions.canApprove = true;
            break;
          case 'To Do':
            actions.canMoveToInProgress = true;
            break;
          case 'In Progress':
            actions.canMoveToDone = true;
            actions.canMoveBackToToDo = true;
            break;
          case 'Done':
            actions.canMoveBackToInProgress = true;
            break;
          default: break;
        }
    }
    return actions;
  };

  const actions = allowedActions();

  return (
    <div className={`task-card ${isSubtask ? 'subtask-card' : ''}`}>
      <h4>{task.name}</h4>
      <p>{task.description || 'No description'}</p>
      <div className="task-meta">
        <span className={`task-priority-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
         {!isSubtask && task.assignees && task.assignees.length > 0 && (
          <div className="task-assignees">
            Assigned: {task.assignees.map(a => a.name || '...').join(', ')}
          </div>
        )}
         {isSubtask && (
             <span className={`subtask-status-${task.status === 'Done' ? 'done' : 'pending'}`}>
                 {task.status === 'Done' ? 'Completed' : 'Pending'}
             </span>
         )}
      </div>

      <div className="task-actions">
        {actions.canEdit && (
          <button onClick={() => setShowEditModal(true)} className="button-small button-secondary">Edit</button>
        )}
        {actions.canApprove && (
          <button onClick={handleApprove} className="button-small button-approve">Approve</button>
        )}
        {actions.canMoveToInProgress && (
          <button onClick={handleStartTask} className="button-small button-move">Start Task</button>
        )}
        {actions.canMoveToDone && (
          <button onClick={() => handleMoveSimple('Done')} className="button-small button-move">Mark Done</button>
        )}
        {actions.canMoveBackToToDo && (
          <button onClick={() => handleMoveSimple('To Do')} className="button-small button-move">Move to To Do</button>
        )}
        {actions.canMoveBackToInProgress && (
          <button onClick={() => handleMoveSimple('In Progress')} className="button-small button-move">Reopen Task</button>
        )}
        {actions.canSetPriority && (
          <select
            onChange={(e) => handleSetPriority(e.target.value)}
            value={task.priority}
            className="priority-select"
            disabled={isSubtask}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        )}
        {actions.canDelete && (
          <button onClick={handleDelete} className="button-small button-danger">Delete</button>
        )}
        {actions.canAddSubtask && (
          <button onClick={() => setShowSubtaskModal(true)} className="button-small button-secondary">Add Subtask</button>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="subtasks-container">
          <h5>Subtasks:</h5>
          {subtasks.map((subtask) => (
            <TaskCard
              key={subtask._id}
              task={subtask}
              subtasks={[]}
              project={project}
              currentUser={currentUser}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {showSubtaskModal && (
        <CreateTaskModal
          projectId={project._id}
          parentId={task._id}
          onClose={() => setShowSubtaskModal(false)}
          onTaskCreated={onRefresh}
        />
      )}

      {showEditModal && (
        <EditTaskModal
            task={task}
            onClose={() => setShowEditModal(false)}
            onTaskUpdated={onRefresh} // Refresh board after edit
        />
      )}
    </div>
  );
};

export default TaskCard;