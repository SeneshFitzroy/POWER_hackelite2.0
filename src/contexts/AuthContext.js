import React, { createContext, useContext, useState, useEffect } from 'react';

// Safely import Firebase functions with error handling
let signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile, auth;

try {
  const firebaseAuth = require('firebase/auth');
  signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
  createUserWithEmailAndPassword = firebaseAuth.createUserWithEmailAndPassword;
  signOut = firebaseAuth.signOut;
  onAuthStateChanged = firebaseAuth.onAuthStateChanged;
  sendPasswordResetEmail = firebaseAuth.sendPasswordResetEmail;
  updateProfile = firebaseAuth.updateProfile;
  
  const firebaseConfig = require('../firebase/config');
  auth = firebaseConfig.auth;
} catch (error) {
  console.error('Firebase import error:', error);
}

const AuthContext = createContext();

// User role definitions with specific permissions
const USER_ROLES = {
  'john.ceo.pharma@gmail.com': {
    role: 'OWNER',
    name: 'John CEO',
    permissions: ['hr', 'sales', 'pos', 'inventory', 'coldchain', 'legal', 'ecommerce', 'delivery', 'reports', 'settings']
  },
  'john.reg.pharma@gmail.com': {
    role: 'PHARMACIST',
    name: 'John Registered Pharmacist',
    permissions: ['sales', 'pos', 'inventory', 'delivery', 'legal', 'ecommerce']
  },
  'john.assit.pharma@gmail.com': {
    role: 'ASSISTANT_PHARMACIST',
    name: 'John Assistant Pharmacist',
    permissions: ['pos', 'inventory', 'delivery', 'ecommerce']
  },
  'john.cashier.pharma@gmail.com': {
    role: 'CASHIER',
    name: 'John Cashier',
    permissions: ['pos']
  }
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within an AuthProvider - returning fallback context');
    // Return a fallback context to prevent app crashes
    return {
      user: null,
      userRole: null,
      hasPermission: () => false,
      signup: () => Promise.reject(new Error('Auth not initialized')),
      login: () => Promise.reject(new Error('Auth not initialized')),
      logout: () => Promise.resolve(),
      resetPassword: () => Promise.reject(new Error('Auth not initialized')),
      updateUserProfile: () => Promise.reject(new Error('Auth not initialized')),
      loading: false,
      error: new Error('Auth context not available'),
      demoMode: true
    };
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  // Check if Firebase is properly configured
  const isFirebaseConfigured = () => {
    try {
      return process.env.REACT_APP_FIREBASE_API_KEY && 
             process.env.REACT_APP_FIREBASE_API_KEY !== 'your_api_key_here';
    } catch (error) {
      console.error('Error checking Firebase config:', error);
      return false;
    }
  };

  // Get user role information based on email
  const getUserRoleInfo = (email) => {
    return USER_ROLES[email] || null;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!userRole || !userRole.permissions) return false;
    return userRole.permissions.includes(permission);
  };

  // Demo login function for when Firebase is not configured
  const demoLogin = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if it's one of our specific users
        const roleInfo = getUserRoleInfo(email);
        
        if (roleInfo) {
          // Check password based on email
          let expectedPassword = '';
          switch (email) {
            case 'john.ceo.pharma@gmail.com':
              expectedPassword = 'JohnCEO2002';
              break;
            case 'john.reg.pharma@gmail.com':
              expectedPassword = 'JohnReg2002';
              break;
            case 'john.assit.pharma@gmail.com':
              expectedPassword = 'JohnAssit2002';
              break;
            case 'john.cashier.pharma@gmail.com':
              expectedPassword = 'JohnCash2002';
              break;
            default:
              expectedPassword = 'demo123';
          }

          if (password === expectedPassword) {
            const demoUser = {
              uid: `demo-${email.split('@')[0]}`,
              email: email,
              displayName: roleInfo.name
            };
            setUser(demoUser);
            setUserRole(roleInfo);
            resolve({ user: demoUser });
          } else {
            reject(new Error('Invalid password'));
          }
        } else if (email === 'demo@coreerp.com' && password === 'demo123') {
          const demoUser = {
            uid: 'demo-user',
            email: 'demo@coreerp.com',
            displayName: 'Demo User'
          };
          setUser(demoUser);
          setUserRole({
            role: 'DEMO',
            name: 'Demo User',
            permissions: ['hr', 'sales', 'pos', 'inventory', 'coldchain', 'legal']
          });
          resolve({ user: demoUser });
        } else {
          reject(new Error('Invalid credentials. Use the provided email/password combinations.'));
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

  // Sign in function with role-based authentication
  const login = async (email, password) => {
    if (demoMode) {
      return demoLogin(email, password);
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Set role information after successful Firebase login
      const roleInfo = getUserRoleInfo(email);
      if (roleInfo) {
        setUserRole(roleInfo);
      } else {
        // If user exists in Firebase but not in our role system, give basic access
        setUserRole({
          role: 'USER',
          name: result.user.displayName || 'User',
          permissions: ['pos'] // Basic permission
        });
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Sign out function
  const logout = () => {
    if (demoMode) {
      return new Promise((resolve) => {
        setUser(null);
        setUserRole(null);
        resolve();
      });
    }
    setUserRole(null);
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
    // Always set loading to false initially to prevent context errors
    setLoading(false);
    
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, using demo mode');
      setDemoMode(true);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        
        // If user is logged in, get their role information
        if (firebaseUser) {
          const roleInfo = getUserRoleInfo(firebaseUser.email);
          if (roleInfo) {
            setUserRole(roleInfo);
          } else {
            // Default role for users not in our system
            setUserRole({
              role: 'USER',
              name: firebaseUser.displayName || 'User',
              permissions: ['pos']
            });
          }
        } else {
          setUserRole(null);
        }
        
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
    userRole,
    hasPermission,
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
