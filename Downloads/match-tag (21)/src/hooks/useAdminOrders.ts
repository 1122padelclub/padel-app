"use client"

import { useEffect, useState, useRef } from "react"
import { ref, onValue, update, realtimeDb } from "@/src/services/firebaseExtras"
import type { Order } from "@/src/types"

export function useAdminOrders(barId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const previousOrdersCount = useRef(0)

  useEffect(() => {
    if (!barId) return

    console.log("[v0] useAdminOrders iniciando para barId:", barId)
    setLoading(true)

    const ordersRef = ref(realtimeDb, `orders/${barId}`)
    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        const ordersData = snapshot.val()
        console.log("[v0] Datos de pedidos recibidos desde Realtime DB:", ordersData)

        if (ordersData) {
          const ordersList: Order[] = Object.entries(ordersData).map(([id, data]: [string, any]) => ({
            id,
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
          }))

          // Ordenar por fecha de creación (más recientes primero)
          ordersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

          const currentOrdersCount = ordersList.length
          if (previousOrdersCount.current > 0 && currentOrdersCount > previousOrdersCount.current) {
            // Nuevo pedido detectado
            try {
              const audio = new Audio("/notification-sound.mp3")
              audio.volume = 0.5
              audio.play().catch((e) => console.log("[v0] No se pudo reproducir sonido:", e))
            } catch (error) {
              console.log("[v0] Error reproduciendo sonido:", error)
            }

            // Mostrar notificación del navegador si está permitido
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Nuevo Pedido", {
                body: "Se ha recibido un nuevo pedido",
                icon: "/icon-192.png",
              })
            }
          }
          previousOrdersCount.current = currentOrdersCount

          setOrders(ordersList)
          console.log("[v0] Pedidos procesados:", ordersList.length)
        } else {
          setOrders([])
          previousOrdersCount.current = 0
          console.log("[v0] No hay pedidos en la base de datos")
        }
        setLoading(false)
      },
      (error) => {
        console.error("[v0] Error al obtener pedidos:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [barId])

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      console.log("[v0] Actualizando estado del pedido:", orderId, "a", status)

      // Obtener el pedido actual antes de actualizar
      const orderToUpdate = orders.find(o => o.id === orderId)
      const previousStatus = orderToUpdate?.status

      const orderRef = ref(realtimeDb, `orders/${barId}/${orderId}`)
      await update(orderRef, {
        status,
        updatedAt: new Date().toISOString(),
      })

      console.log("[v0] Estado del pedido actualizado exitosamente")

      // Procesamiento automático de inventario
      if (orderToUpdate && status !== previousStatus) {
        // Descuento de inventario al confirmar o entregar
        if ((status === 'confirmed' || status === 'delivered') && 
            (previousStatus === 'pending' || previousStatus === 'confirmed')) {
          try {
            console.log("[INVENTORY] Procesando descuento de inventario para pedido:", orderId)
            console.log("[INVENTORY] Order items:", orderToUpdate.items)
            
            const response = await fetch('/api/inventory/process-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                barId,
                orderItems: orderToUpdate.items,
                action: 'deduct'
              })
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            console.log("[INVENTORY] Response:", result)
            
            if (result.success) {
              console.log("[INVENTORY] ✅ Inventario descontado:", result.processed)
            } else {
              console.warn("[INVENTORY] ⚠️ No se pudo procesar inventario:", result.error)
            }
          } catch (inventoryError) {
            console.error("[INVENTORY] Error procesando inventario:", inventoryError)
            // No lanzar error para no interrumpir la actualización del pedido
          }
        }

        // Reversión de inventario al cancelar
        if (status === 'cancelled' && 
            (previousStatus === 'confirmed' || previousStatus === 'preparing' || previousStatus === 'ready')) {
          try {
            console.log("[INVENTORY] Procesando reversión de inventario para pedido cancelado:", orderId)
            
            const response = await fetch('/api/inventory/process-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                barId,
                orderItems: orderToUpdate.items,
                action: 'reverse'
              })
            })

            const result = await response.json()
            if (result.success) {
              console.log("[INVENTORY] ✅ Inventario revertido:", result.processed)
            } else {
              console.warn("[INVENTORY] ⚠️ No se pudo revertir inventario:", result.error)
            }
          } catch (inventoryError) {
            console.error("[INVENTORY] Error revirtiendo inventario:", inventoryError)
            // No lanzar error para no interrumpir la actualización del pedido
          }
        }
      }

      return true
    } catch (error) {
      console.error("[v0] Error updating order status:", error)
      return false
    }
  }

  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status)
  }

  return {
    orders,
    loading,
    updateOrderStatus,
    getOrdersByStatus,
  }
}
