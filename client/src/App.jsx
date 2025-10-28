import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Page to handle token after successful Google login */}
        <Route path="/login/success" element={<LoginSuccessPage />} />

        {/* This route handles URLs like /project/60c7a3f5b9... */}
        <Route path="/project/:projectId" element={<ProjectDetailPage />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;