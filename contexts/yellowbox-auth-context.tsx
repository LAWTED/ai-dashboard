"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface YellowBoxAuthContextType {
  userId: string;
  isAuthenticated: boolean;
  handleLogout: () => Promise<void>;
}

const YellowBoxAuthContext = createContext<YellowBoxAuthContextType | null>(null);

interface YellowBoxAuthProviderProps {
  children: ReactNode;
}

export function YellowBoxAuthProvider({ children }: YellowBoxAuthProviderProps) {
  const [userId, setUserId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setIsAuthenticated(true);
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserId("");
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
      router.push("/yellowbox/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to log out");
    }
  };

  if (!isInitialized) {
    return null;
  }

  const contextValue: YellowBoxAuthContextType = {
    userId,
    isAuthenticated,
    handleLogout,
  };

  return (
    <YellowBoxAuthContext.Provider value={contextValue}>
      {children}
    </YellowBoxAuthContext.Provider>
  );
}

export function useYellowBoxAuth() {
  const context = useContext(YellowBoxAuthContext);
  if (!context) {
    throw new Error('useYellowBoxAuth must be used within a YellowBoxAuthProvider');
  }
  return context;
}