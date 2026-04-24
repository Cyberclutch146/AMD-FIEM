import { create } from 'zustand';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthStore {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  initAuth: () => () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const googleProvider = new GoogleAuthProvider();

export const useAuthStore = create<AuthStore>((set) => ({
  firebaseUser: null,
  loading: true,
  initialized: false,

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ firebaseUser: user, loading: false, initialized: true });
    });
    return unsubscribe;
  },

  loginWithGoogle: async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign-in error:', error);
      }
    }
  },

  logout: async () => {
    await signOut(auth);
  },
}));
