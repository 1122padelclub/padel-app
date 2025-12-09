import { getAdminDb } from "@/lib/firebaseAdmin"

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
 * Verifica si un bar necesita migración usando Admin SDK
 */
export async function checkMigrationStatus(barId: string) {
  try {
    const adminDb = getAdminDb()
    const barRef = adminDb.collection("bars").doc(barId)
    const barDoc = await barRef.get()

    if (!barDoc.exists) {
      return {
        needsMigration: false,
        hasLegacyData: false,
        hasNewStructure: false,
        version: 0,
      }
    }

    const data = barDoc.data()
    const currentVersion = data?.meta?.schemaVersion ?? 0

    // Verificar si tiene datos legacy
    const hasLegacyData = !!(data?.theme || data?.themeConfig || data?.reservationSite || data?.publicSite)

    // Verificar si tiene nueva estructura
    const themeRef = barRef.collection("themeConfig").doc("default")
    const reservationRef = barRef.collection("reservationSite").doc("config")

    const [themeDoc, reservationDoc] = await Promise.all([themeRef.get(), reservationRef.get()])

    const hasNewStructure = themeDoc.exists && reservationDoc.exists

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
 * Migra un bar específico usando Firebase Admin SDK (para API routes)
 */
export async function migrateBarWithAdminSDK(barId: string, force = false): Promise<MigrationResult> {
  try {
    console.log(`[Admin Migration] Starting migration for bar: ${barId}, force: ${force}`)

    const adminDb = getAdminDb()
    const barRef = adminDb.collection("bars").doc(barId)
    const barDoc = await barRef.get()

    if (!barDoc.exists) {
      return { success: false, migrated: false, version: 0, error: "Bar not found" }
    }

    const data = barDoc.data()
    const currentVersion = data?.meta?.schemaVersion ?? 0

    if (!force && currentVersion >= CURRENT_SCHEMA_VERSION) {
      return { success: true, migrated: false, version: currentVersion }
    }

    console.log(`[Admin Migration] Migrating bar ${barId} from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`)

    const batch = adminDb.batch()

    // Migración v0 -> v1: Asegurar themeConfig/default existe
    if (currentVersion < 1) {
      const themeRef = barRef.collection("themeConfig").doc("default")
      const themeDoc = await themeRef.get()

      if (!themeDoc.exists) {
        const legacyTheme = data?.theme || data?.themeConfig
        const themeConfig = {
          ...DEFAULT_THEME_CONFIG,
          ...(legacyTheme || {}),
          updatedAt: new Date(),
        }

        batch.set(themeRef, themeConfig)
        console.log(`[Admin Migration] Creating themeConfig/default for bar ${barId}`)
      }
    }

    // Migración v1 -> v2: Asegurar reservationSite/config existe
    if (currentVersion < 2) {
      const reservationRef = barRef.collection("reservationSite").doc("config")
      const reservationDoc = await reservationRef.get()

      if (!reservationDoc.exists) {
        const legacyReservation = data?.reservationSite || data?.publicSite
        const reservationConfig = {
          ...DEFAULT_RESERVATION_CONFIG,
          ...(legacyReservation || {}),
          updatedAt: new Date(),
        }

        batch.set(reservationRef, reservationConfig)
        console.log(`[Admin Migration] Creating reservationSite/config for bar ${barId}`)
      }
    }

    // Actualizar versión del esquema
    batch.update(barRef, {
      "meta.schemaVersion": CURRENT_SCHEMA_VERSION,
      "meta.updatedAt": new Date(),
      "meta.migratedAt": new Date(),
    })

    await batch.commit()

    console.log(`[Admin Migration] Successfully migrated bar ${barId} to version ${CURRENT_SCHEMA_VERSION}`)

    return {
      success: true,
      migrated: true,
      version: CURRENT_SCHEMA_VERSION,
    }
  } catch (error) {
    console.error(`[Admin Migration] Error migrating bar ${barId}:`, error)
    return {
      success: false,
      migrated: false,
      version: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
