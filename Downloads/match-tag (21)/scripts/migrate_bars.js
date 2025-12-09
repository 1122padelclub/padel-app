/**
 * Script de migración masiva para todos los bares
 * Requiere Firebase Admin SDK y credenciales de servicio
 *
 * Uso:
 * 1. Colocar serviceAccount.json en la raíz del proyecto
 * 2. Ejecutar: node scripts/migrate_bars.js
 */

const { initializeApp, cert } = require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")
const path = require("path")

// Configuración
const BATCH_SIZE = 50 // Procesar bares en lotes para evitar límites de Firestore
const CURRENT_SCHEMA_VERSION = 2

// Inicializar Firebase Admin
let db
try {
  const serviceAccountPath = path.join(__dirname, "../serviceAccount.json")
  const serviceAccount = require(serviceAccountPath)

  initializeApp({
    credential: cert(serviceAccount),
  })

  db = getFirestore()
  console.log("✅ Firebase Admin SDK inicializado correctamente")
} catch (error) {
  console.error("❌ Error inicializando Firebase Admin SDK:")
  console.error("   Asegúrate de que serviceAccount.json existe en la raíz del proyecto")
  console.error("   Error:", error.message)
  process.exit(1)
}

// Configuración por defecto para temas
const DEFAULT_THEME_CONFIG = {
  colors: {
    background: "#0b234a",
    surface: "rgba(0,0,0,0.35)",
    text: "#e5e7eb",
    primary: "#0d1b2a",
    secondary: "#1f2937",
    menuText: "#ffffff",
  },
  menuCustomization: {
    borderRadius: 12,
    showPrices: true,
    showDescriptions: true,
  },
}

// Configuración por defecto para sitio de reservas
const DEFAULT_RESERVATION_CONFIG = {
  heroTitle: "Reserva tu Mesa",
  heroSubtitle: "Disfruta de una experiencia gastronómica única",
  colorPrimary: "#3b82f6",
  logoUrl: null,
  backgroundUrl: null,
  showAvailability: true,
  requirePhone: true,
  maxAdvanceDays: 30,
}

/**
 * Migra un bar específico usando Firebase Admin SDK
 */
async function migrateBarAdmin(barId, barData) {
  try {
    const currentVersion = barData?.meta?.schemaVersion ?? 0

    if (currentVersion >= CURRENT_SCHEMA_VERSION) {
      return { success: true, migrated: false, version: currentVersion }
    }

    console.log(`   📦 Migrando bar ${barId} desde versión ${currentVersion} a ${CURRENT_SCHEMA_VERSION}`)

    const barRef = db.collection("bars").doc(barId)
    const batch = db.batch()

    // Migración v0 -> v1: Asegurar themeConfig/default existe
    if (currentVersion < 1) {
      const themeRef = barRef.collection("themeConfig").doc("default")
      const themeSnap = await themeRef.get()

      if (!themeSnap.exists) {
        // Migrar tema legacy si existe
        const legacyTheme = barData?.theme || barData?.themeConfig
        const themeConfig = {
          ...DEFAULT_THEME_CONFIG,
          ...(legacyTheme || {}),
          updatedAt: new Date(),
        }

        batch.set(themeRef, themeConfig)
        console.log(`      ✨ Creando themeConfig/default`)
      }
    }

    // Migración v1 -> v2: Asegurar reservationSite/config existe
    if (currentVersion < 2) {
      const reservationRef = barRef.collection("reservationSite").doc("config")
      const reservationSnap = await reservationRef.get()

      if (!reservationSnap.exists) {
        // Migrar configuración legacy si existe
        const legacyReservation = barData?.reservationSite || barData?.publicSite
        const reservationConfig = {
          ...DEFAULT_RESERVATION_CONFIG,
          ...(legacyReservation || {}),
          updatedAt: new Date(),
        }

        batch.set(reservationRef, reservationConfig)
        console.log(`      🏪 Creando reservationSite/config`)
      }
    }

    // Actualizar versión del esquema en el documento principal
    batch.update(barRef, {
      "meta.schemaVersion": CURRENT_SCHEMA_VERSION,
      "meta.updatedAt": new Date(),
      "meta.migratedAt": new Date(),
    })

    // Ejecutar todas las operaciones en batch
    await batch.commit()

    console.log(`   ✅ Bar ${barId} migrado exitosamente a versión ${CURRENT_SCHEMA_VERSION}`)

    return {
      success: true,
      migrated: true,
      version: CURRENT_SCHEMA_VERSION,
    }
  } catch (error) {
    console.error(`   ❌ Error migrando bar ${barId}:`, error.message)
    return {
      success: false,
      migrated: false,
      version: 0,
      error: error.message,
    }
  }
}

/**
 * Función principal de migración masiva
 */
