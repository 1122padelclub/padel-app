"use client"

import { useState, useEffect } from "react"
import { ref, onValue, off } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import type { Order } from "@/src/types"

export function useOrders(barId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const ordersRef = ref(realtimeDb, `orders/${barId}`)

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        try {
          const ordersData: Order[] = []
          
          if (snapshot.exists()) {
            const data = snapshot.val()
            Object.entries(data).forEach(([id, orderData]: [string, any]) => {
              ordersData.push({
                id,
                ...orderData,
                createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
                updatedAt: orderData.updatedAt ? new Date(orderData.updatedAt) : null
              })
            })
            
            // Ordenar por fecha de creación (más reciente primero)
            ordersData.sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime()
              const dateB = new Date(b.createdAt).getTime()
              return dateB - dateA
            })
          }

          setOrders(ordersData)
          setError(null)
          setLoading(false)
        } catch (err: any) {
          console.error("Error processing orders:", err)
          setError(err.message)
          setLoading(false)
        }
      },
      (err) => {
        console.error("Error loading orders:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => {
      off(ordersRef)
    }
  }, [barId])

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Esta función se implementaría si necesitas actualizar el estado de pedidos desde el admin
      console.log("Update order status functionality would be implemented here")
    } catch (err: any) {
      console.error("Error updating order status:", err)
      throw err
    }
  }

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status)
  }

  const getOrdersByDateRange = (startDate: Date, endDate: Date) => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  // Contar pedidos activos (excluyendo delivered y cancelled)
  const pendingOrdersCount = orders.filter(order => 
    !['delivered', 'cancelled'].includes(order.status)
  ).length

  // Debug: Log para ver los estados de los pedidos
  console.log("useOrders - Orders and their statuses:", orders.map(order => ({ id: order.id, status: order.status })))
  console.log("useOrders - Pending orders count:", pendingOrdersCount)

  return {
    orders,
    pendingOrdersCount,
    loading,
    error,
    updateOrderStatus,
    getOrdersByStatus,
    getOrdersByDateRange
  }
}