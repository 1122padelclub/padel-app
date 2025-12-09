"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  writeBatch
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { InventoryItem, InventoryMovement, InventoryAlert } from "@/src/types/inventory"

export function useInventory(barId: string) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar items de inventario
  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    const itemsRef = collection(db, "inventoryItems")
    const itemsQuery = query(itemsRef, where("barId", "==", barId))

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          expiryDate: doc.data().expiryDate?.toDate?.() || null,
          lastRestockDate: doc.data().lastRestockDate?.toDate?.() || null,
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        })) as InventoryItem[]

        // Ordenar por nombre
        itemsData.sort((a, b) => a.name.localeCompare(b.name))
        
        setItems(itemsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error loading inventory items:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  // Cargar movimientos
  useEffect(() => {
    if (!barId) return

    const movementsRef = collection(db, "inventoryMovements")
    const movementsQuery = query(movementsRef, where("barId", "==", barId))

    const unsubscribe = onSnapshot(
      movementsQuery,
      (snapshot) => {
        const movementsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          expiryDate: doc.data().expiryDate?.toDate?.() || null,
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        })) as InventoryMovement[]

        // Ordenar por fecha (más recientes primero)
        movementsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        
        setMovements(movementsData)
      },
      (err) => {
        console.error("Error loading inventory movements:", err)
      }
    )

    return () => unsubscribe()
  }, [barId])

  // Generar alertas automáticamente
  useEffect(() => {
    if (!items.length) {
      setAlerts([])
      return
    }

    const newAlerts: InventoryAlert[] = []
    const now = new Date()

    items.forEach(item => {
      // Alerta de stock bajo
      if (item.currentStockBase <= 0) {
        newAlerts.push({
          id: `${item.id}-out`,
          barId: item.barId,
          itemId: item.id,
          itemSku: item.sku,
          itemName: item.name,
          alertType: 'out_of_stock',
          severity: 'critical',
          currentStock: item.currentStockBase,
          message: `${item.name} está agotado`,
          isResolved: false,
          createdAt: now
        })
      } else if (item.currentStockBase <= item.minStockBase) {
        newAlerts.push({
          id: `${item.id}-low`,
          barId: item.barId,
          itemId: item.id,
          itemSku: item.sku,
          itemName: item.name,
          alertType: 'low_stock',
          severity: item.currentStockBase <= item.minStockBase * 0.5 ? 'high' : 'medium',
          currentStock: item.currentStockBase,
          minStock: item.minStockBase,
          message: `${item.name} tiene stock bajo (${item.currentStockBase.toFixed(2)} ${item.baseUnit})`,
          isResolved: false,
          createdAt: now
        })
      }

      // Alerta de vencimiento
      if (item.expiryDate) {
        const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiry < 0) {
          newAlerts.push({
            id: `${item.id}-expired`,
            barId: item.barId,
            itemId: item.id,
            itemSku: item.sku,
            itemName: item.name,
            alertType: 'expired',
            severity: 'critical',
            currentStock: item.currentStockBase,
            expiryDate: item.expiryDate,
            message: `${item.name} está vencido`,
            isResolved: false,
            createdAt: now
          })
        } else if (daysUntilExpiry <= 7) {
          newAlerts.push({
            id: `${item.id}-expiring`,
            barId: item.barId,
            itemId: item.id,
            itemSku: item.sku,
            itemName: item.name,
            alertType: 'near_expiry',
            severity: daysUntilExpiry <= 3 ? 'high' : 'medium',
            currentStock: item.currentStockBase,
            expiryDate: item.expiryDate,
            message: `${item.name} vence en ${daysUntilExpiry} día${daysUntilExpiry !== 1 ? 's' : ''}`,
            isResolved: false,
            createdAt: now
          })
        }
      }
    })

    setAlerts(newAlerts)
  }, [items])

  // Crear item de inventario
  const createItem = useCallback(async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const itemsRef = collection(db, "inventoryItems")
      const docRef = await addDoc(itemsRef, {
        ...itemData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log("Item de inventario creado:", docRef.id)
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error("Error creating inventory item:", err)
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" }
    }
  }, [])

  // Actualizar item de inventario
  const updateItem = useCallback(async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const itemRef = doc(db, "inventoryItems", itemId)
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      console.log("Item de inventario actualizado:", itemId)
      return { success: true }
    } catch (err) {
      console.error("Error updating inventory item:", err)
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" }
    }
  }, [])

  // Eliminar item de inventario
  const deleteItem = useCallback(async (itemId: string) => {
    try {
      const itemRef = doc(db, "inventoryItems", itemId)
      await deleteDoc(itemRef)

      console.log("Item de inventario eliminado:", itemId)
      return { success: true }
    } catch (err) {
      console.error("Error deleting inventory item:", err)
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" }
    }
  }, [])

  // Registrar movimiento de inventario
  const recordMovement = useCallback(async (
    itemId: string,
    type: MovementType,
    quantityBase: number,
    options?: {
      costPerUnit?: number
      reason?: string
      reference?: string
      lotCode?: string
      expiryDate?: Date
      performedBy?: string
      performedByName?: string
      notes?: string
    }
  ) => {
    try {
      const item = items.find(i => i.id === itemId)
      if (!item) throw new Error("Item no encontrado")

      const newBalance = item.currentStockBase + quantityBase
      const totalCost = options?.costPerUnit ? Math.abs(quantityBase) * options.costPerUnit : undefined

      // Crear el movimiento
      const movementsRef = collection(db, "inventoryMovements")
      await addDoc(movementsRef, {
        barId,
        itemId,
        itemSku: item.sku,
        itemName: item.name,
        type,
        quantityBase,
        costPerUnit: options?.costPerUnit,
        totalCost,
        reason: options?.reason,
        reference: options?.reference,
        lotCode: options?.lotCode,
        expiryDate: options?.expiryDate,
        performedBy: options?.performedBy,
        performedByName: options?.performedByName,
        notes: options?.notes,
        balanceAfter: newBalance,
        createdAt: serverTimestamp()
      })

      // Actualizar el stock del item
      const itemRef = doc(db, "inventoryItems", itemId)
      await updateDoc(itemRef, {
        currentStockBase: newBalance,
        ...(options?.lotCode && { lotCode: options.lotCode }),
        ...(options?.expiryDate && { expiryDate: options.expiryDate }),
        ...(type === 'purchase' && { lastRestockDate: serverTimestamp() }),
        updatedAt: serverTimestamp()
      })

      console.log("Movimiento registrado exitosamente")
      return { success: true, newBalance }
    } catch (err) {
      console.error("Error recording movement:", err)
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" }
    }
  }, [barId, items])

  // Ajustar stock (compra, ajuste manual, merma)
  const adjustStock = useCallback(async (adjustments: StockAdjustment[], performedBy?: string, performedByName?: string) => {
    try {
      const batch = writeBatch(db)

      for (const adjustment of adjustments) {
        const item = items.find(i => i.id === adjustment.itemId)
        if (!item) continue

        const difference = adjustment.newStock - adjustment.currentStock

        // Crear movimiento
        const movementRef = doc(collection(db, "inventoryMovements"))
        batch.set(movementRef, {
          barId,
          itemId: adjustment.itemId,
          itemSku: adjustment.itemSku,
          itemName: adjustment.itemName,
          type: 'adjustment' as MovementType,
          quantityBase: difference,
          reason: adjustment.reason,
          notes: adjustment.notes,
          performedBy,
          performedByName,
          balanceAfter: adjustment.newStock,
          createdAt: serverTimestamp()
        })

        // Actualizar stock
        const itemRef = doc(db, "inventoryItems", adjustment.itemId)
        batch.update(itemRef, {
          currentStockBase: adjustment.newStock,
          updatedAt: serverTimestamp()
        })
      }

      await batch.commit()
      console.log("Stock ajustado exitosamente")
      return { success: true }
    } catch (err) {
      console.error("Error adjusting stock:", err)
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" }
    }
  }, [barId, items])

  // Obtener items por categoría
  const getItemsByCategory = useCallback((category: InventoryCategory) => {
    return items.filter(item => item.category === category)
  }, [items])

  // Obtener items con stock bajo
  const getLowStockItems = useCallback(() => {
    return items.filter(item => item.currentStockBase <= item.minStockBase && item.isActive)
  }, [items])

  // Obtener items próximos a vencer
  const getExpiringItems = useCallback((days: number = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return items.filter(item => {
      if (!item.expiryDate) return false
      return item.expiryDate <= futureDate && item.expiryDate >= now
    })
  }, [items])

  // Buscar items
  const searchItems = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.supplier?.toLowerCase().includes(term)
    )
  }, [items])

  return {
    items,
    movements,
    alerts,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    recordMovement,
    adjustStock,
    getItemsByCategory,
    getLowStockItems,
    getExpiringItems,
    searchItems
  }
}

