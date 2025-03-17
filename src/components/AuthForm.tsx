
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, EyeOff, Eye, Loader2 } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (mode === 'signin') {
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              email,
            }
          }
        });
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: mode === 'signin' ? 'Welcome back!' : 'Account created!',
        description: mode === 'signin'
          ? 'You have successfully signed in.'
          : 'Your account has been created successfully.',
      });

      navigate('/discover');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => setMode(mode === 'signin' ? 'signup' : 'signin');
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-xl shadow-lg border border-border/40">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'signin'
            ? 'Sign in to continue to Values'
            : 'Create a new account to get started'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="pl-10"
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-2.5 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-sm text-primary hover:underline"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
