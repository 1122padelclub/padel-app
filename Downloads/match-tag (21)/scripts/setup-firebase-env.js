#!/usr/bin/env node

/**
 * Script para configurar la variable de entorno FIREBASE_SERVICE_ACCOUNT en Vercel
 * Ejecutar con: node scripts/setup-firebase-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Firebase Service Account en Vercel...\n');

// Verificar si ya existe un archivo de service account
const serviceAccountPath = path.join(__dirname, '..', 'service-account-key.json');

if (fs.existsSync(serviceAccountPath)) {
  console.log('✅ Archivo service-account-key.json encontrado');
  
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log(`📋 Project ID: ${serviceAccount.project_id}`);
    console.log(`📧 Client Email: ${serviceAccount.client_email}`);
    
    // Configurar en Vercel
    console.log('\n🔧 Configurando variable de entorno en Vercel...');
    
    const jsonString = JSON.stringify(serviceAccount);
    
    try {
      execSync(`vercel env add FIREBASE_SERVICE_ACCOUNT production`, {
        input: jsonString,
        stdio: 'pipe'
      });
      console.log('✅ Variable de entorno configurada en Production');
    } catch (error) {
      console.log('⚠️  Error configurando en Production, intentando con Preview...');
      try {
        execSync(`vercel env add FIREBASE_SERVICE_ACCOUNT preview`, {
          input: jsonString,
          stdio: 'pipe'
        });
        console.log('✅ Variable de entorno configurada en Preview');
      } catch (error2) {
        console.log('⚠️  Error configurando en Preview, intentando con Development...');
        try {
          execSync(`vercel env add FIREBASE_SERVICE_ACCOUNT development`, {
            input: jsonString,
            stdio: 'pipe'
          });
          console.log('✅ Variable de entorno configurada en Development');
        } catch (error3) {
          console.error('❌ Error configurando variable de entorno:', error3.message);
          console.log('\n📝 Configuración manual requerida:');
          console.log('1. Ve a https://vercel.com/dashboard');
          console.log('2. Selecciona tu proyecto');
          console.log('3. Ve a Settings → Environment Variables');
          console.log('4. Agrega FIREBASE_SERVICE_ACCOUNT con el siguiente valor:');
          console.log(jsonString);
        }
      }
    }
    
    console.log('\n🎉 Configuración completada!');
    console.log('📝 Próximos pasos:');
    console.log('1. Redeploy tu aplicación en Vercel');
    console.log('2. Prueba el botón "Probar API" en el panel de inventario');
    
  } catch (error) {
    console.error('❌ Error leyendo archivo service-account-key.json:', error.message);
  }
  
} else {
  console.log('❌ Archivo service-account-key.json no encontrado');
  console.log('\n📝 Para crear el archivo:');
  console.log('1. Ve a https://console.firebase.google.com/project/match-tag-v0/settings/serviceaccounts/adminsdk');
  console.log('2. Haz clic en "Generate new private key"');
  console.log('3. Descarga el archivo JSON');
  console.log('4. Renómbralo a "service-account-key.json"');
  console.log('5. Colócalo en la raíz del proyecto');
  console.log('6. Ejecuta este script nuevamente');
}