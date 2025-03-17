import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserResponses } from '@/services/personalityService';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean | null>(null);
  const [checkingAssessment, setCheckingAssessment] = useState(true);
  const location = useLocation();

  // Check if user has completed personality assessment
  useEffect(() => {
    const checkAssessment = async () => {
      if (!user) return;
      
      try {
        // Skip check if already on assessment page
        if (location.pathname === '/personality-assessment') {
          setHasCompletedAssessment(true);
          setCheckingAssessment(false);
          return;
        }
        
        // Get count of questions
        const { count: questionCount, error: questionsError } = await supabase
          .from('personality_questions')
          .select('id', { count: 'exact', head: true });
          
        if (questionsError) throw questionsError;
        
        // Get user responses
        const responses = await getUserResponses();
        
        // Consider assessment completed if user has answered at least 5 questions
        // or 50% of available questions, whichever is lower
        const minRequired = Math.min(5, Math.ceil(questionCount * 0.5));
        setHasCompletedAssessment(responses.length >= minRequired);
        
      } catch (error) {
        console.error('Error checking assessment status:', error);
        // Default to completed if there's an error to avoid blocking the user
        setHasCompletedAssessment(true);
      } finally {
        setCheckingAssessment(false);
      }
    };
    
    if (user && !loading) {
      checkAssessment();
    }
  }, [user, loading, location.pathname]);

  if (loading || checkingAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect to personality assessment if not completed and not already there
  if (hasCompletedAssessment === false && location.pathname !== '/personality-assessment') {
    return <Navigate to="/personality-assessment" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
