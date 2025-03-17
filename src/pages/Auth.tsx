import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';

const Auth: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && !loading) {
      navigate('/personality-assessment');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">TrueAlign</h1>
        <p className="text-muted-foreground">
          Connect with people who share your values and personality traits through TrueAlign
        </p>
      </div>
      
      <AuthForm />
    </div>
  );
};

export default Auth;
