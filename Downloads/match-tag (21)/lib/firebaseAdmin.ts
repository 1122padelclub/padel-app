import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getDatabase, type Database } from "firebase-admin/database"

let adminApp: App | null = null
let adminDb: Firestore | null = null
let adminRealtimeDb: Database | null = null

export function getAdminApp(): App {
  if (!adminApp) {
    try {
      // Verificar si ya hay una app inicializada
      const existingApps = getApps()
      if (existingApps.length > 0) {
        adminApp = existingApps[0]
        return adminApp
      }

      // Inicializar con service account desde variable de entorno
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT

      if (!serviceAccountKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is required")
      }

      let serviceAccount
      try {
        serviceAccount = JSON.parse(serviceAccountKey)
      } catch (parseError) {
        console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT JSON:", parseError)
        throw new Error("Invalid JSON format in FIREBASE_SERVICE_ACCOUNT environment variable")
      }

      if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT is missing required fields (private_key, client_email, project_id)")
      }

      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n")
      }

      adminApp = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://match-tag-v0-default-rtdb.firebaseio.com" // URL del Realtime Database
      })

      console.log("✅ Firebase Admin SDK initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing Firebase Admin SDK:", error)
      throw error
    }
  }

  return adminApp
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp())
  }
  return adminDb
}

export function getAdminRealtimeDb(): Database {
  if (!adminRealtimeDb) {
    const app = getAdminApp()
    console.log("🔥 Initializing Admin Realtime DB...")
    
    // No necesitamos pasar la URL aquí porque ya está en la app
    adminRealtimeDb = getDatabase(app)
    console.log("🔥 Admin Realtime DB initialized successfully")
  }
  return adminRealtimeDb
}

// Helper para operaciones comunes con Admin SDK
export async function adminSetDoc(collection: string, docId: string, data: any, merge = false) {
  const db = getAdminDb()
  const docRef = db.collection(collection).doc(docId)

  if (merge) {
    await docRef.set(data, { merge: true })
  } else {
    await docRef.set(data)
  }

  return docRef
}

export async function adminGetDoc(collection: string, docId: string) {
  const db = getAdminDb()
  const docRef = db.collection(collection).doc(docId)
  const doc = await docRef.get()

  return {
    exists: doc.exists,
    data: doc.data(),
    id: doc.id,
  }
}

export async function adminUpdateDoc(collection: string, docId: string, data: any) {
  const db = getAdminDb()
  const docRef = db.collection(collection).doc(docId)
  await docRef.update(data)
  return docRef
}
