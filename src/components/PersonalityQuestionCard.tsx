
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  PersonalityQuestion, 
  QuestionOption, 
  saveUserResponse 
} from '@/services/personalityService';
import { CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from './ui/badge';

interface PersonalityQuestionCardProps {
  question: PersonalityQuestion;
  onComplete: (questionId: string) => void;
  initialSelectedOption?: string;
  initialImportance?: number;
}

const PersonalityQuestionCard = ({ 
  question, 
  onComplete,
  initialSelectedOption,
  initialImportance = 5
}: PersonalityQuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(initialSelectedOption || null);
  const [importance, setImportance] = useState<number>(initialImportance);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = async (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleImportanceChange = (value: number[]) => {
    setImportance(value[0]);
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    try {
      setIsSubmitting(true);
      setIsAnimating(true);
      
      await saveUserResponse(question.id, selectedOption, importance);
      
      setTimeout(() => {
        onComplete(question.id);
        setIsAnimating(false);
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Failed to save your response. Please try again.');
      setIsAnimating(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(
      "personality-question-card w-full mx-auto bg-card border border-border rounded-xl shadow-lg overflow-hidden transition-all duration-300",
      isAnimating && "animate-scale-out opacity-0"
    )}>
      <div className="p-6 border-b border-border/50">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xl font-medium leading-relaxed">{question.question_text}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="mt-1 h-8 w-8 text-muted-foreground">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-80">
                <p>{question.insight_description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Badge variant="outline" className="mt-2 text-xs bg-primary/5 text-primary/80 border-primary/20">
          {question.category?.name || 'Personality Question'}
        </Badge>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          {question.options?.map((option: QuestionOption) => (
            <Button
              key={option.id}
              variant="outline"
              className={cn(
                "w-full justify-start p-4 h-auto text-left transition-all",
                selectedOption === option.id 
                  ? "ring-2 ring-primary bg-primary/5 border-primary/30" 
                  : "hover:bg-accent hover:border-primary/20"
              )}
              onClick={() => handleSelect(option.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={cn(
                  "w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                  selectedOption === option.id 
                    ? "border-primary bg-primary/10" 
                    : "border-muted-foreground"
                )}>
                  {selectedOption === option.id && (
                    <CheckCircle className="w-4 h-4 text-primary animate-scale-in" />
                  )}
                </div>
                <span className="block text-wrap break-words">{option.option_text}</span>
              </div>
            </Button>
          ))}
        </div>
        
        {selectedOption && (
          <div className="pt-4 space-y-4 animate-fade-in">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-muted-foreground">How important is this to you?</label>
                <span className="text-sm font-medium">
                  {importance < 4 ? 'Not very important' : 
                   importance < 7 ? 'Somewhat important' : 
                   'Very important'}
                </span>
              </div>
              <Slider
                defaultValue={[importance]}
                max={10}
                min={1}
                step={1}
                value={[importance]}
                onValueChange={handleImportanceChange}
                className="py-2"
              />
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityQuestionCard;
