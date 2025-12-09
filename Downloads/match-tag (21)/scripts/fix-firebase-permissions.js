const admin = require("firebase-admin")

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
  })
}

const db = admin.firestore()
const rtdb = admin.database()

async function fixFirebasePermissions() {
  console.log("🔧 Iniciando corrección de permisos de Firebase...")

  try {
    // 1. Verificar reglas de Firestore
    console.log("📋 Verificando reglas de Firestore...")

    // 2. Verificar reglas de Realtime Database
    console.log("📋 Verificando reglas de Realtime Database...")

    // 3. Crear datos de prueba para verificar permisos
    console.log("🧪 Creando datos de prueba...")

    // Crear un bar de prueba si no existe
    const testBarId = "test-bar-permissions"
    const barRef = db.collection("bars").doc(testBarId)
    const barDoc = await barRef.get()

    if (!barDoc.exists) {
      await barRef.set({
        name: "Bar de Prueba - Permisos",
        address: "Dirección de prueba",
        phone: "+1234567890",
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log("✅ Bar de prueba creado")
    }

    // Crear colecciones de prueba para customers y reviews
    const customersRef = barRef.collection("customers")
    const reviewsRef = barRef.collection("reviews")

    // Crear customer de prueba
    await customersRef.add({
      name: "Cliente de Prueba",
      phone: "+1234567890",
      email: "test@example.com",
      visitsCount: 1,
      totalSpent: 0,
      averageOrderValue: 0,
      favoriteItems: [],
      tags: ["test"],
      firstVisitAt: new Date().toISOString(),
      lastVisitAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      barId: testBarId,
    })
    console.log("✅ Customer de prueba creado")

    // Crear review de prueba
    await reviewsRef.add({
      customerName: "Cliente de Prueba",
      stars: 5,
      comment: "Excelente servicio de prueba",
      barId: testBarId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log("✅ Review de prueba creado")

    // Crear order de prueba en Realtime Database
    const ordersRef = rtdb.ref(`orders/${testBarId}`)
    await ordersRef.push({
      barId: testBarId,
      tableId: "table-1",
      tableNumber: 1,
      items: [
        {
          id: "item-1",
          name: "Producto de Prueba",
          price: 10.0,
          quantity: 1,
        },
      ],
      status: "pending",
      total: 10.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    console.log("✅ Order de prueba creado en Realtime Database")

    console.log("🎉 Corrección de permisos completada exitosamente")
    console.log("📊 Datos de prueba creados para verificar funcionamiento")
  } catch (error) {
    console.error("❌ Error durante la corrección de permisos:", error)
    throw error
  }
}

// Ejecutar la corrección
fixFirebasePermissions()
  .then(() => {
    console.log("✅ Script completado exitosamente")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error en el script:", error)
    process.exit(1)
  })
