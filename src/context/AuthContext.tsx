import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // For demo purposes, we'll use a simple authentication
    // In a real app, you'd make an API call to authenticate
    if (email === 'admin@otoridvan.com' && password === 'admin123') {
      const userData = {
        id: '1',
        email: email,
        name: 'Admin User'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      await checkAdminStatus(email);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signOut = async () => {
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
