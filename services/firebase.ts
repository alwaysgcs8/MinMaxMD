
// Firebase service removed. Using LocalStorage only.
export const auth = null;
export const db = null;
export const signInWithGoogle = () => Promise.reject("Firebase removed");
export const logout = () => Promise.resolve();
