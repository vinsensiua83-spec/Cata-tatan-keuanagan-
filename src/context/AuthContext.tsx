import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, fbSignOut } from '../lib/firebase';

interface AuthContextType {
  user: User | { uid: string; email: string; displayName: string; photoURL: string | null } | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  enableDemoMode: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USER = {
  uid: 'demo_user_123',
  email: 'pengguna.demo@dompetku.id',
  displayName: 'Pengguna Demo',
  photoURL: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | typeof DEMO_USER | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode was active
    const savedDemo = localStorage.getItem('dompetku_demo_mode') === 'true';

    // If auth is unavailable (e.g. offline or Firebase failed), immediately unlock app
    if (!auth) {
      setUser(savedDemo ? DEMO_USER : null);
      setIsDemoMode(savedDemo);
      setLoading(false);
      return;
    }

    // Safety timeout: ensure loading state never hangs longer than 2 seconds
    const timeoutId = setTimeout(() => {
      setLoading(false);
      if (savedDemo) {
        setUser(DEMO_USER);
        setIsDemoMode(true);
      }
    }, 2000);

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          clearTimeout(timeoutId);
          if (firebaseUser) {
            setUser(firebaseUser);
            setIsDemoMode(false);
            localStorage.removeItem('dompetku_demo_mode');
          } else if (savedDemo) {
            setUser(DEMO_USER);
            setIsDemoMode(true);
          } else {
            setUser(null);
            setIsDemoMode(false);
          }
          setLoading(false);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('Auth state error, fallback to local/demo:', error);
          if (savedDemo) {
            setUser(DEMO_USER);
            setIsDemoMode(true);
          }
          setLoading(false);
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('onAuthStateChanged call failed:', err);
      if (savedDemo) {
        setUser(DEMO_USER);
        setIsDemoMode(true);
      }
      setLoading(false);
    }

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      enableDemoMode();
      return;
    }
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      setIsDemoMode(false);
      localStorage.removeItem('dompetku_demo_mode');
    } catch (error) {
      console.error('Google Sign In Error:', error);
      // If popup was blocked or failed, offer demo mode seamlessly
      enableDemoMode();
    } finally {
      setLoading(false);
    }
  };

  const enableDemoMode = () => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
    localStorage.setItem('dompetku_demo_mode', 'true');
  };

  const signOut = async () => {
    try {
      if (isDemoMode) {
        localStorage.removeItem('dompetku_demo_mode');
        setUser(null);
        setIsDemoMode(false);
      } else if (auth) {
        await fbSignOut(auth);
      }
    } catch (error) {
      console.error('Sign Out Error:', error);
    } finally {
      setUser(null);
      setIsDemoMode(false);
      localStorage.removeItem('dompetku_demo_mode');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        signInWithGoogle,
        enableDemoMode,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
