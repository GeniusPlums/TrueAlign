
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ValueCard from "@/components/ValueCard";
import ProfileCard from "@/components/ProfileCard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { PieChart, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveValueSelection, getValueSelections, determineValuePattern, updateUserValuePattern } from "@/services/valueService";

// Sample data
const valueScenarios = [
  {
    id: "scenario1",
    situation: "Your friend cancels plans at the last minute for the third time this month.",
    options: [
      { 
        id: "1a", 
        text: "Express your frustration and ask them to be more considerate of your time.", 
        valueHint: "Accountability & Respect" 
      },
      { 
        id: "1b", 
        text: "Give them the benefit of the doubt, recognizing they may be going through something difficult.", 
        valueHint: "Empathy & Compassion" 
      },
      { 
        id: "1c", 
        text: "Distance yourself from the friendship as reliability is important to you.", 
        valueHint: "Reliability & Boundaries" 
      },
    ]
  },
  {
    id: "scenario2",
    situation: "You're given an exciting work opportunity, but it requires significant travel.",
    options: [
      { 
        id: "2a", 
        text: "Take it immediately - career growth and new experiences are priorities.", 
        valueHint: "Ambition & Adventure" 
      },
      { 
        id: "2b", 
        text: "Decline - maintaining work-life balance and local connections matter more.", 
        valueHint: "Balance & Community" 
      },
      { 
        id: "2c", 
        text: "Negotiate for a hybrid arrangement that allows some travel but preserves home time.", 
        valueHint: "Flexibility & Compromise" 
      },
    ]
  },
  {
    id: "scenario3",
    situation: "You have an extra $5,000 unexpectedly. What do you do?",
    options: [
      { 
        id: "3a", 
        text: "Invest it for long-term growth - financial security is important.", 
        valueHint: "Security & Planning" 
      },
      { 
        id: "3b", 
        text: "Spend on experiences - a trip you've always wanted to take.", 
        valueHint: "Experience & Spontaneity" 
      },
      { 
        id: "3c", 
        text: "Split it between savings, charity, and a small treat for yourself.", 
        valueHint: "Balance & Generosity" 
      },
    ]
  },
];

const profiles = [
  {
    id: "profile1",
    name: "Alex",
    age: 28,
    location: "San Francisco",
    bio: "Design enthusiast who values creativity and making a positive impact. I believe in finding beauty in the everyday.",
    valuePattern: "Creative & Purposeful",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
    compatibility: 0.87
  },
  {
    id: "profile2",
    name: "Jordan",
    age: 31,
    location: "Chicago",
    bio: "Outdoor adventurer with a passion for sustainability. Looking for someone who shares my values of authenticity and environmental consciousness.",
    valuePattern: "Adventurous & Principled",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop",
    compatibility: 0.92
  },
  {
    id: "profile3",
    name: "Taylor",
    age: 26,
    location: "Austin",
    bio: "Tech entrepreneur by day, musician by night. Believe in balancing ambition with creativity and making time for what truly matters.",
    valuePattern: "Balanced & Ambitious",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
    compatibility: 0.79
  }
];

// Modes: 'values' for answering value questions, 'discover' for browsing profiles
type Mode = 'values' | 'discover';

