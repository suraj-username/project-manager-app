import React from 'react';

/**
 * This is the public-facing login page.
 * Its only job is to provide a button that links to our
 * backend's Google OAuth route.
 */
function LoginPage() {
  const handleLogin = () => {
    // This doesn't use `fetch`. We just redirect the entire window
    // to the backend route. The backend will then take over and
    // redirect the user to Google.
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="login-container">
      <h1>Project Manager</h1>
      <p>Please log in to continue</p>
      <button onClick={handleLogin} className="login-button">
        Login with Google
      </button>
    </div>
  );
}

export default LoginPage;
