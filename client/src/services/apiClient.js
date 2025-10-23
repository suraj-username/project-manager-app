// File: client/src/services/apiClient.js
/**
 * Reusable API Client Function
 * This function handles adding the auth token and error handling for all
 * our 'fetch' requests.
 */
const apiClient = async (url, options = {}) => {
  const token = localStorage.getItem('project-manager-token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle 'data' property for POST/PUT requests (which you use)
  // or 'body' property (which EditProjectModal uses). We'll standardize on 'body'.
  const config = {
    ...options,
    headers,
  };
  if (options.data) {
    config.body = JSON.stringify(options.data);
    delete config.data; // Clean up
  }

  const res = await fetch(url, config);

  if (res.status === 401) {
    console.error('Unauthorized. Logging out.');
    localStorage.removeItem('project-manager-token');
    return { unauthorized: true, status: res.status };
  }

  // Handle non-OK responses that aren't 401
  if (!res.ok) {
    // Try to parse error message from backend
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    } catch {
      // Fallback if body isn't JSON
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  }

  // Handle successful responses
  try {
    const data = await res.json();
    return data;
  } catch {
    // Handle 204 No Content or other empty responses
    return { success: true };
  }
};

export default apiClient;