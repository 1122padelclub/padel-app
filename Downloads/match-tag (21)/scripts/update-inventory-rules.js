#!/usr/bin/env node

/**
 * Script para actualizar las reglas de Firestore con soporte de inventario
 * Ejecutar con: node scripts/update-inventory-rules.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Actualizando reglas de Firestore para inventario...\n');

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
    execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Proyecto Firebase configurado');
  } catch (error) {
    console.error('❌ No hay proyecto Firebase configurado. Ejecuta: firebase login && firebase init');
    process.exit(1);
  }

  // Verificar si existe el archivo de reglas
  const rulesPath = path.join(__dirname, '..', 'firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ No se encontró el archivo firestore.rules');
    process.exit(1);
  }

  console.log('\n📋 Actualizando reglas de Firestore...');
  console.log('   - inventoryItems');
  console.log('   - recipes');
  console.log('   - inventoryMovements');
  console.log('   - inventoryAlerts');
  console.log('');

  // Desplegar las reglas
  console.log('🚀 Desplegando reglas...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  console.log('\n✅ Reglas de Firestore actualizadas exitosamente!');
  console.log('\n📝 Notas importantes:');
  console.log('   - Las reglas se aplicaron inmediatamente');
  console.log('   - Ahora puedes crear insumos en el panel de inventario');
  console.log('   - Verifica que no haya errores de permisos');

} catch (error) {
  console.error('❌ Error actualizando reglas:', error.message);
  console.log('\n🔧 Solución manual:');
  console.log('   1. Ve a https://console.firebase.google.com/');
  console.log('   2. Selecciona tu proyecto');
  console.log('   3. Ve a Firestore Database > Reglas');
  console.log('   4. Copia el contenido de firestore.rules');
  console.log('   5. Haz clic en "Publicar"');
  process.exit(1);
}

