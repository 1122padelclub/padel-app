// Script para actualizar reglas de Firebase Realtime Database
const admin = require('firebase-admin');

// Configuración de Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "match-tag-v0",
  private_key_id: "your-private-key-id",
  private_key: "your-private-key",
  client_email: "your-client-email",
  client_id: "your-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "your-cert-url"
};

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://match-tag-v0-default-rtdb.firebaseio.com"
});

// Reglas que queremos aplicar
const newRules = {
  "rules": {
    ".read": true,
    ".write": true
  }
};

async function updateRules() {
  try {
    console.log('Actualizando reglas de Realtime Database...');
    
    // Obtener referencia a la base de datos
    const db = admin.database();
    
    // Aplicar las nuevas reglas
    await db.ref().set(newRules);
    
    console.log('✅ Reglas actualizadas exitosamente');
    console.log('Las reglas ahora permiten acceso público completo');
    
  } catch (error) {
    console.error('❌ Error actualizando reglas:', error.message);
    console.log('\n📋 Instrucciones manuales:');
    console.log('1. Ve a https://console.firebase.google.com/');
    console.log('2. Selecciona el proyecto: match-tag-v0');
    console.log('3. Ve a Realtime Database → Rules');
    console.log('4. Reemplaza las reglas con:');
    console.log(JSON.stringify(newRules, null, 2));
    console.log('5. Haz clic en "Publish"');
  }
}

updateRules();











