"use client"

import { useState, useEffect } from "react"
import { ref, onValue, off, realtimeDb } from "@/src/services/firebaseExtras"

export interface OrderNotification {
  id: string
  barId: string
  tableId: string
  tableNumber: number
  customerName: string
  total: number
  itemsCount: number
  status: string
  createdAt: string
  isNew: boolean
}

export function useOrderNotifications(barId: string) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    console.log("🔔 Iniciando notificaciones de pedidos para barId:", barId)
    setLoading(true)

    const ordersRef = ref(realtimeDb, `orders/${barId}`)

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        const ordersData: OrderNotification[] = []
        const data = snapshot.val()

        if (data) {
          Object.entries(data).forEach(([orderId, orderData]: [string, any]) => {
            if (orderData && orderData.status === "pending") {
              ordersData.push({
                id: orderId,
                barId: orderData.barId || barId,
                tableId: orderData.tableId || "",
                tableNumber: orderData.tableNumber || 0,
                customerName: orderData.customerName || "Cliente",
                total: orderData.total || 0,
                itemsCount: orderData.items?.length || 0,
                status: orderData.status || "pending",
                createdAt: orderData.createdAt || new Date().toISOString(),
                isNew: true, // Marcar como nuevo para mostrar notificación
              })
            }
          })
        }

        // Ordenar por fecha de creación (más recientes primero)
        ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        console.log("🔔 Pedidos cargados para notificaciones:", ordersData.length)
        setNotifications(ordersData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("❌ Error cargando notificaciones de pedidos:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => {
      console.log("🔔 Desconectando notificaciones de pedidos")
      off(ordersRef, "value")
    }
  }, [barId])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isNew: false }
          : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isNew: false }))
    )
  }

  const getUnreadCount = () => {
    return notifications.filter(notif => notif.isNew).length
  }

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  }
}

