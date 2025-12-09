const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://match-tag-v0-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();

// Datos de prueba para las mesas
const testBarId = "0ArbQBMQTLvAM4WT6xfA";
const testTables = {
  "jYah123": {
    id: "jYah123",
    barId: testBarId,
    number: 1,
    isActive: true,
    isOccupied: false,
    password: "1234",
    createdAt: new Date().toISOString()
  },
  "jYah456": {
    id: "jYah456", 
    barId: testBarId,
    number: 2,
    isActive: true,
    isOccupied: false,
    password: "5678",
    createdAt: new Date().toISOString()
  },
  "jYah789": {
    id: "jYah789",
    barId: testBarId,
    number: 3,
    isActive: true,
    isOccupied: false,
    password: "9012",
    createdAt: new Date().toISOString()
  }
};

// Función para crear datos de prueba
async function createTestData() {
  try {
    console.log('🔄 Creando datos de prueba para las mesas...');
    
    // Crear mesas en Realtime Database
    await db.ref(`bars/${testBarId}/tables`).set(testTables);
    
    // Crear estructura de chats
    await db.ref(`bars/${testBarId}/chats`).set({});
    
    // Crear estructura de mensajes
    await db.ref(`bars/${testBarId}/messages`).set({});
    
    // Crear estructura de llamadas de mesero
    await db.ref(`bars/${testBarId}/waiterCalls`).set({});
    
    // Crear estructura de pedidos
    await db.ref(`bars/${testBarId}/orders`).set({});
    
    console.log('✅ Datos de prueba creados exitosamente');
    console.log(`📊 Bar ID: ${testBarId}`);
    console.log('📋 Mesas creadas:');
    Object.values(testTables).forEach(table => {
      console.log(`  - Mesa ${table.number} (ID: ${table.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestData().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { createTestData };






