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
    throw new Error('useAuth must be used within an AuthProvider');
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
    return process.env.REACT_APP_FIREBASE_API_KEY && 
           process.env.REACT_APP_FIREBASE_API_KEY !== 'your_api_key_here';
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
