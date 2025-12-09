const admin = require('firebase-admin')

// Configuración de Firebase Admin
const serviceAccount = {
  // Aquí necesitarías las credenciales de tu proyecto
  // Por ahora vamos a usar una configuración básica
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://match-tag-v0-default-rtdb.firebaseio.com"
  })
}

const db = admin.database()

async function debugFirebaseChats() {
  console.log("🔍 Debugging Firebase Realtime Database structure...")
  
  try {
    // Verificar estructura raíz
    console.log("\n📁 Estructura raíz:")
    const rootSnapshot = await db.ref('/').once('value')
    const rootData = rootSnapshot.val()
    console.log("Claves en la raíz:", Object.keys(rootData || {}))

    // Buscar chats en diferentes ubicaciones posibles
    const possiblePaths = [
      'chats',
      'bars/0ArbQBMQTLvAM4WT6xfA/chats',
      'bars/0ArbQBMQTLvAM4WT6xfA/tableChats',
      'tableChats'
    ]

    for (const path of possiblePaths) {
      console.log(`\n🔍 Verificando ruta: ${path}`)
      try {
        const snapshot = await db.ref(path).once('value')
        const data = snapshot.val()
        
        if (data) {
          console.log(`✅ Datos encontrados en ${path}:`)
          console.log("Claves:", Object.keys(data))
          
          // Mostrar estructura de los primeros chats
          const chatIds = Object.keys(data).slice(0, 3)
          chatIds.forEach(chatId => {
            console.log(`  Chat ${chatId}:`, JSON.stringify(data[chatId], null, 2))
          })
        } else {
          console.log(`❌ No hay datos en ${path}`)
        }
      } catch (error) {
        console.log(`❌ Error accediendo a ${path}:`, error.message)
      }
    }

    // Verificar mesas
    console.log("\n🔍 Verificando mesas:")
    const tablesSnapshot = await db.ref('bars/0ArbQBMQTLvAM4WT6xfA/tables').once('value')
    const tablesData = tablesSnapshot.val()
    
    if (tablesData) {
      console.log("Mesas encontradas:", Object.keys(tablesData))
      const tableIds = Object.keys(tablesData).slice(0, 2)
      tableIds.forEach(tableId => {
        console.log(`  Mesa ${tableId}:`, JSON.stringify(tablesData[tableId], null, 2))
      })
    }

  } catch (error) {
    console.error("❌ Error general:", error)
  }
}

debugFirebaseChats()
  .then(() => {
    console.log("\n✅ Debug completado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error en debug:", error)
    process.exit(1)
  })





