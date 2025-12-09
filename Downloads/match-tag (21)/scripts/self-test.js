console.log("[v0] Iniciando auto-verificación del sistema...")

// Test 1: Verificar configuración de Firebase
console.log("[v0] Test 1: Verificando configuración de Firebase...")
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_SERVICE_ACCOUNT",
]

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingVars.length > 0) {
  console.error("[v0] Variables de entorno faltantes:", missingVars)
} else {
  console.log("[v0] ✅ Todas las variables de entorno están configuradas")
}

// Test 2: Verificar estructura de datos de prueba
console.log("[v0] Test 2: Creando datos de prueba...")

import { adb } from "../lib/admin.js"

async function createTestData() {
  try {
    // Crear bar de prueba
    const testBarId = "TEST_BAR"
    await adb.doc(`bars/${testBarId}`).set({
      name: "Bar de Prueba",
      theme: {
        primaryColor: "#0ea5e9",
        secondaryColor: "#1f2937",
        textColor: "#ffffff",
      },
      logoUrl: "/logo-bar.jpg",
      bgImage: null,
      typography: "Inter",
      createdAt: new Date().toISOString(),
    })

    // Crear mesa de prueba
    await adb.doc(`bars/${testBarId}/tables/T1`).set({
      tableName: "Mesa VIP 1",
      accentColor: "#ec4899",
      bgImage: null,
      createdAt: new Date().toISOString(),
    })

    console.log("[v0] ✅ Datos de prueba creados exitosamente")

    // Test 3: Verificar API de CRM
    console.log("[v0] Test 3: Verificando API de CRM...")

    const testOrder = {
      id: "test_order_" + Date.now(),
      barId: testBarId,
      tableId: "T1",
      customer: {
        name: "Cliente de Prueba",
        phone: "+1234567890",
        email: "test@example.com",
      },
      items: [
        { name: "Cerveza", qty: 2, price: 5.0 },
        { name: "Nachos", qty: 1, price: 8.5 },
      ],
      total: 18.5,
      createdAt: new Date().toISOString(),
    }

    // Simular llamada a API de CRM
    const response = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: testOrder }),
    })

    if (response.ok) {
      console.log("[v0] ✅ API de CRM funcionando correctamente")
    } else {
      console.error("[v0] ❌ Error en API de CRM:", await response.text())
    }
  } catch (error) {
    console.error("[v0] Error en auto-verificación:", error)
  }
}

createTestData()

console.log("[v0] Auto-verificación completada")
console.log("[v0] Para probar manualmente:")
console.log("[v0] 1. Visitar: /mesa?barId=TEST_BAR&tableId=T1")
console.log("[v0] 2. Verificar que se muestre el logo y colores correctos")
console.log("[v0] 3. Crear un pedido de prueba")
console.log("[v0] 4. Revisar integration_logs en Firestore")
