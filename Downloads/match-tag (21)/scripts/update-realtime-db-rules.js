const admin = require('firebase-admin');

// Configuración de Firebase Admin
const serviceAccount = {
  // Aquí necesitarías las credenciales de tu service account
  // Por ahora usaremos la configuración por defecto
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://match-tag-v0-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();

// Reglas del Realtime Database
const rules = {
  "rules": {
    "bars": {
      "$barId": {
        "tables": {
          ".read": true,
          ".write": true
        },
        "waiterCalls": {
          ".read": true,
          ".write": true
        },
        "orders": {
          ".read": true,
          ".write": true
        },
        "chats": {
          ".read": true,
          ".write": true
        },
        "messages": {
          ".read": true,
          ".write": true
        }
      }
    },
    "messages": {
      "$barId": {
        "$chatId": {
          ".read": true,
          ".write": true
        }
      }
    },
    "chats": {
      "$barId": {
        "$chatId": {
          ".read": true,
          ".write": true
        }
      }
    },
    "orders": {
      "$barId": {
        ".read": true,
        ".write": true
      }
    }
  }
};

// Función para actualizar las reglas
async function updateRules() {
  try {
    console.log('🔄 Actualizando reglas del Realtime Database...');
    
    // Actualizar las reglas
    await db.ref().set(rules);
    
    console.log('✅ Reglas del Realtime Database actualizadas exitosamente');
    console.log('📋 Reglas aplicadas:');
    console.log(JSON.stringify(rules, null, 2));
    
  } catch (error) {
    console.error('❌ Error actualizando reglas:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateRules().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { updateRules };