import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, fbSignOut } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<boolean>;
  enableDemoMode: () => void;
  setPersonalUser: (name: string, email: string) => void;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USER: UserProfile = {
  uid: 'demo_user_123',
  email: 'pengguna.demo@dompetku.id',
  displayName: 'Pengguna Demo',
  photoURL: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // 1. Check if user already set a personal account
    const savedCustomUser = localStorage.getItem('dompetku_custom_user');
    if (savedCustomUser) {
      try {
        const parsed = JSON.parse(savedCustomUser) as UserProfile;
        if (parsed && parsed.email) {
          setUser(parsed);
          setIsDemoMode(false);
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem('dompetku_custom_user');
      }
    }

    // 2. Check if demo mode was explicitly active
    const savedDemo = localStorage.getItem('dompetku_demo_mode') === 'true';

    // If auth is unavailable (e.g. offline or Firebase failed), unlock app
    if (!auth) {
      setUser(savedDemo ? DEMO_USER : null);
      setIsDemoMode(savedDemo);
      setLoading(false);
      return;
    }

    // Safety timeout: ensure loading never hangs longer than 2.5s
    const timeoutId = setTimeout(() => {
      setLoading(false);
      if (savedDemo && !user) {
        setUser(DEMO_USER);
        setIsDemoMode(true);
      }
    }, 2500);

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
            localStorage.removeItem('dompetku_custom_user');
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

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    if (!auth || !googleProvider) {
      setAuthError('Firebase Authentication belum terinisialisasi.');
      return false;
    }
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res?.user) {
        setUser(res.user);
        setIsDemoMode(false);
        localStorage.removeItem('dompetku_demo_mode');
        localStorage.removeItem('dompetku_custom_user');
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Google Sign In Error:', err);

      let userMsg = err?.message || 'Gagal masuk dengan Google.';
      if (err?.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        userMsg = `Domain "${domain}" belum diizinkan di Firebase Authentication. Tambahkan domain ini di Firebase Console (Authentication > Settings > Authorized domains) atau gunakan Akun Pribadi di bawah ini.`;
      } else if (err?.code === 'auth/popup-blocked') {
        userMsg = 'Pop-up Google login diblokir oleh peramban (browser). Mohon izinkan pop-up untuk situs ini.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        userMsg = 'Jendela pop-up login ditutup sebelum proses selesai.';
      }

      setAuthError(userMsg);
      // Open modal so user sees the message and alternative option
      setIsAuthModalOpen(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setPersonalUser = (name: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || 'Pengguna';
    const uidHash = btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const customUser: UserProfile = {
      uid: `usr_${uidHash}`,
      displayName: cleanName,
      email: cleanEmail,
      photoURL: null,
    };

    setUser(customUser);
    setIsDemoMode(false);
    setAuthError(null);
    localStorage.removeItem('dompetku_demo_mode');
    localStorage.setItem('dompetku_custom_user', JSON.stringify(customUser));
    setIsAuthModalOpen(false);
  };

  const enableDemoMode = () => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
    setAuthError(null);
    localStorage.removeItem('dompetku_custom_user');
    localStorage.setItem('dompetku_demo_mode', 'true');
    setIsAuthModalOpen(false);
  };

  const signOut = async () => {
    try {
      if (auth && 'reload' in (user || {})) {
        await fbSignOut(auth);
      }
    } catch (error) {
      console.error('Sign Out Error:', error);
    } finally {
      setUser(null);
      setIsDemoMode(false);
      setAuthError(null);
      localStorage.removeItem('dompetku_demo_mode');
      localStorage.removeItem('dompetku_custom_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        authError,
        clearAuthError,
        signInWithGoogle,
        enableDemoMode,
        setPersonalUser,
        signOut,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
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
