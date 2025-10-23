// File: client/src/components/CreateTaskModal.jsx
import React, { useState } from 'react';
import apiClient from '../services/apiClient'; // <-- NOW IT WORKS

const CreateTaskModal = ({
  projectId,
  parentId = null,
  onClose,
  onTaskCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { toast } = useToast(); // We are not using this

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Task name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        data: {
          name,
          description,
          parentId,
        },
      });

      alert('New task created and sent for approval.');
      onTaskCreated(); // This refreshes the task list
      onClose(); // This closes the modal
    } catch (err) {
      console.error(err);
      alert(`Error Creating Task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // This JSX now matches the style of your EditProjectModal
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{parentId ? 'Create New Subtask' : 'Create New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-name">Name:</label>
            <input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-description">Description:</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="(Optional)"
              rows="3"
            />
          </div>
          <div className="modal-actions">
            <button type="button" variant="outline" onClick={onClose} className="button-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="button-primary">
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;