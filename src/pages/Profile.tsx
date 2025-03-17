import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Edit, Heart, MessageCircle, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { getValueSelections, determineValuePattern } from "@/services/valueService";

interface ProfileFormValues {
  full_name: string;
  location: string;
  bio: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: '',
      location: '',
      bio: ''
    }
  });
  
  // Fetch profile data
  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  
  // Fetch value selections to determine patterns
  const { data: valueSelections } = useQuery({
    queryKey: ['valueSelections'],
    queryFn: getValueSelections,
    enabled: !!user
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', user.id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      refetchProfile();
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error(error);
    }
  });
  
  // Handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  // Effect to update form values when profile data changes
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      form.reset({
        full_name: profileData.full_name || '',
        location: profileData.location || '',
        bio: profileData.bio || ''
      });
    }
  }, [profileData, form]);
  
  // Calculate value patterns
  const valuePatterns = valueSelections ? [
    { 
      name: profile?.value_pattern || 'Undefined', 
      percentage: 78 
    },
    { 
      name: "Balanced Achiever", 
      percentage: 65 
    },
    { 
      name: "Curious Explorer", 
      percentage: 52 
    }
  ] : [];
  
  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/30"></div>
        
        <div className="absolute left-0 right-0 -bottom-16 flex justify-center">
          <Avatar className="w-32 h-32 rounded-full border-4 border-background">
            <AvatarImage 
              src={profile?.avatar_url || "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1935&auto=format&fit=crop"}
              alt="Profile"
            />
            <AvatarFallback className="text-2xl">
              {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <div className="mt-20 px-6 space-y-8">
        <div className="text-center profile-section">
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2 mt-4">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{profile?.full_name || user?.email || 'User'}</h1>
              <p className="text-muted-foreground">
                {profile?.location ? `${profile.location}` : 'No location set'}
              </p>
              
              <div className="flex justify-center gap-3 mt-4">
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => setIsEditing(!isEditing)} 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-10 w-10"
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-10 w-10 text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="space-y-2 profile-section">
          <h2 className="text-lg font-medium">About me</h2>
          {isEditing ? (
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ) : (
            <p className="text-muted-foreground">
              {profile?.bio || "No bio yet. Click edit to add one!"}
            </p>
          )}
        </div>
        
        <div className="profile-section">
          <h2 className="text-lg font-medium mb-4">Your Value Patterns</h2>
          <div className="space-y-4">
            {valuePatterns.map((pattern, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{pattern.name}</span>
                  <span className="text-muted-foreground">{pattern.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${pattern.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 rounded-full">
            See All Value Insights
          </Button>
        </div>
        
        <div className="profile-section">
          <h2 className="text-lg font-medium mb-4">Activity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-secondary/50">
              <Heart className="h-7 w-7 text-primary mb-2" />
              <span className="text-xl font-medium">0</span>
              <span className="text-sm text-muted-foreground">Matches</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-secondary/50">
              <MessageCircle className="h-7 w-7 text-primary mb-2" />
              <span className="text-xl font-medium">0</span>
              <span className="text-sm text-muted-foreground">Conversations</span>
            </div>
          </div>
        </div>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Profile;
