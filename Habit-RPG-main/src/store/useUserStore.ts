import { create } from 'zustand';
import { User } from '../lib/db';
import { db } from '../lib/firebase';
import { onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';

interface UserStore {
  user: User | null;
  userId: string;
  loading: boolean;
  initialized: boolean;
  setUserId: (id: string) => void;
  initUser: (uid: string) => () => void;
  updateName: (name: string) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  userId: '',
  loading: true,
  initialized: false,

  setUserId: (id: string) => set({ userId: id }),

  initUser: (uid: string) => {
    set({ userId: uid, loading: true });

    const userRef = doc(db, 'users', uid);

    // Ensure doc exists on first sign-in
    getDoc(userRef).then(async (snap) => {
      if (!snap.exists()) {
        const newUser: User = {
          id: uid,
          name: '',
          email: '',
          streak: 0,
          lastCheckInDate: null,
          theme: 'dark',
          unlockedThemes: ['dark'],
          healthScore: 0,
          consistencyScore: 0,
        };
        await setDoc(userRef, newUser);
      }
    }).catch(console.error);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        set({ user: docSnap.data() as User, loading: false, initialized: true });
      } else {
        set({ user: null, loading: false, initialized: true });
      }
    });

    return unsubscribe;
  },

  updateName: (name: string) => {
    const user = get().user;
    if (user) {
      set({ user: { ...user, name } });
    }
  },
}));
