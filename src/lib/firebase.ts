import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Firebase web config is a public client identifier — safe to commit.
// Data access is enforced by Firestore security rules, not by hiding these.
const firebaseConfig = {
  apiKey: 'AIzaSyAjAroHAoujWwmCJLeVODwS6YX3dGxX0nk',
  authDomain: 'stealjobsx.firebaseapp.com',
  projectId: 'stealjobsx',
  storageBucket: 'stealjobsx.firebasestorage.app',
  messagingSenderId: '793309586364',
  appId: '1:793309586364:web:2eda8c065bbab3fac941b9',
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Firestore with offline persistence (survives reloads, multi-tab safe).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

/** Current signed-in user's uid, or throws if not authenticated. */
export function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  return uid;
}
