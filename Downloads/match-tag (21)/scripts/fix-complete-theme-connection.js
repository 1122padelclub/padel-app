// Script completo para corregir la conexión entre panel de temas y mesas
import { initializeApp } from "firebase/app"
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore"

// Configuración de Firebase
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

// Configuración completa por defecto para temas
const COMPLETE_THEME_CONFIG = {
  mode: "dark",
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
  typography: {
    baseFont: "Inter",
    scale: "medium",
    headerFont: "Dancing Script",
    categoryFont: "Dancing Script",
    priceFont: "Inter",
    bodyFont: "Inter",
  },
  assets: {
    logoUrl: null,
    faviconUrl: null,
    backgroundImageUrl: null,
    backgroundVideoUrl: null,
    watermarkUrl: null,
    menuBackgroundUrl: null,
    headerBackgroundUrl: null,
    categoryIconsUrl: [],
  },
  layoutPreset: "classic",
  soundPack: {
    enabled: false,
  },
  haptics: {
    enabled: true,
  },
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    currency: "EUR",
    priceFormat: "€{amount}",
    serviceFeePct: 0,
    defaultTipPct: 10,
  },
  eventSkins: [],
  menuCustomization: {
    categoryStyle: "rounded",
    showCategoryImages: true,
    categoryImagePosition: "left",
    headerStyle: "overlay",
    menuLayout: "grid",
    borderRadius: 12,
    shadowIntensity: "medium",
    backgroundOpacity: 85,
  },
  branding: {
    restaurantName: "Match Tag",
    tagline: "Conecta con otras mesas",
    showPoweredBy: true,
  },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}

async function fixCompleteThemeConnection() {
  console.log("🔧 Iniciando corrección completa de conexión de temas...")

  try {
    // 1. Verificar y crear configuración para el bar problemático
    const problematicBarId = "4svN1VAEPQa8ukZpd2bz"
    console.log(`\n🎯 Corrigiendo bar específico: ${problematicBarId}`)

    // Verificar si el bar existe
    const barRef = doc(db, "bars", problematicBarId)
    const barSnap = await getDoc(barRef)

    if (!barSnap.exists()) {
      console.log("   📝 Creando bar básico...")
      await setDoc(barRef, {
        name: "Match Tag Bar",
        address: "Dirección de prueba",
        phone: "+1234567890",
        email: "test@matchtag.com",
        description: "Bar de prueba para Match Tag",
        meta: {
          schemaVersion: 2,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      console.log("   ✅ Bar creado exitosamente")
    } else {
      console.log("   ✅ Bar existe en la base de datos")
    }

    // Crear/actualizar configuración de tema
    const themeRef = doc(db, "bars", problematicBarId, "themeConfig", "default")
    const themeSnap = await getDoc(themeRef)

    if (!themeSnap.exists()) {
      console.log("   📝 Creando configuración de tema completa...")
      await setDoc(themeRef, COMPLETE_THEME_CONFIG)
      console.log("   ✅ Configuración de tema creada")
    } else {
      console.log("   📝 Actualizando configuración de tema existente...")
      const existingData = themeSnap.data()
      const mergedConfig = {
        ...COMPLETE_THEME_CONFIG,
        ...existingData,
        colors: {
          ...COMPLETE_THEME_CONFIG.colors,
          ...(existingData.colors || {}),
        },
        typography: {
          ...COMPLETE_THEME_CONFIG.typography,
          ...(existingData.typography || {}),
        },
        assets: {
          ...COMPLETE_THEME_CONFIG.assets,
          ...(existingData.assets || {}),
        },
        menuCustomization: {
          ...COMPLETE_THEME_CONFIG.menuCustomization,
          ...(existingData.menuCustomization || {}),
        },
        branding: {
          ...COMPLETE_THEME_CONFIG.branding,
          ...(existingData.branding || {}),
        },
        updatedAt: serverTimestamp(),
      }
      await updateDoc(themeRef, mergedConfig)
      console.log("   ✅ Configuración de tema actualizada")
    }

    // 2. Verificar todos los bares y crear configuraciones faltantes
    console.log("\n📋 Verificando todos los bares...")
    const barsCollection = collection(db, "bars")
    const barsSnapshot = await getDocs(barsCollection)

    const batch = writeBatch(db)
    let barsProcessed = 0
    let themesCreated = 0

    for (const barDoc of barsSnapshot.docs) {
      const barId = barDoc.id
      const barData = barDoc.data()

      console.log(`   🏪 Procesando bar: ${barId} (${barData.name || "Sin nombre"})`)

      const themeRef = doc(db, "bars", barId, "themeConfig", "default")
      const themeSnap = await getDoc(themeRef)

      if (!themeSnap.exists()) {
        console.log(`      📝 Creando tema para ${barId}`)
        batch.set(themeRef, {
          ...COMPLETE_THEME_CONFIG,
          branding: {
            ...COMPLETE_THEME_CONFIG.branding,
            restaurantName: barData.name || "Mi Restaurante",
          },
        })
        themesCreated++
      } else {
        console.log(`      ✅ Tema ya existe para ${barId}`)
      }

      barsProcessed++
    }

    if (themesCreated > 0) {
      console.log(`\n💾 Guardando ${themesCreated} configuraciones de tema...`)
      await batch.commit()
      console.log("   ✅ Todas las configuraciones guardadas")
    }

    // 3. Verificar la API de temas
    console.log("\n🔌 Verificando API de temas...")
    try {
      const response = await fetch(`/api/bars/${problematicBarId}/theme`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const themeData = await response.json()
        console.log("   ✅ API de temas responde correctamente")
        console.log("   📋 Datos del tema:", JSON.stringify(themeData, null, 2))
      } else {
        console.log("   ⚠️ API de temas no responde correctamente:", response.status)
      }
    } catch (error) {
      console.log("   ⚠️ Error verificando API de temas:", error.message)
    }

    // 4. Resumen final
    console.log("\n📊 RESUMEN DE CORRECCIÓN:")
    console.log(`   Bares procesados: ${barsProcessed}`)
    console.log(`   Temas creados: ${themesCreated}`)
    console.log(`   Bar problemático corregido: ${problematicBarId}`)

    console.log("\n✅ CORRECCIÓN COMPLETA FINALIZADA")
    console.log("\n📝 PRÓXIMOS PASOS:")
    console.log("   1. Recarga la página del panel de temas")
    console.log("   2. Verifica que puedes cambiar colores, tipografía y assets")
    console.log("   3. Abre una mesa y verifica que los cambios se aplican")
    console.log("   4. Los errores de permisos deberían haber desaparecido")
  } catch (error) {
    console.error("❌ Error durante la corrección completa:", error)
    throw error
  }
}

// Ejecutar la corrección
fixCompleteThemeConnection()
  .then(() => {
    console.log("\n🎉 Script de corrección completa ejecutado exitosamente")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Error ejecutando script de corrección:", error)
    process.exit(1)
  })
