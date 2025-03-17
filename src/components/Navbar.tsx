
import { Link, useLocation } from 'react-router-dom';
import { Heart, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/discover', icon: <Search className="w-5 h-5" />, label: 'Discover' },
    { path: '/', icon: <Heart className="w-5 h-5" />, label: 'Home' },
    { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 py-3 bg-background/90 backdrop-blur-xl border-t border-border animate-fade-in">
      <nav className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 px-6 py-2.5 rounded-full transition-all duration-300",
              location.pathname === item.path
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;
