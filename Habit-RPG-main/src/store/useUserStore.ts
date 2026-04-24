import { create } from 'zustand';
import { User } from '../lib/db';
import { db } from '../lib/firebase';
import { onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';

// Generate or retrieve a persistent anonymous user ID
function getLocalUserId(): string {
  const KEY = 'nutriintel_user_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = 'user_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    localStorage.setItem(KEY, id);
  }
  return id;
}

// Get stored profile name
function getLocalName(): string {
  return localStorage.getItem('nutriintel_user_name') || 'User';
}

interface UserStore {
  user: User | null;
  userId: string;
  loading: boolean;
  initialized: boolean;
  initUser: () => () => void;
  updateName: (name: string) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  userId: getLocalUserId(),
  loading: true,
  initialized: false,

  initUser: () => {
    const userId = get().userId;
    set({ loading: true });

    // Ensure user doc exists, then listen
    const userRef = doc(db, 'users', userId);

    getDoc(userRef).then(async (snap) => {
      if (!snap.exists()) {
        const newUser: User = {
          id: userId,
          name: getLocalName(),
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
    localStorage.setItem('nutriintel_user_name', name);
    const user = get().user;
    if (user) {
      set({ user: { ...user, name } });
    }
  },
}));
