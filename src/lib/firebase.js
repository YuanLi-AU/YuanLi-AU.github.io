// Firebase setup for the private Planner. Imported only by the lazy-loaded
// Planner route, so the public Portfolio never downloads Firebase.
//
// The config values are public client identifiers (they are embedded in the
// browser bundle). Real protection comes from Firebase Auth + Firestore
// Security Rules restricted to the Planner owner's UID.
import { initializeApp } from 'firebase/app'
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

// Keep the session on this device until "Lock" (sign out) is pressed.
// Firebase stores its own auth token here — never the password.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
})

// Planner data. Access is enforced by firestore.rules (owner UID only).
export const db = getFirestore(app)

const PLANNER_EMAIL = import.meta.env.VITE_PLANNER_EMAIL

// The UI only asks for the password; the single account's email comes from config.
export function unlock(password) {
  return signInWithEmailAndPassword(auth, PLANNER_EMAIL, password)
}

export function lock() {
  return signOut(auth)
}
