
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ValueCardProps {
  situation: string;
  options: {
    id: string;
    text: string;
    valueHint: string;
  }[];
  onSelect: (optionId: string) => void;
}

const ValueCard = ({ situation, options, onSelect }: ValueCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (optionId: string) => {
    if (selectedOption) return;
    
    setSelectedOption(optionId);
    setIsAnimating(true);
    
    setTimeout(() => {
      onSelect(optionId);
      setIsAnimating(false);
      setSelectedOption(null);
    }, 800);
  };

  return (
    <div className={cn(
      "value-card max-w-md w-full mx-auto bg-card border border-border shadow-lg",
      isAnimating && "animate-scale-out"
    )}>
      <div className="p-7 border-b border-border/50">
        <h3 className="text-xl font-medium leading-relaxed">{situation}</h3>
      </div>
      
      <div className="p-5 space-y-4">
        {options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            className={cn(
              "w-full justify-start p-4 h-auto text-left transition-all duration-300 border border-border/50",
              selectedOption === option.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent hover:border-primary/30"
            )}
            onClick={() => handleSelect(option.id)}
            disabled={!!selectedOption}
          >
            <div className="flex items-start gap-3 w-full pr-2">
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
              <div className="flex-1 min-w-0">
                <span className="block text-wrap break-words">{option.text}</span>
                <span className="text-xs text-primary/70 mt-2 block">{option.valueHint}</span>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ValueCard;
