import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GuestModeContextType {
  isGuest: boolean;
  isAuthenticated: boolean;
  showAuthPrompt: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  requireAuth: (message?: string) => boolean;
  closeAuthPrompt: () => void;
  authPromptMessage: string;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export const GuestModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');

  useEffect(() => {
    // Check if guest mode is active from localStorage
    const guestMode = localStorage.getItem('guest_mode') === 'true';
    setIsGuest(guestMode);

    // Check authentication status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      // If user is authenticated, exit guest mode
      if (user) {
        localStorage.removeItem('guest_mode');
        setIsGuest(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        localStorage.removeItem('guest_mode');
        setIsGuest(false);
        setShowAuthPrompt(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const enterGuestMode = useCallback(() => {
    localStorage.setItem('guest_mode', 'true');
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    localStorage.removeItem('guest_mode');
    setIsGuest(false);
  }, []);

  const requireAuth = useCallback((message?: string): boolean => {
    if (isAuthenticated) return true;
    
    if (isGuest) {
      setAuthPromptMessage(message || 'Đăng ký tài khoản để tương tác với cộng đồng FUN Charity');
      setShowAuthPrompt(true);
      return false;
    }
    
    return false;
  }, [isAuthenticated, isGuest]);

  const closeAuthPrompt = useCallback(() => {
    setShowAuthPrompt(false);
    setAuthPromptMessage('');
  }, []);

  return (
    <GuestModeContext.Provider
      value={{
        isGuest,
        isAuthenticated,
        showAuthPrompt,
        enterGuestMode,
        exitGuestMode,
        requireAuth,
        closeAuthPrompt,
        authPromptMessage,
      }}
    >
      {children}
    </GuestModeContext.Provider>
  );
};

export const useGuestMode = () => {
  const context = useContext(GuestModeContext);
  if (context === undefined) {
    throw new Error('useGuestMode must be used within a GuestModeProvider');
  }
  return context;
};
