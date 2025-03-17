import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import PersonalityQuestionCard from '@/components/PersonalityQuestionCard';
import { 
  PersonalityQuestion, 
  QuestionCategory,
  UserResponse,
  getAllQuestions, 
  getQuestionCategories,
  getUserResponses,
  calculatePersonalityTraits,
  updateUserPersonalityTraits
} from '@/services/personalityService';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Heart, 
  ChevronRight, 
  Brain,
  LucideIcon,
  Star
} from 'lucide-react';
import cn from 'classnames';

const PersonalityAssessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [userResponses, setUserResponses] = useState<Record<string, UserResponse>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Fetch all questions and categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['questionCategories'],
    queryFn: getQuestionCategories,
    enabled: !!user,
  });

  const { data: allQuestions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['allQuestions'],
    queryFn: getAllQuestions,
    enabled: !!user,
  });

  // Fetch user's existing responses
  const { data: existingResponses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['userResponses'],
    queryFn: getUserResponses,
    enabled: !!user,
  });

  // Calculate and update personality traits
  const updateTraitsMutation = useMutation({
    mutationFn: async () => {
      const traits = await calculatePersonalityTraits();
      await updateUserPersonalityTraits(traits);
      return traits;
    },
    onSuccess: () => {
      toast.success('Your personality profile has been updated!');
      navigate('/discover');
    },
    onError: () => {
      toast.error('Failed to update your personality profile');
    }
  });

  // Process existing responses
  useEffect(() => {
    if (existingResponses && existingResponses.length > 0) {
      const completed = existingResponses.map(r => r.question_id);
      setCompletedQuestions(completed);
      
      const responses: Record<string, UserResponse> = {};
      existingResponses.forEach(r => {
        responses[r.question_id] = r;
      });
      setUserResponses(responses);
    }
  }, [existingResponses]);

  // Get current filteredQuestions based on active category
  const filteredQuestions = allQuestions ? 
    (activeCategory 
      ? allQuestions.filter(q => q.category_id === activeCategory)
      : allQuestions)
    : [];

  // Get incomplete questions
  const incompleteQuestions = filteredQuestions.filter(
    q => !completedQuestions.includes(q.id)
  );

  // Calculate progress percentage
  const progressPercentage = allQuestions && allQuestions.length > 0
    ? Math.round((completedQuestions.length / allQuestions.length) * 100)
    : 0;

  // Handle question completion
  const handleQuestionComplete = (questionId: string) => {
    if (!completedQuestions.includes(questionId)) {
      setCompletedQuestions(prev => [...prev, questionId]);
    }
    
    if (incompleteQuestions.length > 1) {
      // Move to next question in current category
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < incompleteQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        setCurrentQuestionIndex(0);
      }
    } else if (allQuestions && completedQuestions.length + 1 >= allQuestions.length) {
      // All questions completed
      setIsComplete(true);
    } else {
      // Find next category with incomplete questions
      findNextCategoryWithIncompleteQuestions();
    }
  };

  // Find next category with incomplete questions
  const findNextCategoryWithIncompleteQuestions = () => {
    if (!categories || !allQuestions) return;
    
    const allCompleted = allQuestions.every(q => completedQuestions.includes(q.id));
    if (allCompleted) {
      setIsComplete(true);
      return;
    }
    
    // First, try to find a category after the current one
    if (activeCategory) {
      const categoryIndex = categories.findIndex(c => c.id === activeCategory);
      
      for (let i = categoryIndex + 1; i < categories.length; i++) {
        const categoryId = categories[i].id;
        const hasIncomplete = allQuestions.some(
          q => q.category_id === categoryId && !completedQuestions.includes(q.id)
        );
        
        if (hasIncomplete) {
          setActiveCategory(categoryId);
          setCurrentQuestionIndex(0);
          return;
        }
      }
    }
    
    // If no categories after current, check from beginning
    for (const category of categories) {
      const hasIncomplete = allQuestions.some(
        q => q.category_id === category.id && !completedQuestions.includes(q.id)
      );
      
      if (hasIncomplete) {
        setActiveCategory(category.id);
        setCurrentQuestionIndex(0);
        return;
      }
    }
    
    // If we reach here, all questions are complete
    setIsComplete(true);
  };

  // Choose a category
  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentQuestionIndex(0);
  };

  // Complete assessment
  const handleComplete = () => {
    updateTraitsMutation.mutate();
  };

  // Show loading state
  if (isLoadingCategories || isLoadingQuestions || isLoadingResponses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show completed state
  if (isComplete) {
    return (
      <div className="min-h-screen p-6 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center items-center text-center gap-6">
          <div className="bg-primary/10 p-6 rounded-full">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold">Assessment Complete!</h1>
          
          <p className="text-muted-foreground">
            You've answered all the personality questions. Your responses will help us find better matches for you based on shared values and compatibility.
          </p>
          
          <div className="space-y-4 w-full">
            <Button 
              onClick={handleComplete} 
              className="w-full" 
              size="lg"
              disabled={updateTraitsMutation.isPending}
            >
              {updateTraitsMutation.isPending ? 'Processing...' : 'Continue to Matches'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button variant="outline" onClick={() => navigate('/profile')} className="w-full">
              View Your Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If there are incomplete questions but no active category, prompt for category selection
  if (incompleteQuestions.length === 0 && allQuestions && allQuestions.length > 0 && !isComplete) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Choose a Category</h1>
            <p className="text-muted-foreground">
              Select a category to continue answering personality questions
            </p>
            
            <div className="mt-4 flex items-center gap-2">
              <Progress value={progressPercentage} className="h-2" />
              <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {categories?.map((category: QuestionCategory) => {
              const categoryQuestions = allQuestions?.filter(q => q.category_id === category.id) || [];
              const completedCount = categoryQuestions.filter(q => completedQuestions.includes(q.id)).length;
              const isCompleted = completedCount === categoryQuestions.length && categoryQuestions.length > 0;
              
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  className={cn(
                    "w-full justify-between py-6 px-5 h-auto",
                    isCompleted ? "bg-primary/5 border-primary/30" : ""
                  )}
                  onClick={() => handleCategorySelect(category.id)}
                  disabled={isCompleted}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isCompleted ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                    )}>
                      {categoryIcons[category.name] || <Star className="h-5 w-5" />}
                    </div>
                    <div className="text-left">
                      <span className="font-medium">{category.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {completedCount}/{categoryQuestions.length} answered
                      </div>
                    </div>
                  </div>
                  
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Show current question
  const currentQuestion = incompleteQuestions[currentQuestionIndex] || null;
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p>No more questions in this category.</p>
          <Button className="mt-4" onClick={findNextCategoryWithIncompleteQuestions}>
            Continue to Next Category
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="mb-6 sticky top-0 z-10 pt-4 pb-4 bg-background/90 backdrop-blur-md">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-semibold">{categories?.find(c => c.id === currentQuestion.category_id)?.name}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Brain className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <Progress value={progressPercentage} className="h-2 w-full" />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <PersonalityQuestionCard 
          question={{
            ...currentQuestion,
            category: categories?.find(c => c.id === currentQuestion.category_id)
          }}
          onComplete={handleQuestionComplete}
          initialSelectedOption={userResponses[currentQuestion.id]?.option_id}
          initialImportance={userResponses[currentQuestion.id]?.importance || 5}
        />
      </div>
    </div>
  );
};

// Icons for categories
const categoryIcons: Record<string, React.ReactNode> = {
  'Trust and Integrity': <Heart className="h-5 w-5" />,
  'Empathy and Support': <Heart className="h-5 w-5" />,
  'Ambition and Growth': <Star className="h-5 w-5" />,
  'Family and Relationships': <Heart className="h-5 w-5" />,
  'Adventure and Lifestyle': <Star className="h-5 w-5" />,
  'Conflict and Communication': <Heart className="h-5 w-5" />,
  'Loyalty and Commitment': <Heart className="h-5 w-5" />,
  'Personal Values and Ethics': <Star className="h-5 w-5" />,
  'Fun and Lighthearted': <Star className="h-5 w-5" />
};

export default PersonalityAssessment;
