import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    // Check current session
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    }
  }

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      
      if (error) {
        console.error('Supabase auth error:', error.message);
        throw new Error(error.message);
      }
      
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed - no user data received');
      }
    } catch (error: any) {
      console.error('Login error:', error.message || error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password.trim(),
        options: {
          data: {
            name: userData.name?.trim()
          }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error.message);
        throw new Error(error.message);
      }
      
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Registration failed - no user data received');
      }
    } catch (error: any) {
      console.error('Registration error:', error.message || error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error.message);
        throw new Error(error.message);
      }
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error('Error logging out:', error.message || error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};