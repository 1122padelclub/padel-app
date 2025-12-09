// Script para verificar y corregir permisos del CRM
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function verifyCRMPermissions() {
  console.log("🔍 Verificando permisos del CRM...")

  const testBarId = "4svN1VAEPQa8ukZpd2bz"

  try {
    // Intentar crear un cliente de prueba (simulando pedido desde mesa)
    const testCustomer = {
      barId: testBarId,
      name: "Cliente de Prueba",
      phone: "+1234567890",
      email: "",
      lastVisit: serverTimestamp(),
      totalOrders: 1,
      totalSpent: 25.5,
      preferredTable: 1,
      accountType: "individual",
      notes: "Cliente de prueba para verificar permisos",
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, `bars/${testBarId}/customers`), testCustomer)
    console.log("✅ Cliente de prueba creado exitosamente:", docRef.id)

    console.log("✅ Los permisos del CRM están funcionando correctamente")
    console.log("📋 Ahora los pedidos desde las mesas pueden agregar clientes al CRM")
  } catch (error) {
    console.error("❌ Error al verificar permisos del CRM:", error)

    if (error.code === "permission-denied") {
      console.log("🔧 Las reglas de Firestore necesitan ser actualizadas")
      console.log('📝 Asegúrate de que las reglas permitan "allow create: if true" para customers')
    }
  }
}

verifyCRMPermissions()
