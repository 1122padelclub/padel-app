import { initializeApp, getApps, getApp, deleteApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"
import { getAnalytics } from "firebase/analytics"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCtuoxRiyRUwyeyZvv_dtZ6K-U9H3vgpgc",
  authDomain: "match-tag-v0.firebaseapp.com",
  projectId: "match-tag-v0",
  storageBucket: "match-tag-v0.firebasestorage.app",
  messagingSenderId: "954838217281",
  appId: "1:954838217281:web:f94e51d094fb821eef4cc0",
  measurementId: "G-D0TYN2Y0VJ",
  databaseURL: "https://match-tag-v0-default-rtdb.firebaseio.com",
}

// Función para limpiar apps existentes
const cleanupFirebaseApps = () => {
  try {
    const apps = getApps()
    apps.forEach((app) => {
      if (app.name !== '[DEFAULT]') {
        deleteApp(app).catch(() => {})
      }
    })
  } catch (error) {
    console.warn("Error cleaning up Firebase apps:", error)
  }
}

// Limpiar apps existentes antes de inicializar
cleanupFirebaseApps()

// Inicializar Firebase con manejo de errores robusto
let app: any = null
let db: any = null
let auth: any = null
let realtimeDb: any = null
let analytics: any = null
let storage: any = null

try {
  // Crear o obtener la app
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig, 'match-tag-app')
  } else {
    app = getApp('match-tag-app')
  }

  // Inicializar servicios
  db = getFirestore(app)
  auth = getAuth(app)
  realtimeDb = getDatabase(app)
  storage = getStorage(app)
  
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
  }

  console.log("Firebase initialized successfully")
} catch (error) {
  console.error("Firebase initialization error:", error)
  
  // Fallback: intentar con app por defecto
  try {
    app = getApp()
    db = getFirestore(app)
    auth = getAuth(app)
    realtimeDb = getDatabase(app)
    storage = getStorage(app)
    
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
    }
    
    console.log("Firebase initialized with fallback")
  } catch (fallbackError) {
    console.error("Firebase fallback initialization error:", fallbackError)
  }
}

export { app, db, auth, realtimeDb, analytics, storage }

// Funciones de utilidad
export const getFirebaseApp = () => app
export const getFirestoreDB = () => db
export const getFirebaseAuth = () => auth
export const getFirebaseRealtimeDB = () => realtimeDb
export const getFirebaseAnalytics = () => analytics
export const getFirebaseStorage = () => storage

// Función para verificar si Firebase está listo
export const isFirebaseReady = () => {
  return !!(app && db && auth)
}

// Función para reinicializar Firebase
export const reinitializeFirebase = () => {
  try {
    cleanupFirebaseApps()
    
    app = initializeApp(firebaseConfig, 'match-tag-app')
    db = getFirestore(app)
    auth = getAuth(app)
    realtimeDb = getDatabase(app)
    storage = getStorage(app)
    
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
    }
    
    console.log("Firebase reinitialized successfully")
    return true
  } catch (error) {
    console.error("Firebase reinitialization error:", error)
    return false
  }
}

// Funciones de compatibilidad
export const getAuthInstance = () => auth
export const getRealtimeDbInstance = () => realtimeDb
export const getAnalyticsInstance = () => analytics
export const isFirebaseConfigured = () => !!(app && db && auth)