#!/usr/bin/env node

/**
 * Prueba rápida de la API de inventario
 */

const https = require('https');

console.log('🧪 Prueba rápida de la API de inventario...\n');

const baseUrl = 'https://match-tag-21-kiglelbpa-gibracompany-3588s-projects.vercel.app';

function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(baseUrl).hostname,
      port: 443,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.end();
  });
}

async function runTest() {
  try {
    console.log('🔍 Probando configuración de Firebase...');
    const result = await testAPI('/api/inventory/test');
    
    console.log(`📊 Status: ${result.status}`);
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ ¡API funcionando correctamente!');
      console.log(`📋 Project ID: ${result.data.projectId}`);
      console.log(`📧 Client Email: ${result.data.clientEmail}`);
      console.log('\n🎉 ¡La configuración está perfecta!');
      console.log('📝 Ahora puedes probar el botón "Probar API" en tu aplicación.');
    } else {
      console.log('❌ Error en la API:');
      console.log(JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

runTest();
