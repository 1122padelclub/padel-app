const admin = require("firebase-admin")

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
  })
}

const db = admin.firestore()

async function fixThemePermissions() {
  console.log("🎨 Iniciando corrección de permisos de temas...")

  try {
    // 1. Obtener todos los bares
    const barsSnapshot = await db.collection("bars").get()
    console.log(`📊 Encontrados ${barsSnapshot.size} bares para procesar`)

    let processed = 0
    let created = 0
    let errors = 0

    // 2. Procesar cada bar
    for (const barDoc of barsSnapshot.docs) {
      const barId = barDoc.id
      const barData = barDoc.data()

      try {
        console.log(`🔧 Procesando bar: ${barId}`)

        // Verificar si ya existe themeConfig/default
        const themeRef = db.collection("bars").doc(barId).collection("themeConfig").doc("default")
        const themeDoc = await themeRef.get()

        if (!themeDoc.exists()) {
          // Crear configuración de tema por defecto
          const defaultThemeConfig = {
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
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }

          // Migrar datos legacy si existen
          if (barData.theme || barData.themeConfig) {
            const legacyTheme = barData.theme || barData.themeConfig
            defaultThemeConfig.colors = {
              ...defaultThemeConfig.colors,
              ...(legacyTheme.colors || {}),
            }
            defaultThemeConfig.menuCustomization = {
              ...defaultThemeConfig.menuCustomization,
              ...(legacyTheme.menuCustomization || {}),
            }
            console.log(`📦 Migrando datos legacy para bar ${barId}`)
          }

          await themeRef.set(defaultThemeConfig)
          created++
          console.log(`✅ Configuración de tema creada para bar ${barId}`)
        } else {
          console.log(`ℹ️  Configuración de tema ya existe para bar ${barId}`)
        }

        processed++
      } catch (error) {
        console.error(`❌ Error procesando bar ${barId}:`, error)
        errors++
      }
    }

    // 3. Crear bar de prueba específico para el error reportado
    const problemBarId = "4svN1VAEPQa8ukZpd2bz"
    console.log(`🔍 Verificando bar problemático: ${problemBarId}`)

    const problemBarRef = db.collection("bars").doc(problemBarId)
    const problemBarDoc = await problemBarRef.get()

    if (!problemBarDoc.exists()) {
      // Crear el bar si no existe
      await problemBarRef.set({
        name: "Bar de Prueba - Tema",
        address: "Dirección de prueba",
        phone: "+1234567890",
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log(`✅ Bar problemático creado: ${problemBarId}`)
    }

    // Crear configuración de tema para el bar problemático
    const problemThemeRef = problemBarRef.collection("themeConfig").doc("default")
    const problemThemeDoc = await problemThemeRef.get()

    if (!problemThemeDoc.exists()) {
      await problemThemeRef.set({
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
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log(`✅ Configuración de tema creada para bar problemático: ${problemBarId}`)
    }

    console.log(`🎉 Corrección completada:`)
    console.log(`   📊 Bares procesados: ${processed}`)
    console.log(`   ✅ Configuraciones creadas: ${created}`)
    console.log(`   ❌ Errores: ${errors}`)
  } catch (error) {
    console.error("❌ Error durante la corrección de permisos de temas:", error)
    throw error
  }
}

// Ejecutar la corrección
fixThemePermissions()
  .then(() => {
    console.log("✅ Script de corrección de temas completado exitosamente")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error en el script de corrección de temas:", error)
    process.exit(1)
  })
