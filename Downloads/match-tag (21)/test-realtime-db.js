// Script para probar Realtime Database
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyCtuoxRiyRUwyeyZvv_dtZ6K-U9H3vgpgc",
  authDomain: "match-tag-v0.firebaseapp.com",
  projectId: "match-tag-v0",
  storageBucket: "match-tag-v0.firebasestorage.app",
  messagingSenderId: "954838217281",
  appId: "1:954838217281:web:f94e51d094fb821eef4cc0",
  measurementId: "G-D0TYN2Y0VJ",
  databaseURL: "https://match-tag-v0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function testRealtimeDB() {
  try {
    console.log('Probando acceso a Realtime Database...');
    
    // Probar escritura
    const testRef = ref(database, 'test/connection');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Test connection successful'
    });
    
    console.log('✅ Escritura exitosa');
    
    // Probar lectura
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('✅ Lectura exitosa:', snapshot.val());
    }
    
    // Probar mensajes
    const messagesRef = ref(database, 'messages/test-bar/test-chat');
    await set(messagesRef, {
      test: 'message',
      timestamp: Date.now()
    });
    
    console.log('✅ Mensajes funcionando');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRealtimeDB();











