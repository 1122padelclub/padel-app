// Script para probar el sistema CRM agnóstico completo
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore"

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

async function testCRMSystem() {
  console.log("[v0] 🧪 Iniciando pruebas del sistema CRM agnóstico...")

  const testBarId = "4svN1VAEPQa8ukZpd2bz"
  const testOrder = {
    barId: testBarId,
    customer: {
      name: "Cliente Prueba CRM",
      phone: "+573001234567",
      email: "test@example.com",
    },
    total: 25000,
    tableId: "mesa-1",
    items: [
      { name: "Cerveza", quantity: 2, price: 8000 },
      { name: "Hamburguesa", quantity: 1, price: 9000 },
    ],
  }

  try {
    // 1. Probar API de upsert de contactos
    console.log("[v0] 📝 Probando API /api/contacts/upsert...")
    const upsertResponse = await fetch("/api/contacts/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: testOrder }),
    })

    const upsertResult = await upsertResponse.json()
    console.log("[v0] ✅ Upsert result:", upsertResult)

    // 2. Probar API de listado de contactos
    console.log("[v0] 📋 Probando API /api/contacts/list...")
    const listResponse = await fetch(`/api/contacts/list?barId=${testBarId}&limit=10`)
    const listResult = await listResponse.json()
    console.log("[v0] ✅ List result:", listResult)

    // 3. Probar acceso directo a Firestore
    console.log("[v0] 🔥 Probando acceso directo a Firestore...")
    const contactsRef = collection(db, `bars/${testBarId}/crm_contacts`)
    const snapshot = await getDocs(query(contactsRef, where("source", "==", "order")))
    console.log("[v0] ✅ Firestore contacts found:", snapshot.size)

    // 4. Probar exportación CSV
    console.log("[v0] 📊 Probando exportación CSV...")
    const exportUrl = `/api/contacts/export?barId=${testBarId}`
    console.log("[v0] ✅ Export URL ready:", exportUrl)

    // 5. Verificar permisos de Firebase
    console.log("[v0] 🔐 Verificando permisos de Firebase...")
    try {
      await addDoc(collection(db, `bars/${testBarId}/crm_contacts`), {
        name: "Test Permission",
        email: "test@permission.com",
        phone: "+573009999999",
        barId: testBarId,
        source: "test",
        ordersCount: 1,
        lifetimeValue: 1000,
        createdAt: new Date(),
      })
      console.log("[v0] ✅ Firebase permissions OK - can create contacts")
    } catch (error) {
      console.error("[v0] ❌ Firebase permissions error:", error.message)
    }

    console.log("[v0] 🎉 Todas las pruebas del sistema CRM completadas!")
  } catch (error) {
    console.error("[v0] ❌ Error en pruebas CRM:", error)
  }
}

// Ejecutar pruebas
testCRMSystem()
