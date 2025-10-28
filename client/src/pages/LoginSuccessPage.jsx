import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * This page has no UI. It is a utility component.
 * Its only job is to:
 * 1. Grab the 'token' from the URL query parameter (e.g., /login/success?token=...).
 * 2. Save that token to localStorage (the browser's persistent storage).
 * 3. Redirect the user to the main dashboard ('/').
 */
function LoginSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      console.log('Token received, saving to localStorage:', token);
      localStorage.setItem('project-manager-token', token);
    } else {
      console.error('No token found in URL.');
    }
    // The `replace: true` option replaces the /login/success page in the
    // browser's history, so the user can't click "back" to it.
    navigate('/', { replace: true });
  }, [searchParams, navigate]);

  // This component renders nothing, as it just redirects.
  return null;
}

export default LoginSuccessPage;