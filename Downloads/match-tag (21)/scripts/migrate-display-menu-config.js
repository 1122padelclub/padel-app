const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Configuración de Firebase (usa las variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateDisplayMenuConfig() {
  try {
    console.log('🔄 Iniciando migración de configuración del menú de exhibición...');
    
    // Lista de barIds conocidos (puedes agregar más)
    const barIds = ['F1lt58gICbBLTVWYVOjM']; // El barId que vemos en la URL
    
    for (const barId of barIds) {
      console.log(`📋 Procesando barId: ${barId}`);
      
      const configRef = doc(db, 'bars', barId, 'displayMenuConfig', 'config');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const currentConfig = configSnap.data();
        console.log('📋 Configuración actual:', {
          showHeroImage: currentConfig.showHeroImage,
          heroImage: currentConfig.heroImage,
          title: currentConfig.title
        });
        
        // Actualizar solo si showHeroImage es false
        if (currentConfig.showHeroImage === false) {
          const updatedConfig = {
            ...currentConfig,
            showHeroImage: true,
            updatedAt: new Date()
          };
          
          await setDoc(configRef, updatedConfig, { merge: true });
          console.log('✅ Configuración actualizada para barId:', barId);
        } else {
          console.log('ℹ️ Configuración ya tiene showHeroImage: true para barId:', barId);
        }
      } else {
        console.log('⚠️ No se encontró configuración para barId:', barId);
      }
    }
    
    console.log('🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

// Ejecutar la migración
migrateDisplayMenuConfig();