async function migrateAll() {
  console.log("🚀 Iniciando migración masiva de bares...")
  console.log(`📊 Versión objetivo del esquema: ${CURRENT_SCHEMA_VERSION}`)
  console.log(`📦 Tamaño de lote: ${BATCH_SIZE}`)
  console.log("")

  const results = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: [],
    startTime: new Date(),
  }

  try {
    // Obtener todos los documentos de bares (paginado)
    let lastDoc = null
    let hasMore = true

    while (hasMore) {
      let query = db.collection("bars").limit(BATCH_SIZE)

      if (lastDoc) {
        query = query.startAfter(lastDoc)
      }

      const snapshot = await query.get()

      if (snapshot.empty) {
        hasMore = false
        break
      }

      console.log(`📋 Procesando lote de ${snapshot.docs.length} bares...`)

      // Procesar cada bar en el lote actual
      for (const doc of snapshot.docs) {
        const barId = doc.id
        const barData = doc.data()

        results.total++

        try {
          const result = await migrateBarAdmin(barId, barData)

          if (result.success) {
            if (result.migrated) {
              results.migrated++
            } else {
              results.skipped++
              console.log(`   ⏭️  Bar ${barId} ya está actualizado (v${result.version})`)
            }
          } else {
            results.errors.push({
              id: barId,
              error: result.error || "Error desconocido",
            })
          }
        } catch (error) {
          results.errors.push({
            id: barId,
            error: error.message,
          })
        }
      }

      lastDoc = snapshot.docs[snapshot.docs.length - 1]

      // Pausa breve entre lotes para no sobrecargar Firestore
      if (hasMore) {
        console.log("⏳ Pausa entre lotes...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  } catch (error) {
    console.error("❌ Error durante la migración masiva:", error)
    results.errors.push({ id: "GLOBAL", error: error.message })
  }

  // Mostrar resumen final
  const endTime = new Date()
  const duration = Math.round((endTime - results.startTime) / 1000)

  console.log("")
  console.log("📊 RESUMEN DE MIGRACIÓN")
  console.log("========================")
  console.log(`⏱️  Duración: ${duration} segundos`)
  console.log(`📦 Total de bares procesados: ${results.total}`)
  console.log(`✅ Bares migrados: ${results.migrated}`)
  console.log(`⏭️  Bares ya actualizados: ${results.skipped}`)
  console.log(`❌ Errores: ${results.errors.length}`)

  if (results.errors.length > 0) {
    console.log("")
    console.log("❌ ERRORES DETALLADOS:")
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. Bar ${error.id}: ${error.error}`)
    })
  }

  console.log("")
  if (results.errors.length === 0) {
    console.log("🎉 ¡Migración completada exitosamente!")
  } else {
    console.log("⚠️  Migración completada con errores. Revisa los detalles arriba.")
  }

  return results
}

/**
 * Función para verificar el estado de migración sin ejecutar cambios
 */
async function checkMigrationStatus() {
  console.log("🔍 Verificando estado de migración de bares...")

  const stats = {
    total: 0,
    needsMigration: 0,
    upToDate: 0,
    versions: {},
  }

  try {
    const snapshot = await db.collection("bars").get()

    for (const doc of snapshot.docs) {
      const data = doc.data()
      const version = data?.meta?.schemaVersion ?? 0

      stats.total++
      stats.versions[version] = (stats.versions[version] || 0) + 1

      if (version < CURRENT_SCHEMA_VERSION) {
        stats.needsMigration++
      } else {
        stats.upToDate++
      }
    }

    console.log("")
    console.log("📊 ESTADO ACTUAL DE MIGRACIÓN")
    console.log("==============================")
    console.log(`📦 Total de bares: ${stats.total}`)
    console.log(`🔄 Necesitan migración: ${stats.needsMigration}`)
    console.log(`✅ Actualizados: ${stats.upToDate}`)
    console.log("")
    console.log("📋 Distribución por versión:")
    Object.entries(stats.versions).forEach(([version, count]) => {
      const status = Number.parseInt(version) < CURRENT_SCHEMA_VERSION ? "❌" : "✅"
      console.log(`   ${status} Versión ${version}: ${count} bares`)
    })
  } catch (error) {
    console.error("❌ Error verificando estado:", error)
  }

  return stats
}

// Ejecutar script según argumentos de línea de comandos
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || "help"

  try {
    switch (command) {
      case "check":
        console.log("🔍 Verificando estado de migración de todos los bares...")
        await checkMigrationStatus()
        break
      case "migrate":
        console.log("🚀 Iniciando migración masiva de bares...")
        const confirm = args.includes("--force") || args.includes("-f")
        if (!confirm) {
          console.log("⚠️  Esta operación modificará todos los bares en la base de datos.")
          console.log("   Para confirmar, ejecuta: node scripts/migrate_bars.js migrate --force")
          process.exit(0)
        }
        await migrateAll()
        break
      case "single":
        const barId = args[1]
        if (!barId) {
          console.log("❌ Error: Se requiere barId")
          console.log("   Uso: node scripts/migrate_bars.js single <barId>")
          process.exit(1)
        }
        console.log(`🔄 Migrando bar individual: ${barId}`)
        const barRef = db.collection("bars").doc(barId)
        const barSnap = await barRef.get()
        if (!barSnap.exists) {
          console.log(`❌ Bar ${barId} no encontrado`)
          process.exit(1)
        }
        const result = await migrateBarAdmin(barId, barSnap.data())
        if (result.success) {
          console.log(`✅ Bar ${barId} migrado exitosamente`)
        } else {
          console.log(`❌ Error migrando bar ${barId}: ${result.error}`)
        }
        break
      case "help":
      default:
        console.log("📚 SCRIPT DE MIGRACIÓN DE BARES")
        console.log("================================")
        console.log("")
        console.log("Comandos disponibles:")
        console.log("  check                    # Verificar estado de migración")
        console.log("  migrate --force          # Ejecutar migración masiva")
        console.log("  single <barId>           # Migrar un bar específico")
        console.log("  help                     # Mostrar esta ayuda")
        console.log("")
        console.log("Ejemplos:")
        console.log("  node scripts/migrate_bars.js check")
        console.log("  node scripts/migrate_bars.js migrate --force")
        console.log("  node scripts/migrate_bars.js single abc123")
        break
    }
  } catch (error) {
    console.error("❌ Error ejecutando script:", error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  migrateAll,
  checkMigrationStatus,
  migrateBarAdmin,
}
