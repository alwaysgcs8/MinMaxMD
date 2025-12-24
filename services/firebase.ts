import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Note: These values should be in your .env file
// Example: VITE_FIREBASE_API_KEY=...

// Safely access env variables. 
// We use optional chaining on (import.meta as any).env to prevent runtime errors 
// if the environment object is not strictly defined in the current context.
const getEnv = (key: string) => {
    return (import.meta as any).env?.[key];
}

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY") || "YOUR_API_KEY_HERE",
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN") || "YOUR_AUTH_DOMAIN_HERE",
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID") || "YOUR_PROJECT_ID_HERE",
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET") || "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: getEnv("VITE_FIREBASE_APP_ID") || "YOUR_APP_ID_HERE"
};

// Initialize only if config is valid (prevent crash on unconfigured download)
let app, auth, db;
try {
    // Basic check to see if apiKey is configured (not the default placeholder)
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        console.warn("Firebase config missing or default. Cloud features disabled.");
    }
} catch (e) {
    console.warn("Firebase initialization failed:", e);
}

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not initialized. Check your .env configuration.");
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
    await firebaseSignOut(auth);
};

export { auth, db };