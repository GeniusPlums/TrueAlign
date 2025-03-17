
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Values in Action",
    description: "Discover meaningful connections based on how you actually live your values, not just what you say you value.",
    image: "/placeholder.svg"
  },
  {
    title: "Real Scenarios",
    description: "Respond to life scenarios that reveal your true priorities and values in a natural way.",
    image: "/placeholder.svg"
  },
  {
    title: "Authentic Matching",
    description: "Find people who truly align with your lifestyle and worldview, beyond superficial preferences.",
    image: "/placeholder.svg"
  }
];

const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      // Complete onboarding
      navigate('/discover');
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-accent/30 p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-12 rounded-full bg-primary/10 p-8 shadow-xl border border-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10 animate-pulse-slow"></div>
              <img 
                src={slides[currentSlide].image} 
                alt="Onboarding illustration" 
                className="w-48 h-48 object-contain relative z-10"
              />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">{slides[currentSlide].title}</h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-sm">{slides[currentSlide].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-auto pt-8">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div 
                key={index} 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "bg-primary scale-125" 
                    : "bg-primary/20"
                }`}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleNext} 
            className="rounded-full px-6 shadow-lg bg-primary hover:bg-primary/90"
            size="lg"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
            <ChevronRight className="ml-1 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
