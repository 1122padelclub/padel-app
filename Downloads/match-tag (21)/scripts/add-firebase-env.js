#!/usr/bin/env node

/**
 * Script para agregar la variable FIREBASE_SERVICE_ACCOUNT a Vercel
 * Ejecutar con: node scripts/add-firebase-env.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Agregando FIREBASE_SERVICE_ACCOUNT a Vercel...\n');

try {
  // Leer el archivo de la clave de servicio
  const serviceAccountPath = 'service-account-key.json';
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: No se encontró el archivo service-account-key.json');
    process.exit(1);
  }

  const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
  
  // Verificar que el JSON es válido
  const parsedData = JSON.parse(serviceAccountData);
  console.log('✅ JSON válido leído');
  console.log(`📋 Project ID: ${parsedData.project_id}`);
  console.log(`📧 Client Email: ${parsedData.client_email}`);

  // Crear un archivo temporal con el JSON como string escapado
  const escapedJson = JSON.stringify(serviceAccountData);
  const tempFile = 'temp-firebase-env.txt';
  fs.writeFileSync(tempFile, escapedJson);

  try {
    // Agregar la variable de entorno usando el archivo temporal
    console.log('\n🔧 Agregando variable de entorno...');
    
    const command = `vercel env add FIREBASE_SERVICE_ACCOUNT production < ${tempFile}`;
    
    if (process.platform === 'win32') {
      // Para Windows, usar PowerShell
      execSync(`powershell -Command "Get-Content '${tempFile}' | vercel env add FIREBASE_SERVICE_ACCOUNT production"`, { 
        stdio: 'inherit',
        shell: true 
      });
    } else {
      // Para Unix/Linux/Mac
      execSync(command, { stdio: 'inherit' });
    }

    console.log('✅ Variable de entorno agregada exitosamente');
    
  } catch (error) {
    console.error('❌ Error agregando variable de entorno:', error.message);
    console.log('\n📝 Configuración manual:');
    console.log('1. Ve a https://vercel.com/dashboard');
    console.log('2. Selecciona tu proyecto match-tag-21');
    console.log('3. Ve a Settings → Environment Variables');
    console.log('4. Agrega FIREBASE_SERVICE_ACCOUNT con este valor:');
    console.log(serviceAccountData);
  } finally {
    // Limpiar archivo temporal
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log('\n🎉 ¡Configuración completada!');
console.log('📝 Próximos pasos:');
console.log('1. Redeploy tu aplicación: vercel --prod');
console.log('2. Prueba el botón "Probar API" en el panel de inventario');