const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('values');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [matchedProfiles, setMatchedProfiles] = useState<any[]>([]);
  
  // Query to get user's previous value selections
  const { data: valueSelections, isLoading: isLoadingSelections } = useQuery({
    queryKey: ['valueSelections'],
    queryFn: getValueSelections,
    enabled: !!user,
  });
  
  // Mutation to save value selection
  const saveSelectionMutation = useMutation({
    mutationFn: ({ scenarioId, optionId }: { scenarioId: string, optionId: string }) => 
      saveValueSelection(scenarioId, optionId),
    onError: (error) => {
      toast.error('Failed to save your selection');
      console.error(error);
    }
  });
  
  // Effect to check if user has already completed values
  useEffect(() => {
    if (valueSelections && !isLoadingSelections) {
      // If user has already answered all scenarios, go to discover mode
      if (valueSelections.length >= valueScenarios.length) {
        setMode('discover');
        
        // Also determine and update value pattern if needed
        const pattern = determineValuePattern(valueSelections);
        updateUserValuePattern(pattern).catch(console.error);
      }
    }
  }, [valueSelections, isLoadingSelections]);
  
  // Effect to fetch matched profiles when in discover mode
  useEffect(() => {
    const fetchProfiles = async () => {
      if (mode === 'discover' && user) {
        try {
          // Get all profiles except current user
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id);
            
          if (error) throw error;
          
          // Transform profiles and add simulated compatibility
          // In a real app, you'd calculate this based on value selections
          const transformedProfiles = profiles.map(profile => ({
            id: profile.id,
            name: profile.full_name || 'Anonymous',
            age: 25 + Math.floor(Math.random() * 10), // Simulated age
            location: profile.location || 'Nearby',
            bio: profile.bio || 'No bio yet',
            valuePattern: profile.value_pattern || 'Undefined',
            photo: profile.avatar_url || `https://source.unsplash.com/random/300x400?portrait&${profile.id}`,
            compatibility: 0.7 + Math.random() * 0.3 // Simulated 70-100% compatibility
          }));
          
          // Sort by compatibility
          transformedProfiles.sort((a, b) => b.compatibility - a.compatibility);
          setMatchedProfiles(transformedProfiles);
        } catch (error) {
          console.error('Error fetching profiles:', error);
          toast.error('Failed to load matches');
        }
      }
    };
    
    fetchProfiles();
  }, [mode, user]);
  
  const handleSelectOption = async (optionId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Save selection to database
    saveSelectionMutation.mutate({
      scenarioId: valueScenarios[currentScenario].id,
      optionId,
    });
    
    if (currentScenario < valueScenarios.length - 1) {
      // Move to next scenario
      setTimeout(() => {
        setCurrentScenario(prev => prev + 1);
      }, 300);
    } else {
      // Completed all scenarios
      setTimeout(() => {
        // Determine value pattern from selections
        if (valueSelections) {
          const updatedSelections = [
            ...valueSelections,
            { option_id: optionId, scenario_id: valueScenarios[currentScenario].id }
          ];
          const pattern = determineValuePattern(updatedSelections);
          updateUserValuePattern(pattern).catch(console.error);
        }
        
        setMode('discover');
        toast.success('Value assessment complete!');
      }, 300);
    }
  };
  
  const progressPercentage = Math.round(((currentScenario) / valueScenarios.length) * 100);
  
  // Display loading state while checking value selections
  if (isLoadingSelections) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {mode === 'values' ? (
        <div className="min-h-screen flex flex-col p-6">
          <div className="mb-8 sticky top-0 z-10 pt-4 pb-4 bg-background/90 backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <div>
                <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
                  Scenario {currentScenario + 1} of {valueScenarios.length}
                </Badge>
                <h1 className="text-2xl font-semibold">What would you do?</h1>
              </div>
              
              <div className="relative h-16 w-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-muted"></div>
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-primary/20" 
                    strokeWidth="10"
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                  <circle 
                    className="text-primary transition-all duration-500 ease-in-out" 
                    strokeWidth="10"
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                    strokeDasharray={`${progressPercentage * 2.51} 251`}
                    strokeDashoffset="0" 
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="relative z-10 text-lg font-medium">{progressPercentage}%</span>
              </div>
            </div>
            
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <ValueCard 
              situation={valueScenarios[currentScenario].situation}
              options={valueScenarios[currentScenario].options}
              onSelect={handleSelectOption}
            />
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="sticky top-0 z-10 pt-4 pb-4 bg-background/90 backdrop-blur-md mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Your Matches</h1>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1 py-1.5">
                  <PieChart className="w-3.5 h-3.5" /> Compatibility
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 py-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid gap-8 pb-6">
            {matchedProfiles.length > 0 ? (
              matchedProfiles.map((profile, index) => (
                <ProfileCard 
                  key={profile.id} 
                  profile={profile}
                  className="animate-enter"
                  style={{ animationDelay: `${index * 150}ms` }}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No matches found yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Navbar />
    </div>
  );
};

export default Discover;
