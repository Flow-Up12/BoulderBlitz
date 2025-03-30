import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, ensureUserExists, subscribeToAuthChanges } from '../lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for Auth Context
export type User = {
  id: string;
  email?: string;
  username?: string;
};

export type AuthState = {
  user: any | null;
  session: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  wasAuthenticated?: boolean;
  justLoggedIn?: boolean;
};

type AuthContextType = {
  authState: AuthState;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
};

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  wasAuthenticated: false,
  justLoggedIn: false,
};

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Load initial session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error loading session:', error);
          setAuthState({ ...initialState, loading: false });
          return;
        }
        
        if (session) {
          await handleSession(session);
        } else {
          // No session found, set loading to false and clear auth state
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAuthenticated: false,
            wasAuthenticated: false,
            justLoggedIn: false,
          });
        }
      } catch (error) {
        console.error('Unexpected error loading session:', error);
        // Even on error, we should stop loading
        setAuthState({ ...initialState, loading: false });
      }
    };
    
    // Set a timeout to ensure we don't get stuck loading
    const timeoutId = setTimeout(() => {
      setAuthState(prev => {
        if (prev.loading) {
          console.warn('Auth state loading timed out after 5 seconds');
          return { ...initialState, loading: false };
        }
        return prev;
      });
    }, 5000);
    
    loadSession();
    
    // Set up auth state change listener
    const unsubscribe = subscribeToAuthChanges(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session) {
        await handleSession(session);
      } else {
        setAuthState(prevState => ({
          user: null,
          session: null,
          loading: false,
          isAuthenticated: false,
          wasAuthenticated: prevState.isAuthenticated,
          justLoggedIn: false,
        }));
      }
    });
    
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Handle authenticated session
  const handleSession = async (session) => {
    try {
      // First, ensure user exists in our public.users table
      const { success, error: userError } = await ensureUserExists(
        session.user.id,
        session.user.email
      );
      
      if (!success) {
        console.warn('Failed to ensure user exists in database:', userError);
      }
      
      // Load user profile
      await loadUserProfile(session.user.id);
      
      setAuthState({
        user: session.user,
        session: session,
        loading: false,
        isAuthenticated: true,
        wasAuthenticated: true,
        justLoggedIn: true,
      });
    } catch (error) {
      console.error('Error handling session:', error);
      setAuthState({
        user: session.user,
        session: session,
        loading: false,
        isAuthenticated: true,
        wasAuthenticated: true,
        justLoggedIn: false,
      });
    }
  };
  
  // Load user profile from our database
  const loadUserProfile = async (userId = null) => {
    try {
      const id = userId || authState.user?.id;
      
      if (!id) {
        console.error('Cannot load user profile: No user ID');
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }
      
      // Update auth state with additional user profile data
      if (data) {
        setAuthState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            username: data.username,
            profile: data,
          },
        }));
      }
    } catch (error) {
      console.error('Unexpected error loading user profile:', error);
    }
  };
  
  // Sign up a new user
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: email.split('@')[0],
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };
  
  // Sign in an existing user
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        throw error;
      }
      
      // Set the justLoggedIn flag to true
      if (data.session) {
        setAuthState(prevState => ({
          ...prevState,
          justLoggedIn: true
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };
  
  // Sign out the current user
  const signOut = async () => {
    try {
      // Get game context to save data before signing out
      const { saveGame } = require('./GameContext');
      
      // Save game state before signing out
      if (typeof saveGame === 'function') {
        console.log('Saving game state before signing out');
        await saveGame();
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false,
        wasAuthenticated: authState.isAuthenticated,
        justLoggedIn: false,
      });
    } catch (error) {
      console.error('Unexpected error signing out:', error);
    }
  };

  // Provide the auth context value
  const value = {
    authState,
    signUp,
    signIn,
    signOut,
    loadUserProfile,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 