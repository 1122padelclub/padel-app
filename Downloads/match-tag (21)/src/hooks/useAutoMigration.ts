"use client"
import { useEffect, useState } from "react"

interface AutoMigrationState {
  isChecking: boolean
  needsMigration: boolean
  isMigrating: boolean
  migrationComplete: boolean
  error: string | null
  version: number
}

/**
 * Hook para migración automática - DESHABILITADO
 * Usa solo datos locales sin acceso a Firestore
 */
export function useAutoMigration(barId: string | null | undefined) {
  const [state, setState] = useState<AutoMigrationState>({
    isChecking: false,
    needsMigration: false,
    isMigrating: false,
    migrationComplete: true, // Siempre completo
    error: null,
    version: 2, // Asumir versión 2
  })

  useEffect(() => {
    // Migración completamente deshabilitada
    console.log("[AutoMigration] Migration disabled - using local data only")
    setState({
      isChecking: false,
      needsMigration: false,
      isMigrating: false,
      migrationComplete: true,
      error: null,
      version: 2,
    })
  }, [barId])

  return {
    ...state,
    // Siempre listo para usar
    isReady: true,
    // Nunca está cargando
    isLoading: false,
  }
}