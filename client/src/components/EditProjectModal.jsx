import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const EditProjectModal = ({ project, onClose, onProjectUpdated }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient(`/api/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
      });

      if (res.unauthorized) return navigate('/login');

      onProjectUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error updating project');
    }
  };

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