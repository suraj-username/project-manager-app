import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Import our custom App.css instead of index.css
import './App.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
