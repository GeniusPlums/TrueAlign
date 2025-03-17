
import { cn } from '@/lib/utils';
import React from 'react';
import { Heart } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    valuePattern: string;
    photo: string;
    compatibility: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

const ProfileCard = ({ profile, className, style }: ProfileCardProps) => {
  return (
    <div 
      className={cn(
        "rounded-3xl overflow-hidden glass-morph transition-all duration-500 animate-enter shadow-lg hover:shadow-xl border border-white/10",
        className
      )}
      style={style}
    >
      <div className="aspect-[4/5] w-full relative overflow-hidden">
        <img 
          src={profile.photo} 
          alt={profile.name}
          className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 text-white">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-semibold">{profile.name}, {profile.age}</h3>
              <p className="text-white/80">{profile.location}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                <span className="font-medium">{Math.round(profile.compatibility * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-background/80 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary/70" />
          <h4 className="text-lg font-medium">{profile.valuePattern}</h4>
        </div>
        
        <p className="text-muted-foreground">{profile.bio}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
