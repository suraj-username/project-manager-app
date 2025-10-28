import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import EditProjectModal from '../components/EditProjectModal';

const ProjectCard = ({ project, currentUser, onRefresh }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const isCreator = project.projectCreator?._id === currentUser?._id;

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await apiClient(`/api/projects/${project._id}`, { method: 'DELETE' });
        alert('Project Deleted');
        onRefresh();
      } catch (err) {
        alert(`Error deleting project: ${err.message}`);
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberEmail) return;
    try {
      await apiClient(`/api/projects/${project._id}/team`, {
        method: 'POST',
        data: { email: addMemberEmail },
      });
      alert('Member Added');
      setAddMemberEmail('');
      onRefresh();
    } catch (err) {
      alert(`Error adding member: ${err.message}`);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await apiClient(`/api/projects/${project._id}/team/${userId}`, {
          method: 'DELETE',
        });
        alert('Member Removed');
        onRefresh();
      } catch (err) {
        alert(`Error removing member: ${err.message}`);
      }
    }
  };

  const onProjectUpdated = () => {
    onRefresh();
    setShowEditModal(false);
  };

  return (
    <>
      <div className="project-card">
        {isCreator && (
          <div className="admin-controls">
            <button onClick={() => setShowEditModal(true)} className="button-icon">
              Edit
            </button>
            <button
              onClick={handleDeleteProject}
              className="button-icon button-danger"
            >
              Delete
            </button>
          </div>
        )}

        <Link to={`/project/${project._id}`}>
          <h3>{project.name}</h3>
        </Link>

        <p>{project.description || 'No Description'}</p>
        <small className="creator-info">
          Creator: {project.projectCreator?.name || 'N/A'} (
          {project.projectCreator?.email || 'N/A'})
        </small>

        <h4>Team Members:</h4>
        <ul>
          {project.teamMembers?.length > 0 ? (
            project.teamMembers.map((member) => (
              <li key={member._id} className="team-member-item">
                <span>
                  {member.name} ({member.email})
                </span>
                {/* Prevent removing creator/self */}
                {isCreator && member._id !== project.projectCreator?._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="button-remove"
                  >
                    &times;
                  </button>
                )}
              </li>
            ))
          ) : (
            <li>No team members yet.</li>
          )}
        </ul>

        {isCreator && (
          <form onSubmit={handleAddMember} className="add-member-form">
            <input
              type="email"
              placeholder="Add user by email"
              value={addMemberEmail}
              onChange={(e) => setAddMemberEmail(e.target.value)}
              required
            />
            <button type="submit">Add</button>
          </form>
        )}
      </div>

      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onProjectUpdated={onProjectUpdated}
        />
      )}
    </>
  );
};

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projectsData, userData] = await Promise.all([
        apiClient('/api/projects'),
        apiClient('/api/users/profile'),
      ]);

      if (projectsData.unauthorized || userData.unauthorized) {
        navigate('/login');
        return;
      }

      setProjects(projectsData || []);
      setCurrentUser(userData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName) {
      alert('Project name is required.');
      return;
    }
    try {
      await apiClient('/api/projects', {
        method: 'POST',
        data: {
          name: projectName,
          description: projectDescription,
        },
      });
      alert('Project created!');
      setProjectName('');
      setProjectDescription('');
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(`Error creating project: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('project-manager-token');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="error-message">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>My Dashboard</h2>
        {currentUser && <span className="user-greeting">Hi, {currentUser.name}</span>}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="form-container">
        <h3>Create a New Project</h3>
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label htmlFor="projectName">Project Name:</label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="projectDesc">Project Description:</label>
            <textarea
              id="projectDesc"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows="3"
            />
          </div>
          <button type="submit" className="create-button">
            Create Project
          </button>
        </form>
      </div>

      <div className="projects-container">
        <h3>My Projects</h3>
        {isLoading && <p>Loading Projects....</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && projects.length === 0 && (
          <p>You are not part of any projects yet.</p>
        )}
        <div className="project-list">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              currentUser={currentUser}
              onRefresh={fetchData}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;