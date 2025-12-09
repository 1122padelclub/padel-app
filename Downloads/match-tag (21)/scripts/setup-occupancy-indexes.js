#!/usr/bin/env node

/**
 * Script para configurar los índices necesarios para el sistema de ocupación
 * Ejecutar con: node scripts/setup-occupancy-indexes.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando índices de Firestore para el sistema de ocupación...\n');

try {
  // Verificar si firebase CLI está instalado
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI detectado');
  } catch (error) {
    console.error('❌ Firebase CLI no está instalado. Instálalo con: npm install -g firebase-tools');
    process.exit(1);
  }

  // Verificar si hay un proyecto Firebase configurado
  try {
    const config = execSync('firebase projects:list', { stdio: 'pipe' }).toString();
    console.log('✅ Proyecto Firebase configurado');
  } catch (error) {
    console.error('❌ No hay proyecto Firebase configurado. Ejecuta: firebase login && firebase init');
    process.exit(1);
  }

  // Verificar si existe el archivo de configuración
  const indexPath = path.join(__dirname, '..', 'firestore.indexes.occupancy.json');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ No se encontró el archivo firestore.indexes.occupancy.json');
    process.exit(1);
  }

  console.log('📋 Índices a crear:');
  console.log('   - tables: barId, isActive, number');
  console.log('   - reservations: barId, reservationDate');
  console.log('');

  // Crear los índices
  console.log('🚀 Creando índices...');
  execSync(`firebase firestore:indexes --project=default`, { stdio: 'inherit' });

  console.log('\n✅ Índices creados exitosamente!');
  console.log('\n📝 Notas importantes:');
  console.log('   - Los índices pueden tardar unos minutos en estar disponibles');
  console.log('   - Verifica en la consola de Firebase que los índices estén "Building" o "Enabled"');
  console.log('   - Si hay errores, revisa los permisos de Firestore');

} catch (error) {
  console.error('❌ Error configurando índices:', error.message);
  console.log('\n🔧 Soluciones alternativas:');
  console.log('   1. Ve a https://console.firebase.google.com/');
  console.log('   2. Selecciona tu proyecto');
  console.log('   3. Ve a Firestore Database > Índices');
  console.log('   4. Crea manualmente los índices mostrados arriba');
  process.exit(1);
}

