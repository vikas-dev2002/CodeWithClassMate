import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, setRedirectUrl } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Save the current URL before redirecting to login
    setRedirectUrl(location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const OrganiserRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, setRedirectUrl } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    setRedirectUrl(location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && user.role !== 'organiser') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
