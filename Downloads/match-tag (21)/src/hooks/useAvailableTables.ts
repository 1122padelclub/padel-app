"use client"

import { useState, useEffect, useMemo } from "react"
import { useTables } from "./useTables"
import { getAvailableTables } from "@/src/utils/reservationUtils"

export function useAvailableTables(
  barId: string,
  selectedDate: Date | null,
  selectedTime: string | null,
  durationMinutes: number = 120
) {
  const { tables, loading: tablesLoading } = useTables(barId)
  const [availableTables, setAvailableTables] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Actualizar mesas disponibles cuando cambien los parámetros
  useEffect(() => {
    let isMounted = true

    const updateAvailableTables = async () => {
      if (!barId || !selectedDate || !selectedTime || tablesLoading) {
        if (isMounted) {
          setAvailableTables([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("🔍 Calculando mesas disponibles:", {
          barId,
          selectedDate: selectedDate.toISOString(),
          selectedTime,
          durationMinutes,
          totalTables: tables.length
        })

        const available = await getAvailableTables(
          barId,
          selectedDate,
          selectedTime,
          durationMinutes,
          tables
        )

        console.log("✅ Mesas disponibles calculadas:", {
          available: available.length,
          total: tables.length
        })

        if (isMounted) {
          setAvailableTables(available)
        }
      } catch (err) {
        console.error("❌ Error calculando mesas disponibles:", err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error desconocido")
          setAvailableTables([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    updateAvailableTables()

    return () => {
      isMounted = false
    }
  }, [barId, selectedDate, selectedTime, durationMinutes, tables, tablesLoading])

  return {
    availableTables,
    loading: loading || tablesLoading,
    error,
    totalTables: tables.length,
    activeTables: tables.filter(t => t.isActive).length
  }
}
