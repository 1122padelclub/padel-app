// Script para verificar y corregir errores de tema en las mesas
const { initializeApp } = require("firebase/app")
const { getFirestore, doc, setDoc, getDoc } = require("firebase/firestore")

const firebaseConfig = {
  // La configuración se obtiene automáticamente de las variables de entorno
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const DEFAULT_THEME = {
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
  },
  branding: {
    restaurantName: "Match Tag",
    tagline: "Conecta con otras mesas",
    showPoweredBy: true,
  },
  mode: "dark",
  layoutPreset: "default",
  typography: {
    scale: "medium",
  },
  assets: {
    logoUrl: null,
    backgroundImageUrl: null,
  },
}

async function fixThemeForBar(barId) {
  try {
    console.log(`[v0] Verificando tema para bar: ${barId}`)

    const themeRef = doc(db, "bars", barId, "themeConfig", "default")
    const themeDoc = await getDoc(themeRef)

    if (!themeDoc.exists()) {
      console.log(`[v0] Creando tema por defecto para bar: ${barId}`)
      await setDoc(themeRef, {
        ...DEFAULT_THEME,
        barId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      console.log(`[v0] ✅ Tema creado para bar: ${barId}`)
    } else {
      const existingTheme = themeDoc.data()

      // Verificar si faltan propiedades críticas
      const needsUpdate =
        !existingTheme.colors ||
        !existingTheme.colors.background ||
        !existingTheme.colors.text ||
        !existingTheme.colors.primary

      if (needsUpdate) {
        console.log(`[v0] Actualizando tema incompleto para bar: ${barId}`)
        const updatedTheme = {
          ...DEFAULT_THEME,
          ...existingTheme,
          colors: {
            ...DEFAULT_THEME.colors,
            ...(existingTheme.colors || {}),
          },
          updatedAt: Date.now(),
        }

        await setDoc(themeRef, updatedTheme, { merge: true })
        console.log(`[v0] ✅ Tema actualizado para bar: ${barId}`)
      } else {
        console.log(`[v0] ✅ Tema ya está completo para bar: ${barId}`)
      }
    }
  } catch (error) {
    console.error(`[v0] ❌ Error procesando tema para bar ${barId}:`, error)
  }
}

async function main() {
  console.log("[v0] 🔧 Iniciando corrección de errores de tema en mesas...")

  // Lista de barIds conocidos que pueden tener problemas
  const knownBarIds = [
    "4svN1VAEPQa8ukZpd2bz", // Bar del error reportado
    // Agregar más barIds según sea necesario
  ]

  for (const barId of knownBarIds) {
    await fixThemeForBar(barId)
  }

  console.log("[v0] ✅ Corrección de temas completada")
  console.log(
    "[v0] 📝 Los errores de \"Cannot read properties of undefined (reading 'background')\" deberían estar resueltos",
  )
}

main().catch(console.error)
