import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if there's an access token in localStorage
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    // If no accessToken is found, navigate back to the login page
    return <Navigate to="/" replace />;
  }

  // If there is a valid token in localStorage, render the protected content
  return children;
};

export default ProtectedRoute;