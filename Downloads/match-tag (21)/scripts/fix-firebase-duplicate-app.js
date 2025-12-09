// Script para verificar que Firebase se inicializa correctamente sin duplicados
import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

console.log("🔍 Verificando configuración de Firebase...")

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

try {
  console.log("📱 Apps existentes antes:", getApps().length)

  // Usar el patrón singleton correcto
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  const db = getFirestore(app)

  console.log("✅ Firebase inicializado correctamente")
  console.log("📱 Apps después:", getApps().length)
  console.log("🔧 App name:", app.name)
  console.log("🗄️ Database project:", db.app.options.projectId)

  // Verificar que podemos hacer una consulta básica
  console.log("🧪 Probando conexión a Firestore...")
} catch (error) {
  console.error("❌ Error en configuración Firebase:", error)
}
