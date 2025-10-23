// File: client/src/components/EditProjectModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient'; // <-- Import our new client

// This is the EditProjectModal, extracted from DashboardPage
const EditProjectModal = ({ project, onClose, onProjectUpdated }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Note: The original code used `body: JSON.stringify(...)`
      // Our new client handles this if we pass a `data` object.
      // But for consistency with your *original* code, I'll keep it as-is.
      const res = await apiClient(`/api/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
      });

      if (res.unauthorized) return navigate('/login');
      // The new apiClient throws on non-OK status, so we don't need this check

      onProjectUpdated(); // Tell the dashboard to refresh
      onClose(); // Close the modal
    } catch (err) {
      console.error(err);
      alert('Error updating project'); // Keeping your original error alert
    }
  };

  // This is your original HTML/CSS for the modal
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit Project: {project.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="editProjectName">Project Name:</label>
            <input
              type="text"
              id="editProjectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="editProjectDesc">Project Description:</label>
            <textarea
              id="editProjectDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="button-secondary">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;