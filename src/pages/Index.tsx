
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to discover
  if (user) {
    return <Navigate to="/discover" replace />;
  }

  // If user is not authenticated, redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default Index;
