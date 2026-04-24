import { create } from 'zustand';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthStore {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  initAuth: () => Promise<() => void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const googleProvider = new GoogleAuthProvider();

export const useAuthStore = create<AuthStore>((set) => ({
  firebaseUser: null,
  loading: true,
  initialized: false,

  initAuth: async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (error) {
      console.error('Failed to set auth persistence:', error);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ firebaseUser: user, loading: false, initialized: true });
    });
    return unsubscribe;
  },

  loginWithGoogle: async () => {
    try {
      set({ loading: true });
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      set({ loading: false });
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this site to sign in with Google.');
      } else if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign-in error:', error);
        alert(`Sign-in failed: ${error.message}`);
      }
    }
  },

  logout: async () => {
    await signOut(auth);
  },
}));
