#!/usr/bin/env node

/**
 * Script para verificar la configuración de Firebase
 * Ejecutar con: node scripts/verify-firebase-config.js
 */

console.log('🔍 Verificando configuración de Firebase...\n')

// Verificar variable de entorno
const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT

if (!serviceAccountEnv) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT no está definida')
  console.log('\n📝 Para configurar:')
  console.log('1. Ve a Firebase Console → Project Settings → Service Accounts')
  console.log('2. Genera una nueva private key')
  console.log('3. Copia el JSON completo a la variable de entorno')
  process.exit(1)
}

console.log('✅ FIREBASE_SERVICE_ACCOUNT está definida')

// Verificar formato JSON
try {
  const serviceAccount = JSON.parse(serviceAccountEnv)
  console.log('✅ JSON válido')
  
  // Verificar campos requeridos
  const requiredFields = ['type', 'project_id', 'private_key', 'client_email']
  const missingFields = requiredFields.filter(field => !serviceAccount[field])
  
  if (missingFields.length > 0) {
    console.error(`❌ Faltan campos requeridos: ${missingFields.join(', ')}`)
    process.exit(1)
  }
  
  console.log('✅ Todos los campos requeridos están presentes')
  console.log(`📋 Project ID: ${serviceAccount.project_id}`)
  console.log(`📧 Client Email: ${serviceAccount.client_email}`)
  
  // Verificar formato de private key
  if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('❌ Private key no tiene el formato correcto')
    console.log('💡 Asegúrate de que la private key incluya los headers -----BEGIN/END PRIVATE KEY-----')
    process.exit(1)
  }
  
  console.log('✅ Private key tiene el formato correcto')
  
} catch (error) {
  console.error('❌ JSON inválido:', error.message)
  console.log('\n💡 Posibles soluciones:')
  console.log('1. Verifica que no haya caracteres extra en el JSON')
  console.log('2. Asegúrate de que las comillas estén escapadas correctamente')
  console.log('3. Copia el JSON directamente desde Firebase Console')
  process.exit(1)
}

console.log('\n🎉 Configuración de Firebase válida!')
console.log('✅ La API de inventario debería funcionar correctamente')
