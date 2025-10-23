// File: client/src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard'; // <-- IMPORT REAL TASK CARD

// Define the columns for our Kanban board
const TASK_COLUMNS = [
  'Pending Approval',
  'To Do',
  'In Progress',
  'Done',
];

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({ root: [], subtasks: {} });
  const [currentUser, setCurrentUser] = useState(null); // <-- NEW STATE
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Memoize tasks into columns for performance
  const taskColumns = useMemo(() => {
    // ... (no changes needed here)
    const columns = {
        'Pending Approval': [],
        'To Do': [],
        'In Progress': [],
        'Done': [],
      };
      tasks.root.forEach((task) => {
        if (columns[task.status]) {
          columns[task.status].push(task);
        }
      });
      return columns;
  }, [tasks.root]);

  // Fetch all data for the page (Project, Tasks, CurrentUser)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all three in parallel
      const [projectData, tasksData, userData] = await Promise.all([
        apiClient(`/api/projects/${projectId}`),
        apiClient(`/api/projects/${projectId}/tasks`),
        apiClient('/api/users/profile'),
      ]);

      if (projectData.unauthorized || tasksData.unauthorized || userData.unauthorized) {
        navigate('/login');
        return;
      }

      setProject(projectData);
      setTasks(tasksData);
      setCurrentUser(userData); // <-- SAVE USER
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... (loading, error, !project checks are the same)
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading project...</p>
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

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Project not found.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
         {/* ... (header is the same) */}
         <div>
          <Link to="/">
            <button className="button-secondary" style={{ marginRight: '1rem' }}>Back</button>
          </Link>
          <h1 style={{ display: 'inline-block' }}>{project.name}</h1>
          <p style={{ color: '#aaa', marginTop: '0.5rem' }}>{project.description}</p>
        </div>
        <button onClick={() => setShowCreateTaskModal(true)} className="create-button">
          Add New Task
        </button>
      </header>

      {/* Kanban Board */}
      <div className="kanban-board">
        {TASK_COLUMNS.map((status) => (
          <div key={status} className="kanban-column">
            <h3>{status}</h3>
            <div className="kanban-column-content">
              {taskColumns[status].length > 0 ? (
                taskColumns[status].map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    // Find subtasks for this specific task
                    subtasks={tasks.subtasks[task._id] || []}
                    project={project} // Pass full project for team member info
                    currentUser={currentUser} // Pass user for permission checks
                    onRefresh={fetchData} // Pass refresh function
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground p-3 text-center" style={{ color: '#888', fontSize: '0.9em' }}>
                  No tasks in this stage.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={fetchData}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;