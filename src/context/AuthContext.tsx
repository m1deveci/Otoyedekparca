import React, { createContext, useContext, useState, useEffect } from 'react';
import { logActions } from '../utils/logger';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Start with true

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      checkAdminStatus(userData.email);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAdminStatus = async (email: string) => {
    try {
      // For now, we'll use a simple check
      // In a real app, you'd make an API call to verify admin status
      const adminEmails = ['admin@otoridvan.com'];
      setIsAdmin(adminEmails.includes(email));
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    // Password length validation
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    try {
      // Make API call to authenticate
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      await checkAdminStatus(email);
      
      // Login log
      await logActions.userLogin(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Authentication failed. Please check your credentials.');
    }
  };

  const signOut = async () => {
    // Logout log
    if (user) {
      await logActions.userLogout(user);
    }
    
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
