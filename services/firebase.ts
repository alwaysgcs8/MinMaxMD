
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
// Fix: Use 'import type' for User to resolve module export error
import type { User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: To use this in production, you must add these variables to your environment.
// For now, we use a placeholder structure. The app will gracefully fall back to local mode if keys are missing.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForUIFlow",
  authDomain: "minmaxmd.firebaseapp.com",
  projectId: "minmaxmd",
  storageBucket: "minmaxmd.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
let app;
let auth: any = null;
let db: any = null;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.warn("Firebase initialization failed. Ensure VITE_FIREBASE_API_KEY is set.");
}

export { auth, db };

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth) return null;
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  if (!auth) return;
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};
