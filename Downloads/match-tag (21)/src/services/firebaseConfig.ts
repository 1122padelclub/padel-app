"use client"

export {
  app,
  db,
  auth,
  realtimeDb,
  analytics,
  getFirebaseApp,
  getFirestoreDB,
  getFirebaseAuth,
  getFirebaseRealtimeDB,
  getFirebaseAnalytics,
  isFirebaseReady,
  reinitializeFirebase,
} from "@/lib/firebase"

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth"

// Funciones de compatibilidad
export const getAuthInstance = () => auth
export const getRealtimeDbInstance = () => realtimeDb
export const getAnalyticsInstance = () => analytics
