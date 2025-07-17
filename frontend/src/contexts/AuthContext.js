import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function signup(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        return updateProfile(result.user, {
          displayName: displayName
        });
      })
      .catch((error) => {
        console.error('Signup error:', error);
        throw error;
      });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        console.error('Login error:', error);
        throw error;
      });
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider)
      .catch((error) => {
        console.error('Google login error:', error);
        throw error;
      });
  }

  function logout() {
    return signOut(auth)
      .catch((error) => {
        console.error('Logout error:', error);
        throw error;
      });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setCurrentUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
        toast.error('Authentication error occurred');
      }
    );

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}