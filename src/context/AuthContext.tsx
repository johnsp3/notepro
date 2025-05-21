import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOut } from '../services/firebaseAuth';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signIn = async (): Promise<void> => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Auth context sign-in error:', error);
      throw error;
    }
  };

  // Sign out
  const logOut = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error('Auth context sign-out error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isLoading,
    signIn,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 