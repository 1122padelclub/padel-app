#!/usr/bin/env node

/**
 * Script para probar la API de inventario
 * Ejecutar con: node scripts/test-inventory-api.js
 */

const https = require('https');

console.log('🧪 Probando API de inventario...\n');

// URL de tu aplicación desplegada
const baseUrl = 'https://match-tag-21-kiglelbpa-gibracompany-3588s-projects.vercel.app';

async function testAPI(endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: new URL(baseUrl).hostname,
      port: 443,
      path: endpoint,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runTests() {
  try {
    // Test 1: Verificar configuración de Firebase
    console.log('1️⃣ Probando configuración de Firebase...');
    const configTest = await testAPI('/api/inventory/test');
    
    if (configTest.status === 200 && configTest.data.success) {
      console.log('✅ Configuración de Firebase: OK');
      console.log(`   Project ID: ${configTest.data.projectId}`);
      console.log(`   Client Email: ${configTest.data.clientEmail}`);
    } else {
      console.log('❌ Configuración de Firebase: FALLO');
      console.log(`   Error: ${configTest.data.error || 'Unknown error'}`);
      return;
    }

    // Test 2: Probar API de inventario
    console.log('\n2️⃣ Probando API de inventario...');
    const inventoryTest = await testAPI('/api/inventory/process-order', {
      orderId: `test_${Date.now()}`,
      barId: 'F1It58glCbBLTVwYVOjM', // Tu barId
      orderItems: [
        {
          menuItemId: 'test_menu_item',
          name: 'Hamburguesa de Prueba',
          quantity: 1,
          selectedModifiers: []
        }
      ],
      action: 'deduct'
    });

    if (inventoryTest.status === 200 && inventoryTest.data.success) {
      console.log('✅ API de inventario: OK');
      console.log(`   Procesados: ${inventoryTest.data.processed?.length || 0} items`);
    } else {
      console.log('⚠️ API de inventario: ADVERTENCIA');
      console.log(`   Status: ${inventoryTest.status}`);
      console.log(`   Response: ${JSON.stringify(inventoryTest.data, null, 2)}`);
    }

    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve al panel de administración');
    console.log('2. Haz clic en "Probar API" en la pestaña de Inventario');
    console.log('3. Verifica que aparezca "✅ API de inventario funcionando correctamente"');

  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error.message);
  }
}

runTests();
