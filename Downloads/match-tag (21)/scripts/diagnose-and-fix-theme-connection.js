// Script para diagnosticar y corregir la conexión de temas con las mesas
import { initializeApp } from "firebase/app"
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "firebase/firestore"

// Configuración de Firebase (usando variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Configuración por defecto para temas
const DEFAULT_THEME_CONFIG = {
  colors: {
    background: "#0b234a",
    surface: "rgba(0,0,0,0.35)",
    text: "#e5e7eb",
    primary: "#0d1b2a",
    secondary: "#1f2937",
    menuText: "#ffffff",
    success: "#22c55e",
    danger: "#ef4444",
    customBackground: null,
  },
  menuCustomization: {
    borderRadius: 12,
    showPrices: true,
    showDescriptions: true,
  },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}

async function diagnoseThemeConnection() {
  console.log("🔍 Iniciando diagnóstico de conexión de temas...")

  try {
    // 1. Obtener todos los bares
    console.log("📋 Obteniendo lista de bares...")
    const barsCollection = collection(db, "bars")
    const barsSnapshot = await getDocs(barsCollection)

    if (barsSnapshot.empty) {
      console.log("❌ No se encontraron bares en la base de datos")
      return
    }

    console.log(`✅ Encontrados ${barsSnapshot.size} bares`)

    // 2. Verificar cada bar
    const results = []

    for (const barDoc of barsSnapshot.docs) {
      const barId = barDoc.id
      const barData = barDoc.data()

      console.log(`\n🏪 Verificando bar: ${barId}`)
      console.log(`   Nombre: ${barData.name || "Sin nombre"}`)

      // Verificar si existe themeConfig/default
      const themeRef = doc(db, "bars", barId, "themeConfig", "default")
      const themeSnap = await getDoc(themeRef)

      const result = {
        barId,
        barName: barData.name || "Sin nombre",
        hasThemeConfig: themeSnap.exists(),
        themeData: themeSnap.exists() ? themeSnap.data() : null,
        needsCreation: !themeSnap.exists(),
        schemaVersion: barData.meta?.schemaVersion || 0,
      }

      if (themeSnap.exists()) {
        console.log("   ✅ Configuración de tema encontrada")
        const themeData = themeSnap.data()
        console.log(`   🎨 Colores: background=${themeData.colors?.background}, primary=${themeData.colors?.primary}`)
      } else {
        console.log("   ❌ Configuración de tema NO encontrada")
        console.log("   🔧 Necesita creación de configuración por defecto")
      }

      results.push(result)
    }

    // 3. Resumen del diagnóstico
    console.log("\n📊 RESUMEN DEL DIAGNÓSTICO:")
    console.log(`Total de bares: ${results.length}`)
    console.log(`Con configuración de tema: ${results.filter((r) => r.hasThemeConfig).length}`)
    console.log(`Sin configuración de tema: ${results.filter((r) => !r.hasThemeConfig).length}`)

    // 4. Crear configuraciones faltantes
    const barsNeedingTheme = results.filter((r) => !r.hasThemeConfig)

    if (barsNeedingTheme.length > 0) {
      console.log(`\n🔧 Creando configuraciones de tema para ${barsNeedingTheme.length} bares...`)

      for (const bar of barsNeedingTheme) {
        try {
          const themeRef = doc(db, "bars", bar.barId, "themeConfig", "default")
          await setDoc(themeRef, DEFAULT_THEME_CONFIG)
          console.log(`   ✅ Creada configuración para bar: ${bar.barId} (${bar.barName})`)
        } catch (error) {
          console.error(`   ❌ Error creando configuración para bar ${bar.barId}:`, error)
        }
      }
    }

    // 5. Verificar bar específico del error
    const problematicBarId = "4svN1VAEPQa8ukZpd2bz"
    console.log(`\n🎯 Verificación específica del bar problemático: ${problematicBarId}`)

    const specificBarRef = doc(db, "bars", problematicBarId)
    const specificBarSnap = await getDoc(specificBarRef)

    if (specificBarSnap.exists()) {
      console.log("   ✅ Bar encontrado en la base de datos")
      const specificThemeRef = doc(db, "bars", problematicBarId, "themeConfig", "default")
      const specificThemeSnap = await getDoc(specificThemeRef)

      if (specificThemeSnap.exists()) {
        console.log("   ✅ Configuración de tema encontrada para este bar")
        console.log("   📋 Datos del tema:", JSON.stringify(specificThemeSnap.data(), null, 2))
      } else {
        console.log("   ❌ Configuración de tema NO encontrada para este bar")
        console.log("   🔧 Creando configuración por defecto...")

        try {
          await setDoc(specificThemeRef, DEFAULT_THEME_CONFIG)
          console.log("   ✅ Configuración creada exitosamente")
        } catch (error) {
          console.error("   ❌ Error creando configuración:", error)
        }
      }
    } else {
      console.log("   ❌ Bar NO encontrado en la base de datos")
      console.log("   🔧 Creando bar con configuración básica...")

      try {
        // Crear el bar básico
        await setDoc(specificBarRef, {
          name: "Bar de Prueba",
          address: "Dirección de prueba",
          phone: "+1234567890",
          email: "test@example.com",
          meta: {
            schemaVersion: 2,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        // Crear la configuración de tema
        const newThemeRef = doc(db, "bars", problematicBarId, "themeConfig", "default")
        await setDoc(newThemeRef, DEFAULT_THEME_CONFIG)

        console.log("   ✅ Bar y configuración de tema creados exitosamente")
      } catch (error) {
        console.error("   ❌ Error creando bar y configuración:", error)
      }
    }

    console.log("\n🎉 Diagnóstico y corrección completados")
  } catch (error) {
    console.error("❌ Error durante el diagnóstico:", error)
  }
}

// Ejecutar el diagnóstico
diagnoseThemeConnection()
  .then(() => {
    console.log("✅ Script completado")
  })
  .catch((error) => {
    console.error("❌ Error ejecutando script:", error)
  })
