// Script para inicializar configuración de tema para el bar específico
import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"

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
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: {
      small: "14px",
      medium: "16px",
      large: "18px",
      xlarge: "24px",
    },
  },
  assets: {
    logo: null,
    backgroundImage: null,
  },
  menuCustomization: {
    borderRadius: 12,
    cardStyle: "modern",
    spacing: "comfortable",
  },
  branding: {
    barName: "Mi Bar",
    description: "Bienvenidos a nuestro bar",
    primaryColor: "#0d1b2a",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

async function initializeThemeConfig() {
  try {
    console.log("🎨 Inicializando configuración de tema...")

    // Bar específico que está causando problemas
    const problematicBarId = "4svN1VAEPQa8ukZpd2bz"

    // Lista de bars para inicializar (puedes agregar más IDs aquí)
    const barIds = [
      problematicBarId,
      // Agregar otros barIds si es necesario
    ]

    for (const barId of barIds) {
      console.log(`📋 Procesando bar: ${barId}`)

      // Verificar si ya existe configuración
      const themeRef = doc(db, "bars", barId, "themeConfig", "default")
      const existingDoc = await getDoc(themeRef)

      if (existingDoc.exists()) {
        console.log(`✅ Configuración ya existe para bar ${barId}`)
        const data = existingDoc.data()
        console.log("📊 Configuración actual:", {
          hasColors: !!data.colors,
          hasTypography: !!data.typography,
          hasAssets: !!data.assets,
          hasBranding: !!data.branding,
        })
      } else {
        console.log(`🆕 Creando nueva configuración para bar ${barId}`)

        // Crear configuración por defecto
        await setDoc(themeRef, DEFAULT_THEME_CONFIG)
        console.log(`✅ Configuración creada exitosamente para bar ${barId}`)
      }

      // Verificar que se puede leer la configuración
      const verifyDoc = await getDoc(themeRef)
      if (verifyDoc.exists()) {
        console.log(`✅ Verificación exitosa - configuración accesible para bar ${barId}`)
      } else {
        console.error(`❌ Error - no se puede acceder a la configuración para bar ${barId}`)
      }
    }

    console.log("🎉 Inicialización de configuración de tema completada")

    // Crear configuración global si no existe
    console.log("🌐 Verificando configuración global...")
    const globalThemeRef = doc(db, "globalConfig", "theme")
    const globalDoc = await getDoc(globalThemeRef)

    if (!globalDoc.exists()) {
      await setDoc(globalThemeRef, {
        defaultTheme: DEFAULT_THEME_CONFIG,
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
      })
      console.log("✅ Configuración global creada")
    }

    return { success: true, message: "Configuración de tema inicializada correctamente" }
  } catch (error) {
    console.error("❌ Error inicializando configuración de tema:", error)
    return { success: false, error: error.message }
  }
}

// Ejecutar el script
initializeThemeConfig()
  .then((result) => {
    if (result.success) {
      console.log("✅ Script completado exitosamente")
    } else {
      console.error("❌ Script falló:", result.error)
    }
  })
  .catch((error) => {
    console.error("❌ Error ejecutando script:", error)
  })
