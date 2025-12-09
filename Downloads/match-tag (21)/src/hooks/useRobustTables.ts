"use client"
import { useState, useEffect, useCallback } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import { normalizeTableData, type NormalizedTable } from "@/src/utils/tableNormalizer"

export function useRobustTables(barId: string) {
  const [tables, setTables] = useState<NormalizedTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  const loadTables = useCallback(async () => {
    if (!barId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Cargando mesas robustas para bar:", barId)

      // Intentar cargar desde Firestore
      let firestoreTables: any[] = []
      try {
        const tablesRef = collection(db, "tables")
        const q = query(tablesRef, where("barId", "==", barId))
        const querySnapshot = await getDocs(q)

        firestoreTables = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          firestoreTables.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          })
        })
        console.log("📊 Mesas de Firestore:", firestoreTables)
      } catch (firestoreError) {
        console.warn("⚠️ Error cargando de Firestore:", firestoreError)
      }

      // Crear mesas de prueba si no hay del admin
      let testTables: any[] = []
      if (firestoreTables.length === 0) {
        testTables = [
          { 
            id: `${barId}-test-1`, 
            number: 2, 
            barId: barId, 
            isActive: true,
            capacity: 4,
            status: 'available'
          },
          { 
            id: `${barId}-test-2`, 
            number: 3, 
            barId: barId, 
            isActive: true,
            capacity: 4,
            status: 'available'
          }
        ]
        console.log("🧪 Creando mesas de prueba:", testTables)
      }

      // Combinar mesas (admin + prueba)
      const allTables = [...firestoreTables, ...testTables]
      console.log("📋 Todas las mesas:", allTables)

      // Normalizar todas las mesas
      const normalizedTables = allTables.map(table => {
        const normalized = normalizeTableData(table, barId)
        console.log("🔄 Normalizando:", table, "→", normalized)
        return normalized
      })

      console.log("✅ Mesas normalizadas finales:", normalizedTables)

      setTables(normalizedTables)
      
      // Guardar información de debug
      setDebugInfo({
        barId,
        firestoreTables,
        testTables,
        allTables,
        normalizedTables,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error("❌ Error cargando mesas robustas:", error)
      setError("Error cargando mesas")
      
      // Fallback: crear al menos una mesa de prueba
      const fallbackTable = normalizeTableData({
        id: `${barId}-fallback`,
        number: 2,
        barId: barId,
        isActive: true
      }, barId)
      
      setTables([fallbackTable])
    } finally {
      setLoading(false)
    }
  }, [barId])

  useEffect(() => {
    loadTables()
  }, [loadTables])

  return {
    tables,
    loading,
    error,
    debugInfo,
    refetch: loadTables
  }
}











