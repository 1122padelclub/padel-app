"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import { useAutoMigration } from "./useAutoMigration"
import { readThemeConfig } from "@/lib/barMigrations"
import { useTableCustomization } from "./useTableCustomization"

const DEFAULT = {
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
  typography: {},
  assets: {},
  menuCustomization: { borderRadius: 12 },
  branding: {},
}

export function useThemeConfig(barId?: string) {
  const [theme, setTheme] = useState(DEFAULT)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const themeCache = useRef<Map<string, any>>(new Map())
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const migration = useAutoMigration(barId)
  
  // Usar personalización de mesas si está disponible
  const { customization: tableCustomization, loading: customizationLoading } = useTableCustomization(barId || "")

  const migrateThemeToNewStructure = useCallback(async (barId: string, legacyTheme: any) => {
    try {
      console.log(`[Migration] Migrating theme config for bar: ${barId}`)
      
      const { doc, setDoc } = await import("firebase/firestore")
      const themeRef = doc(db, "bars", barId, "themeConfig", "default")
      
      const migratedTheme = {
        ...DEFAULT,
        ...legacyTheme,
        colors: {
          ...DEFAULT.colors,
          ...(legacyTheme.colors || {}),
          customBackground: legacyTheme.colors?.customBackground || null,
        },
        typography: {
          ...DEFAULT.typography,
          ...(legacyTheme.typography || {}),
        },
        assets: {
          ...DEFAULT.assets,
          ...(legacyTheme.assets || {}),
        },
        menuCustomization: {
          ...DEFAULT.menuCustomization,
          ...(legacyTheme.menuCustomization || {}),
        },
        branding: {
          ...DEFAULT.branding,
          ...(legacyTheme.branding || {}),
        },
        migratedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      await setDoc(themeRef, migratedTheme)
      console.log(`[Migration] Theme config migrated successfully for bar: ${barId}`)
      return migratedTheme
    } catch (error) {
      console.error(`[Migration] Failed to migrate theme config for bar ${barId}:`, error)
      return null
    }
  }, [])

  const loadThemeWithFallback = useCallback(async (barId: string) => {
    if (typeof window === "undefined") {
      setIsLoading(false)
      return
    }

    const cached = themeCache.current.get(barId)
    if (cached) {
      setTheme(cached)
      return
    }

    setIsLoading(true)
    try {
      setError(null)
      console.log(`[v0] Loading theme config for bar: ${barId}`)

      const themeData = await readThemeConfig(db, barId)
      if (themeData) {
        // Verificar si es una configuración legacy (sin campos de migración)
        const isLegacyConfig = !themeData.migratedAt && !themeData.createdAt && 
                              (themeData.colors || themeData.menuCustomization || themeData.branding)
        
        if (isLegacyConfig) {
          console.log(`[Migration] Detected legacy theme config for bar: ${barId}, attempting migration`)
          const migratedTheme = await migrateThemeToNewStructure(barId, themeData)
          if (migratedTheme) {
            // Usar la configuración migrada
            setTheme(migratedTheme)
            themeCache.current.set(barId, migratedTheme)
            console.log(`[v0] Using migrated theme for bar: ${barId}`)
            return
          }
        }

        const newTheme = {
          ...DEFAULT,
          ...themeData,
          colors: {
            ...DEFAULT.colors,
            ...(themeData.colors || {}),
            customBackground: themeData.colors?.customBackground || null,
          },
          typography: {
            ...DEFAULT.typography,
            ...(themeData.typography || {}),
          },
          assets: {
            ...DEFAULT.assets,
            ...(themeData.assets || {}),
          },
          menuCustomization: {
            ...DEFAULT.menuCustomization,
            ...(themeData.menuCustomization || {}),
          },
          branding: {
            ...DEFAULT.branding,
            ...(themeData.branding || {}),
          },
        }
        setTheme(newTheme)
        themeCache.current.set(barId, newTheme)
        console.log(`[v0] Theme loaded successfully for bar: ${barId}`)
      } else {
        console.log(`[v0] No theme data found for bar ${barId}, using default`)
        setTheme(DEFAULT)
        themeCache.current.set(barId, DEFAULT)
      }
    } catch (error) {
      console.warn(`Error reading theme config for bar ${barId}, using default:`, error)
      if (error.message?.includes("Missing or insufficient permissions")) {
        console.log(`[v0] Using default theme due to permissions for bar ${barId}`)
        setError(null) // No mostrar error al usuario para permisos
      } else {
        setError(error.message)
      }
      setTheme(DEFAULT)
      themeCache.current.set(barId, DEFAULT)
    } finally {
      setIsLoading(false)
    }
  }, [migrateThemeToNewStructure])

  useEffect(() => {
    if (typeof window === "undefined" || !barId) {
      setIsLoading(false)
      return
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    // Load theme immediately with fallback
    loadThemeWithFallback(barId)

    const ref = doc(db, "bars", barId, "themeConfig", "default")
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        try {
          const data = snap.data()
          if (data) {
            const newTheme = {
              ...DEFAULT,
              ...data,
              colors: {
                ...DEFAULT.colors,
                ...(data.colors || {}),
                customBackground: data.colors?.customBackground || null,
              },
              typography: {
                ...DEFAULT.typography,
                ...(data.typography || {}),
              },
              assets: {
                ...DEFAULT.assets,
                ...(data.assets || {}),
              },
              menuCustomization: {
                ...DEFAULT.menuCustomization,
                ...(data.menuCustomization || {}),
              },
              branding: {
                ...DEFAULT.branding,
                ...(data.branding || {}),
              },
            }
            setTheme(newTheme)
            themeCache.current.set(barId, newTheme) // Update cache
          }
          setError(null)
        } catch (error) {
          setTheme(DEFAULT)
        }
      },
      (error) => {
        if (!error.message?.includes("Missing or insufficient permissions")) {
          console.warn("Theme snapshot listener error (using default):", error)
        }
        setTheme(DEFAULT)
        setError(null) // No mostrar errores de listener al usuario
      },
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [barId, loadThemeWithFallback])

  // Combinar tema con personalización de mesas
  const combinedTheme = tableCustomization ? {
    ...theme,
    colors: {
      ...theme.colors,
      primary: tableCustomization.primaryColor,
      secondary: tableCustomization.secondaryColor,
      text: tableCustomization.textColor,
      background: tableCustomization.backgroundColor,
    },
    branding: {
      ...theme.branding,
      restaurantName: tableCustomization.restaurantName,
      tagline: tableCustomization.tagline,
      primaryColor: tableCustomization.primaryColor,
      secondaryColor: tableCustomization.secondaryColor,
      textColor: tableCustomization.textColor,
      fontFamily: tableCustomization.fontFamily,
      logoSize: tableCustomization.logoSize,
    },
    assets: {
      ...theme.assets,
      logoUrl: tableCustomization.logoUrl,
      backgroundImageUrl: tableCustomization.backgroundImageUrl,
    },
    menuCustomization: {
      ...theme.menuCustomization,
      borderRadius: tableCustomization.borderRadius,
    },
  } : theme

  return {
    theme: combinedTheme,
    themeConfig: combinedTheme, // Alias para compatibilidad
    updateThemeConfig: null, // Placeholder para compatibilidad
    isLoading: isLoading || customizationLoading,
    error,
    migration, // Exponer estado de migración
    updateTheme: (updates: Partial<typeof theme>) => {
      const newTheme = { ...theme, ...updates }
      setTheme(newTheme)
      if (barId) {
        themeCache.current.set(barId, newTheme)
      }
    },
  }
}
