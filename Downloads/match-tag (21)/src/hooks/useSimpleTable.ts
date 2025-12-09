"use client"
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import { TableManager } from "@/src/utils/tableManager"

interface SimpleTable {
  id: string
  barId: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  password?: string
  createdAt: string
  updatedAt: string
}

export function useSimpleTable(barId?: string, tableId?: string) {
  const [table, setTable] = useState<SimpleTable | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !barId || !tableId) {
      setLoading(false)
      return
    }

    setLoading(true)
    console.log("[v0] Loading simple table for barId:", barId, "tableId:", tableId)

    const loadTable = async () => {
      try {
        // Primero intentar cargar desde Firebase
        console.log("[v0] Attempting to load table from Firebase...")
        const tableRef = doc(db, "tables", tableId)
        const tableSnap = await getDoc(tableRef)
        
        if (tableSnap.exists()) {
          const firebaseData = tableSnap.data()
          console.log("[v0] Firebase table data:", firebaseData)
          
          // Verificar que la mesa pertenece al bar correcto
          if (firebaseData.barId === barId) {
            const firebaseTable: SimpleTable = {
              id: tableId,
              barId: barId,
              number: firebaseData.number || parseInt(tableId.slice(-2)) || 1,
              capacity: firebaseData.capacity || 4,
              status: firebaseData.status || 'available',
              password: firebaseData.password, // ← Esto es lo importante
              createdAt: firebaseData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              updatedAt: firebaseData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            }
            
            console.log("[v0] Loaded table from Firebase:", firebaseTable)
            setTable(firebaseTable)
            setLoading(false)
            setError(null)
            return
          }
        }
        
        // Si no se encuentra en Firebase, usar localStorage como fallback
        console.log("[v0] Table not found in Firebase, using localStorage fallback...")
        const tableData = TableManager.getTable(tableId)
        
        if (tableData && tableData.barId === barId) {
          setTable(tableData)
        } else {
          // Inicializar datos por defecto si no existen
          TableManager.initializeDefaults(barId, tableId)
          const defaultTable = TableManager.getTable(tableId)
          
          if (defaultTable) {
            setTable(defaultTable)
          } else {
            // Fallback a datos por defecto
            const defaultTableData: SimpleTable = {
              id: tableId,
              barId: barId,
              number: parseInt(tableId.slice(-2)) || 1,
              capacity: 4,
              status: 'available',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            setTable(defaultTableData)
          }
        }
        
        setLoading(false)
        setError(null)
      } catch (error) {
        console.error("[v0] Error loading table:", error)
        setError("Error loading table data")
        setLoading(false)
      }
    }

    loadTable()
  }, [barId, tableId])

  return { table, loading, error }
}

