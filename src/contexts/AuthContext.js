import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  // Check if Firebase is properly configured
  const isFirebaseConfigured = () => {
    return process.env.REACT_APP_FIREBASE_API_KEY && 
           process.env.REACT_APP_FIREBASE_API_KEY !== 'your_api_key_here';
  };

  // Demo login function for when Firebase is not configured
  const demoLogin = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@coreerp.com' && password === 'demo123') {
          const demoUser = {
            uid: 'demo-user',
            email: 'demo@coreerp.com',
            displayName: 'Demo User'
          };
          setUser(demoUser);
          resolve({ user: demoUser });
        } else {
          reject(new Error('Demo credentials: demo@coreerp.com / demo123'));
        }
      }, 1000);
    });
  };

  // Sign up function
  const signup = async (email, password, displayName) => {
    if (demoMode) {
      throw new Error('Sign up not available in demo mode');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in function
  const login = (email, password) => {
    if (demoMode) {
      return demoLogin(email, password);
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign out function
  const logout = () => {
    if (demoMode) {
      return new Promise((resolve) => {
        setUser(null);
        resolve();
      });
    }
    return signOut(auth);
  };

  // Reset password function
  const resetPassword = (email) => {
    if (demoMode) {
      throw new Error('Password reset not available in demo mode');
    }
    return sendPasswordResetEmail(auth, email);
  };

  // Update user profile
  const updateUserProfile = (updates) => {
    if (demoMode) {
      throw new Error('Profile update not available in demo mode');
    }
    return updateProfile(auth.currentUser, updates);
  };

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, using demo mode');
      setDemoMode(true);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth state change error:', error);
      setError(error);
      setDemoMode(true);
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    loading,
    error,
    demoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
