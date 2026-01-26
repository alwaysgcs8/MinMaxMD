
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  Auth,
  User
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present and app doesn't exist
let app: FirebaseApp | undefined;
let auth: Auth | null = null;
let db: Firestore | null = null;

const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyDummyKeyForUIFlow";

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
} else {
  console.warn("Firebase configuration is missing or invalid. Cloud sync will be disabled.");
}

export { auth, db };

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth) {
    throw new Error("Firebase is not initialized. Please check your environment variables.");
  }
  const provider = new GoogleAuthProvider();
  // Ensure we always prompt for account selection for better UX in dev
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error.code, error.message);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  if (!auth) return;
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
