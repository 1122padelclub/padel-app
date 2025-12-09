// Script para habilitar el chat general en un bar específico
const admin = require('firebase-admin');
const readline = require('readline');

// Inicializar Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function enableGeneralChat() {
  try {
    console.log('📋 Obteniendo lista de bares...\n');
    
    const barsSnapshot = await db.collection('bars').get();
    const bars = [];
    
    barsSnapshot.forEach(doc => {
      bars.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (bars.length === 0) {
      console.log('❌ No se encontraron bares en la base de datos.');
      rl.close();
      return;
    }

    console.log('Bares disponibles:\n');
    bars.forEach((bar, index) => {
      console.log(`${index + 1}. ${bar.name} (ID: ${bar.id})`);
      console.log(`   Chat General: ${bar.generalChatEnabled ? '✅ Activado' : '❌ Desactivado'}`);
      console.log('');
    });

    rl.question('Ingresa el número del bar para habilitar el chat general (o "all" para todos): ', async (answer) => {
      try {
        if (answer.toLowerCase() === 'all') {
          console.log('\n🔄 Habilitando chat general en todos los bares...\n');
          
          for (const bar of bars) {
            await db.collection('bars').doc(bar.id).update({
              generalChatEnabled: true,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Chat general habilitado en: ${bar.name}`);
          }
          
          console.log('\n✅ Chat general habilitado en todos los bares!');
        } else {
          const index = parseInt(answer) - 1;
          
          if (isNaN(index) || index < 0 || index >= bars.length) {
            console.log('❌ Número inválido.');
            rl.close();
            return;
          }

          const selectedBar = bars[index];
          console.log(`\n🔄 Habilitando chat general en: ${selectedBar.name}...\n`);
          
          await db.collection('bars').doc(selectedBar.id).update({
            generalChatEnabled: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Chat general habilitado en: ${selectedBar.name}!`);
        }
      } catch (error) {
        console.error('❌ Error:', error);
      } finally {
        rl.close();
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo bares:', error);
    rl.close();
    process.exit(1);
  }
}

enableGeneralChat();







