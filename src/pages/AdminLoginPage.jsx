"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [checking, setChecking] = useState(true);
  const [localError, setLocalError] = useState('');
  
  const { login, signup, checkAdminExists, error: authError, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || '/admin/dashboard';

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        const exists = await checkAdminExists();
        if (isMounted) {
          setIsSetupMode(!exists);
        }
      } catch (err) {
        console.error("Failed to check admin status", err);
        if (isMounted) {
          setLocalError("Could not connect to database. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
      clearError();
    };
  }, [checkAdminExists, clearError]);

  // Sync auth context errors to local state for display
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setLocalError('Email is required');
      toast.error('Email is required');
      return;
    }
    
    if (isSetupMode && password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLocalError('');
    clearError();
    setLoading(true);
    
    try {
      if (isSetupMode) {
        const result = await signup(email, password);
        
        if (result.success) {
          toast.success('Admin account created successfully!');
          router.replace(from);
        } else {
          setLocalError(result.error);
          toast.error(result.error);
          
          if (result.error === 'Email already registered. Please login instead.') {
            setIsSetupMode(false);
            setPassword('');
          }
        }
      } else {
        await login(email, password);
        toast.success('Login successful!');
        router.replace(from);
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setLocalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsSetupMode(!isSetupMode);
    setLocalError('');
    clearError();
  };

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Initializing secure environment...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isSetupMode ? 'Setup Admin' : 'Admin Login'} - Chord Tempo</title>
      </Helmet>

      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 relative">
        <Button variant="ghost" asChild className="mb-6 self-start md:self-auto md:absolute md:top-8 md:left-8 text-muted-foreground hover:text-foreground">
          <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Link>
        </Button>

        <Card className="w-full max-w-md bg-card border-border shadow-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="text-center pb-6 pt-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/20">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              {isSetupMode ? 'Setup Admin' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isSetupMode 
                ? 'Create the master admin account to manage the platform.' 
                : 'Sign in to access the admin dashboard.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {localError && (
              <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 font-medium">{localError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border focus-visible:ring-primary h-12 text-base"
                  placeholder="admin@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border focus-visible:ring-primary h-12 text-base"
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete={isSetupMode ? "new-password" : "current-password"}
                />
                {isSetupMode && (
                  <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters long.</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold mt-4 transition-all active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isSetupMode ? 'Creating Account...' : 'Authenticating...'}
                  </>
                ) : (
                  isSetupMode ? 'Create Admin Account' : 'Login to Dashboard'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="justify-center border-t border-border/50 pt-6 pb-6 bg-muted/10">
            <button 
              type="button"
              onClick={handleSwitchMode}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              disabled={loading}
            >
              {isSetupMode 
                ? "Already have an account? Switch to login" 
                : "Need to setup the first account? Switch to setup"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default AdminLoginPage;