"use client"
import { useState, useEffect, useCallback } from "react"
import { collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import { normalizeTableList, type NormalizedTable } from "@/src/utils/tableNormalizer"

export function useAdminTables(barId: string) {
  const [tables, setTables] = useState<NormalizedTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTables = useCallback(async () => {
    if (!barId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Cargando mesas del admin para bar:", barId)

      const tablesRef = collection(db, "tables")
      const q = query(tablesRef, where("barId", "==", barId))
      const querySnapshot = await getDocs(q)

      const tablesData: any[] = []
      querySnapshot.forEach((doc) => {
        tablesData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })
      })

      // Normalizar los datos de las mesas
      const normalizedTables = normalizeTableList(tablesData, barId)
      console.log("Mesas normalizadas del admin:", normalizedTables)

      setTables(normalizedTables)
    } catch (error) {
      console.error("Error cargando mesas del admin:", error)
      setError("Error cargando mesas")
      setTables([])
    } finally {
      setLoading(false)
    }
  }, [barId])

  // Cargar mesas al montar el componente
  useEffect(() => {
    loadTables()
  }, [loadTables])

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!barId) return

    const tablesRef = collection(db, "tables")
    const q = query(tablesRef, where("barId", "==", barId))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tablesData: any[] = []
      querySnapshot.forEach((doc) => {
        tablesData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })
      })

      const normalizedTables = normalizeTableList(tablesData, barId)
      console.log("Mesas actualizadas en tiempo real:", normalizedTables)
      setTables(normalizedTables)
    }, (error) => {
      console.error("Error en suscripción de mesas:", error)
      setError("Error en suscripción de mesas")
    })

    return () => unsubscribe()
  }, [barId])

  // Crear mesa
  const createTable = useCallback(async (number: number, password?: string, capacity: number = 4) => {
    try {
      console.log("Creando mesa:", { number, password, capacity, barId })
      
      const tablesRef = collection(db, "tables")
      const newTable = {
        barId,
        number,
        password: password || null,
        isActive: true,
        isOccupied: false,
        capacity: capacity || 4,
        status: 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(tablesRef, newTable)
      console.log("Mesa creada con ID:", docRef.id)
      
      // Recargar mesas
      await loadTables()
      
      return true
    } catch (error) {
      console.error("Error creando mesa:", error)
      return false
    }
  }, [barId, loadTables])

  // Actualizar mesa
  const updateTable = useCallback(async (tableId: string, updates: any) => {
    try {
      console.log("Actualizando mesa:", tableId, updates)
      
      const tableRef = doc(db, "tables", tableId)
      await updateDoc(tableRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      
      console.log("Mesa actualizada exitosamente")
      
      // Recargar mesas
      await loadTables()
      
      return true
    } catch (error) {
      console.error("Error actualizando mesa:", error)
      return false
    }
  }, [loadTables])

  // Eliminar mesa
  const deleteTable = useCallback(async (tableId: string) => {
    try {
      console.log("Eliminando mesa:", tableId)
      
      const tableRef = doc(db, "tables", tableId)
      await deleteDoc(tableRef)
      
      console.log("Mesa eliminada")
      
      // Recargar mesas
      await loadTables()
      
      return true
    } catch (error) {
      console.error("Error eliminando mesa:", error)
      return false
    }
  }, [loadTables])

  return {
    tables,
    loading,
    error,
    refetch: loadTables,
    createTable,
    updateTable,
    deleteTable
  }
}