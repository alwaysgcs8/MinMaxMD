
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// We use process.env here because we have configured vite.config.ts to 
// statically replace these patterns with the actual string values.
// This avoids issues where import.meta.env might be undefined in some environments.

const firebaseConfig = {
  // @ts-ignore
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  // @ts-ignore
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  // @ts-ignore
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // @ts-ignore
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  // @ts-ignore
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // @ts-ignore
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize only if config is valid
let app = null;
let auth: any = null;
let db: any = null;

try {
    // Check if apiKey is present and not just an empty string
    if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        console.log("Running in offline mode (No Firebase config detected).");
    }
} catch (e) {
    console.warn("Firebase initialization failed:", e);
}

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Cloud Sync is not configured. Run in offline mode.");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
    if (!auth) return;
    // Use the standard signOut function from firebase/auth
    await signOut(auth);
};

export { auth, db };
