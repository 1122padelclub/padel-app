import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, type Firestore } from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"

export const CURRENT_SCHEMA_VERSION = 2

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

export interface MigrationResult {
  success: boolean
  migrated: boolean
  version: number
  error?: string
}

/**
 * Migra un bar específico si es necesario (CLIENT VERSION - usa Firebase Client SDK)
 */
export async function migrateBarIfNeeded(db: Firestore, barId: string): Promise<MigrationResult> {
  try {
    const barRef = doc(db, "bars", barId)
    const barSnap = await getDoc(barRef)

    if (!barSnap.exists()) {
      return { success: false, migrated: false, version: 0, error: "Bar not found" }
    }

    const data = barSnap.data()
    const currentVersion = data?.meta?.schemaVersion ?? 0

    if (currentVersion >= CURRENT_SCHEMA_VERSION) {
      return { success: true, migrated: false, version: currentVersion }
    }

    console.log(`[Migration] Migrating bar ${barId} from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`)

    // Preparar datos de migración
    const migrationData: any = {}

    // Migración v0 -> v1: Asegurar themeConfig/default existe
    if (currentVersion < 1) {
      console.log(`[Migration] Applying v1 migration for bar ${barId}`)

      // Crear subcollection themeConfig/default si no existe
      const themeRef = doc(db, "bars", barId, "themeConfig", "default")
      const themeSnap = await getDoc(themeRef)

      if (!themeSnap.exists()) {
        // Migrar tema legacy si existe
        const legacyTheme = data?.theme || data?.themeConfig
        const themeConfig = {
          ...DEFAULT_THEME_CONFIG,
          ...(legacyTheme || {}),
          updatedAt: serverTimestamp(),
        }

        await setDoc(themeRef, themeConfig)
        console.log(`[Migration] Created themeConfig/default for bar ${barId}`)
      }
    }

    // Migración v1 -> v2: Asegurar reservationSite/config existe
    if (currentVersion < 2) {
      console.log(`[Migration] Applying v2 migration for bar ${barId}`)

      // Crear subcollection reservationSite/config si no existe
      const reservationRef = doc(db, "bars", barId, "reservationSite", "config")
      const reservationSnap = await getDoc(reservationRef)

      if (!reservationSnap.exists()) {
        // Migrar configuración legacy si existe
        const legacyReservation = data?.reservationSite || data?.publicSite
        const reservationConfig = {
          ...DEFAULT_RESERVATION_CONFIG,
          ...(legacyReservation || {}),
          updatedAt: serverTimestamp(),
        }

        await setDoc(reservationRef, reservationConfig)
        console.log(`[Migration] Created reservationSite/config for bar ${barId}`)
      }
    }

    // Actualizar versión del esquema en el documento principal
    migrationData["meta.schemaVersion"] = CURRENT_SCHEMA_VERSION
    migrationData["meta.updatedAt"] = serverTimestamp()
    migrationData["meta.migratedAt"] = serverTimestamp()

    await setDoc(barRef, migrationData, { merge: true })

    console.log(`[Migration] Successfully migrated bar ${barId} to version ${CURRENT_SCHEMA_VERSION}`)

    return {
      success: true,
      migrated: true,
      version: CURRENT_SCHEMA_VERSION,
    }
  } catch (error) {
    console.error(`[Migration] Error migrating bar ${barId}:`, error)
    return {
      success: false,
      migrated: false,
      version: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Verifica si un bar necesita migración (CLIENT VERSION)
 */
export async function checkBarMigrationStatus(
  db: Firestore,
  barId: string,
): Promise<{
  needsMigration: boolean
  currentVersion: number
  targetVersion: number
}> {
  try {
    const barRef = doc(db, "bars", barId)
    const barSnap = await getDoc(barRef)

    if (!barSnap.exists()) {
      return { needsMigration: false, currentVersion: 0, targetVersion: CURRENT_SCHEMA_VERSION }
    }

    const data = barSnap.data()
    const currentVersion = data?.meta?.schemaVersion ?? 0

    return {
      needsMigration: currentVersion < CURRENT_SCHEMA_VERSION,
      currentVersion,
      targetVersion: CURRENT_SCHEMA_VERSION,
    }
  } catch (error) {
    console.error(`Error checking migration status for bar ${barId}:`, error)
    return { needsMigration: false, currentVersion: 0, targetVersion: CURRENT_SCHEMA_VERSION }
  }
}

/**
 * Función helper para leer configuración de tema con fallback legacy (CLIENT VERSION)
 */
export async function readThemeConfig(db: Firestore, barId: string) {
  try {
    console.log(`[Theme] Reading theme config for bar: ${barId}`)

    // Intentar leer desde la nueva estructura
    const themeRef = doc(db, "bars", barId, "themeConfig", "default")
    const themeSnap = await getDoc(themeRef)

    if (themeSnap.exists()) {
      console.log(`[Theme] Found theme config in new structure for bar: ${barId}`)
      return themeSnap.data()
    }

    // Fallback legacy para compatibilidad (solo hasta que termine la migración)
    console.log(`[Legacy] Reading theme config from legacy location for bar ${barId}. Auto-migration will be attempted.`)
    const barRef = doc(db, "bars", barId)
    const barSnap = await getDoc(barRef)

    if (barSnap.exists()) {
      const barData = barSnap.data()
      const legacyTheme = barData?.theme || barData?.themeConfig
      if (legacyTheme) {
        console.log(`[Theme] Found legacy theme config for bar: ${barId}`)
        return legacyTheme
      }
    }

    console.log(`[Theme] No theme config found for bar ${barId}, using default`)
    return DEFAULT_THEME_CONFIG
  } catch (error) {
    console.warn(`Error reading theme config for bar ${barId}, using default:`, error)
    return DEFAULT_THEME_CONFIG
  }
}

/**
 * Función helper para leer configuración de reservas con fallback legacy (CLIENT VERSION)
 */
export async function readReservationConfig(db: Firestore, barId: string) {
  try {
    // Intentar leer desde la nueva estructura
    const reservationRef = doc(db, "bars", barId, "reservationSite", "config")
    const reservationSnap = await getDoc(reservationRef)

    if (reservationSnap.exists()) {
      return reservationSnap.data()
    }

    // Fallback legacy para compatibilidad
    console.warn(`[Legacy] Reading reservation config from legacy location for bar ${barId}. Consider migrating.`)
    const barRef = doc(db, "bars", barId)
    const barSnap = await getDoc(barRef)

    if (barSnap.exists()) {
      const barData = barSnap.data()
      return barData?.reservationSite || barData?.publicSite || DEFAULT_RESERVATION_CONFIG
    }

    return DEFAULT_RESERVATION_CONFIG
  } catch (error) {
    console.error(`Error reading reservation config for bar ${barId}:`, error)
    return DEFAULT_RESERVATION_CONFIG
  }
}

/**
 * Migra un bar específico a la nueva estructura (wrapper para API)
 */
export async function migrateBarToNewStructure(barId: string, force = false): Promise<MigrationResult> {
  try {
    console.log(`[API Migration] Starting migration for bar: ${barId}, force: ${force}`)

    if (!force) {
      // Verificar si ya está migrado
      const status = await checkBarMigrationStatus(db, barId)
      if (!status.needsMigration) {
        return {
          success: true,
          migrated: false,
          version: status.currentVersion,
          error: "Bar already migrated to latest version",
        }
      }
    }

    const result = await migrateBarIfNeeded(db, barId)
    return result
  } catch (error) {
    console.error(`[API Migration] Error migrating bar ${barId}:`, error)
    return {
      success: false,
      migrated: false,
      version: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Verifica el estado de migración de un bar (wrapper para API)
 */
export async function checkMigrationStatus(barId: string) {
  try {
    const barRef = doc(db, "bars", barId)
    const barSnap = await getDoc(barRef)

    if (!barSnap.exists()) {
      return {
        needsMigration: false,
        hasLegacyData: false,
        hasNewStructure: false,
        version: 0,
      }
    }

    const data = barSnap.data()
    const currentVersion = data?.meta?.schemaVersion ?? 0

    // Verificar si tiene datos legacy
    const hasLegacyData = !!(data?.theme || data?.themeConfig || data?.reservationSite || data?.publicSite)

    // Verificar si tiene nueva estructura
    const themeRef = doc(db, "bars", barId, "themeConfig", "default")
    const reservationRef = doc(db, "bars", barId, "reservationSite", "config")

    const [themeSnap, reservationSnap] = await Promise.all([getDoc(themeRef), getDoc(reservationRef)])

    const hasNewStructure = themeSnap.exists() && reservationSnap.exists()

    return {
      needsMigration: currentVersion < CURRENT_SCHEMA_VERSION,
      hasLegacyData,
      hasNewStructure,
      version: currentVersion,
    }
  } catch (error) {
    console.error(`Error checking migration status for bar ${barId}:`, error)
    return {
      needsMigration: false,
      hasLegacyData: false,
      hasNewStructure: false,
      version: 0,
    }
  }
}

/**
 * Migra todos los bares a la nueva estructura
 */
export async function migrateAllBarsToNewStructure(force = false, batchSize = 10) {
  try {
    console.log(`[Mass Migration] Starting mass migration, force: ${force}, batchSize: ${batchSize}`)

    // Obtener todos los bares
    const barsCollection = collection(db, "bars")
    const barsSnapshot = await getDocs(barsCollection)

    const allBars = barsSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }))

    console.log(`[Mass Migration] Found ${allBars.length} bars to process`)

    const results = {
      total: allBars.length,
      migrated: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[],
    }

    // Procesar en lotes
    for (let i = 0; i < allBars.length; i += batchSize) {
      const batch = allBars.slice(i, i + batchSize)
      console.log(
        `[Mass Migration] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allBars.length / batchSize)}`,
      )

      const batchPromises = batch.map(async (bar) => {
        try {
          const result = await migrateBarToNewStructure(bar.id, force)

          if (result.success) {
            if (result.migrated) {
              results.migrated++
            } else {
              results.skipped++
            }
          } else {
            results.errors++
          }

          results.details.push({
            barId: bar.id,
            ...result,
          })

          return result
        } catch (error) {
          results.errors++
          const errorResult = {
            barId: bar.id,
            success: false,
            migrated: false,
            version: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          }
          results.details.push(errorResult)
          return errorResult
        }
      })

      await Promise.all(batchPromises)

      // Pequeña pausa entre lotes para no sobrecargar Firestore
      if (i + batchSize < allBars.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(
      `[Mass Migration] Completed: ${results.migrated} migrated, ${results.skipped} skipped, ${results.errors} errors`,
    )

    return {
      success: results.errors === 0,
      ...results,
    }
  } catch (error) {
    console.error("[Mass Migration] Critical error:", error)
    return {
      success: false,
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: 1,
      error: error instanceof Error ? error.message : "Unknown error",
      details: [],
    }
  }
}
