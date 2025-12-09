#!/usr/bin/env node

/**
 * Script para migrar reservas existentes y agregar campos faltantes
 * Ejecutar con: node scripts/migrate-reservations.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = require('firebase/firestore');

// Configuración de Firebase (ajusta según tu proyecto)
const firebaseConfig = {
  // Aquí deberías poner tu configuración de Firebase
  // Por ahora usaremos las variables de entorno
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateReservations() {
  console.log('🔄 Iniciando migración de reservas...\n');

  try {
    // Obtener todas las reservas
    const reservationsRef = collection(db, 'reservations');
    const snapshot = await getDocs(reservationsRef);
    
    console.log(`📊 Encontradas ${snapshot.docs.length} reservas en la colección principal`);
    
    let migratedCount = 0;
    let errorCount = 0;

    for (const docSnapshot of snapshot.docs) {
      try {
        const data = docSnapshot.data();
        const updates = {};

        // Si tiene startAt pero no reservationDate, crear reservationDate
        if (data.startAt && !data.reservationDate) {
          const startAt = data.startAt.toDate ? data.startAt.toDate() : new Date(data.startAt);
          const reservationDate = new Date(startAt);
          reservationDate.setHours(0, 0, 0, 0);
          
          updates.reservationDate = reservationDate;
          console.log(`✅ Agregando reservationDate para reserva ${docSnapshot.id}: ${reservationDate.toISOString()}`);
        }

        // Si tiene startAt pero no reservationTime, crear reservationTime
        if (data.startAt && !data.reservationTime) {
          const startAt = data.startAt.toDate ? data.startAt.toDate() : new Date(data.startAt);
          const reservationTime = startAt.toTimeString().slice(0, 5);
          
          updates.reservationTime = reservationTime;
          console.log(`✅ Agregando reservationTime para reserva ${docSnapshot.id}: ${reservationTime}`);
        }

        // Si tiene partySize pero no guestCount, crear guestCount
        if (data.partySize && !data.guestCount) {
          updates.guestCount = data.partySize;
          console.log(`✅ Agregando guestCount para reserva ${docSnapshot.id}: ${data.partySize}`);
        }

        // Si tiene customerName pero no customer, crear customer
        if (data.customerName && !data.customer) {
          updates.customer = {
            name: data.customerName,
            phone: data.customerPhone || '',
            email: data.customerEmail || ''
          };
          console.log(`✅ Agregando customer para reserva ${docSnapshot.id}`);
        }

        // Aplicar actualizaciones si hay alguna
        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, 'reservations', docSnapshot.id), updates);
          migratedCount++;
        }

      } catch (error) {
        console.error(`❌ Error migrando reserva ${docSnapshot.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Migración completada:`);
    console.log(`   ✅ Reservas migradas: ${migratedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📊 Total procesadas: ${snapshot.docs.length}`);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

// Ejecutar migración
migrateReservations().then(() => {
  console.log('\n🎉 Migración finalizada');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});

