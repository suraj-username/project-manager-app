import React, { useState } from 'react';
import apiClient from '../services/apiClient';

const EditTaskModal = ({ task, onClose, onTaskUpdated }) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Task name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient(`/api/tasks/${task._id}`, {
        method: 'PUT',
        data: {
          name: name.trim(),
          description: description.trim(),
        },
      });

      alert('Task updated successfully.');
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating task:', err);
      alert(`Error updating task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit Task: {task.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-task-name">Name:</label>
            <input
              id="edit-task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-task-description">Description:</label>
            <textarea
              id="edit-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="(Optional)"
              rows="3"
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              variant="outline"
              onClick={onClose}
              className="button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;