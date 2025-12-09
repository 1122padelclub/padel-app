"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useTableCache, CACHE_TTL } from "./useTableCache"
import { useTableConnectionPool } from "./useConnectionPool"
import { retryWithBackoff } from "@/src/utils/rateLimitHandler"

interface TableData {
  id: string
  barId: string
  number: number
  capacity: number
  isActive: boolean
  password?: string
  theme?: any
}

interface BarData {
  id: string
  name: string
  logo?: string
  theme?: any
}

export function useOptimizedTable(barId?: string, tableId?: string) {
  const [table, setTable] = useState<TableData | null>(null)
  const [bar, setBar] = useState<BarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { setCache, getCache, hasCache, invalidateCache } = useTableCache()
  const { executeTableOperation } = useTableConnectionPool()

  useEffect(() => {
    if (!barId || !tableId) {
      setLoading(false)
      return
    }

    loadTableData()
  }, [barId, tableId])

  const loadTableData = async () => {
    if (!barId || !tableId) return

    setLoading(true)
    setError(null)

    try {
      // Intentar cargar desde caché primero
      const cachedTable = getCache<TableData>(`table_${tableId}`)
      const cachedBar = getCache<BarData>(`bar_${barId}`)

      if (cachedTable && cachedBar) {
        console.log("[OptimizedTable] Using cached data")
        setTable(cachedTable)
        setBar(cachedBar)
        setLoading(false)
        return
      }

      // Cargar datos en paralelo usando connection pool
      const [tableData, barData] = await Promise.allSettled([
        loadTableFromFirebase(barId, tableId),
        loadBarFromFirebase(barId)
      ])

      // Procesar resultados
      if (tableData.status === 'fulfilled' && tableData.value) {
        setTable(tableData.value)
        setCache(`table_${tableId}`, tableData.value, CACHE_TTL.TABLE_DATA)
      } else {
        throw new Error("No se pudo cargar la mesa")
      }

      if (barData.status === 'fulfilled' && barData.value) {
        setBar(barData.value)
        setCache(`bar_${barId}`, barData.value, CACHE_TTL.BAR_DATA)
      }

    } catch (error: any) {
      console.error("[OptimizedTable] Error loading data:", error)
      setError(error.message || "Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const loadTableFromFirebase = async (barId: string, tableId: string): Promise<TableData | null> => {
    return executeTableOperation(async () => {
      const tableRef = doc(db, "tables", tableId)
      
      return retryWithBackoff(async () => {
        const tableSnap = await getDoc(tableRef)
        
        if (!tableSnap.exists()) {
          throw new Error("Mesa no encontrada")
        }

        const data = tableSnap.data()
        
        // Verificar que la mesa pertenece al bar correcto
        if (data.barId !== barId) {
          throw new Error("Mesa no pertenece a este bar")
        }

        return {
          id: tableSnap.id,
          barId: data.barId,
          number: data.number,
          capacity: data.capacity,
          isActive: data.isActive ?? true,
          password: data.password,
          theme: data.theme
        } as TableData
      }, 1, 1000) // 1 reintento, 1 segundo de delay
    }, 1) // Prioridad alta para datos de mesa
  }

  const loadBarFromFirebase = async (barId: string): Promise<BarData | null> => {
    return executeTableOperation(async () => {
      const barRef = doc(db, "bars", barId)
      
      return retryWithBackoff(async () => {
        const barSnap = await getDoc(barRef)
        
        if (!barSnap.exists()) {
          throw new Error("Bar no encontrado")
        }

        const data = barSnap.data()
        
        return {
          id: barSnap.id,
          name: data.name,
          logo: data.logo,
          theme: data.theme
        } as BarData
      }, 1, 1000)
    }, 2) // Prioridad media para datos de bar
  }

  const refreshTable = async () => {
    if (!barId || !tableId) return
    
    // Invalidar caché y recargar
    invalidateCache(`table_${tableId}`)
    invalidateCache(`bar_${barId}`)
    await loadTableData()
  }

  const invalidateTableCache = () => {
    if (tableId) invalidateCache(`table_${tableId}`)
    if (barId) invalidateCache(`bar_${barId}`)
  }

  return {
    table,
    bar,
    loading,
    error,
    refreshTable,
    invalidateTableCache
  }
}
