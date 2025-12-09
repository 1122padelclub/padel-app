"use client"

import { useState, useEffect, useMemo } from "react"
import { useAdminOrders } from "./useAdminOrders"
import { useCRM } from "./useCRM"
import type { AdvancedAnalytics, PeriodMetrics, RealtimeMetrics } from "@/src/types/analytics"
import type { Order } from "@/src/types"

export function useAdvancedAnalytics(barId: string, timeFilter: "day" | "week" | "month" = "day") {
  const { orders } = useAdminOrders(barId)
  const { customers, reviews, error: crmError } = useCRM(barId)
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Manejo de errores del CRM
  useEffect(() => {
    if (crmError) {
      setError(crmError)
    }
  }, [crmError])

  const analytics = useMemo((): AdvancedAnalytics | null => {
    if (!orders.length) {
      setError("No hay pedidos disponibles para generar analytics")
      return null
    }

    const now = new Date()
    let currentPeriodStart: Date
    let previousPeriodStart: Date
    let previousPeriodEnd: Date

    // Definir períodos
    switch (timeFilter) {
      case "day":
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        previousPeriodStart = new Date(currentPeriodStart.getTime() - 24 * 60 * 60 * 1000)
        previousPeriodEnd = currentPeriodStart
        break
      case "week":
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousPeriodStart = new Date(currentPeriodStart.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousPeriodEnd = currentPeriodStart
        break
      case "month":
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousPeriodEnd = currentPeriodStart
        break
    }

    const currentOrders = orders.filter(
      (order) => new Date(order.createdAt) >= currentPeriodStart && order.status !== "cancelled",
    )

    const previousOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= previousPeriodStart && orderDate < previousPeriodEnd && order.status !== "cancelled"
    })

    // Análisis de horas pico
    const hourlyData = new Map<number, { orders: number; revenue: number }>()
    for (let i = 0; i < 24; i++) {
      hourlyData.set(i, { orders: 0, revenue: 0 })
    }

    currentOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours()
      const current = hourlyData.get(hour)!
      hourlyData.set(hour, {
        orders: current.orders + 1,
        revenue: current.revenue + (order.total || 0),
      })
    })

    const peakHours = Array.from(hourlyData.entries())
      .map(([hour, data]) => ({ hour, orderCount: data.orders, revenue: data.revenue }))
      .sort((a, b) => b.orderCount - a.orderCount)

    // Análisis de productos con tendencias
    const productMap = new Map<
      string,
      {
        revenue: number
        quantity: number
        orders: number
        currentPeriodSales: number
        previousPeriodSales: number
      }
    >()

    currentOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = productMap.get(item.name) || {
          revenue: 0,
          quantity: 0,
          orders: 0,
          currentPeriodSales: 0,
          previousPeriodSales: 0,
        }
        const price = item.promotionPrice || item.price || 0
        productMap.set(item.name, {
          ...current,
          revenue: current.revenue + price * (item.quantity || 0),
          quantity: current.quantity + (item.quantity || 0),
          orders: current.orders + 1,
          currentPeriodSales: current.currentPeriodSales + (item.quantity || 0),
        })
      })
    })

    // Agregar datos del período anterior
    previousOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = productMap.get(item.name)
        if (current) {
          current.previousPeriodSales += item.quantity || 0
        }
      })
    })

    const productPerformance = Array.from(productMap.entries())
      .map(([name, data]) => {
        const trendPercentage =
          data.previousPeriodSales > 0
            ? ((data.currentPeriodSales - data.previousPeriodSales) / data.previousPeriodSales) * 100
            : data.currentPeriodSales > 0
              ? 100
              : 0

        // Análisis de productos complementarios (simplificado)
        const complementaryItems = findComplementaryItems(name, currentOrders)

        return {
          name,
          revenue: data.revenue,
          quantity: data.quantity,
          profitMargin: 0.3, // Placeholder - en producción vendría de la configuración del producto
          trendPercentage,
          complementaryItems,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)

    // Métricas de clientes
    const currentCustomers = customers?.filter((customer) => new Date(customer.lastVisitAt) >= currentPeriodStart) || []

    const newCustomers =
      customers?.filter((customer) => new Date(customer.firstVisitAt) >= currentPeriodStart).length || 0

    const returningCustomers = currentCustomers.filter((customer) => customer.visitsCount > 1).length

    const customerLifetimeValue =
      customers && customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0

    // Métricas operacionales (simuladas - en producción vendrían de datos reales)
    const operationalMetrics = {
      averagePreparationTime: calculateAveragePreparationTime(currentOrders),
      orderFulfillmentRate: calculateFulfillmentRate(currentOrders),
      tableUtilization: 0.75, // Placeholder
      staffEfficiency: 0.85, // Placeholder
    }

    // Comparativa de períodos
    const currentPeriodMetrics: PeriodMetrics = {
      revenue: currentOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      orders: currentOrders.length,
      averageOrderValue:
        currentOrders.length > 0
          ? currentOrders.reduce((sum, order) => sum + (order.total || 0), 0) / currentOrders.length
          : 0,
      customerCount: currentCustomers.length,
      topProducts: productPerformance.slice(0, 5).map((p) => p.name),
    }

    const previousPeriodMetrics: PeriodMetrics = {
      revenue: previousOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      orders: previousOrders.length,
      averageOrderValue:
        previousOrders.length > 0
          ? previousOrders.reduce((sum, order) => sum + (order.total || 0), 0) / previousOrders.length
          : 0,
      customerCount:
        customers?.filter((customer) => {
          const lastVisit = new Date(customer.lastVisitAt)
          return lastVisit >= previousPeriodStart && lastVisit < previousPeriodEnd
        }).length || 0,
      topProducts: [], // Simplificado
    }

    const growthPercentage =
      previousPeriodMetrics.revenue > 0
        ? ((currentPeriodMetrics.revenue - previousPeriodMetrics.revenue) / previousPeriodMetrics.revenue) * 100
        : currentPeriodMetrics.revenue > 0
          ? 100
          : 0

    // Predicciones simples basadas en tendencias
    const forecasting = {
      predictedRevenue: currentPeriodMetrics.revenue * 1.1, // Placeholder
      predictedOrders: Math.ceil(currentPeriodMetrics.orders * 1.05),
      recommendedStaffing: Math.ceil(peakHours[0]?.orderCount / 10) || 2,
      inventoryAlerts: productPerformance
        .filter((p) => p.trendPercentage > 50)
        .slice(0, 3)
        .map((p) => `Stock bajo previsto para ${p.name}`),
    }

    return {
      peakHours,
      productPerformance,
      customerMetrics: {
        newCustomers,
        returningCustomers,
        customerLifetimeValue,
        churnRate: 0.15, // Placeholder
        retentionRate: 0.85, // Placeholder
      },
      operationalMetrics,
      periodComparison: {
        currentPeriod: currentPeriodMetrics,
        previousPeriod: previousPeriodMetrics,
        growthPercentage,
      },
      forecasting,
    }
  }, [orders, customers, timeFilter])

  // Métricas en tiempo real
  useEffect(() => {
    const updateRealtimeMetrics = () => {
      const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length

      const currentRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt)
          const today = new Date()
          return orderDate.toDateString() === today.toDateString() && order.status !== "cancelled"
        })
        .reduce((sum, order) => sum + (order.total || 0), 0)

      setRealtimeMetrics({
        activeOrders,
        waitingTime: calculateAverageWaitTime(orders),
        currentRevenue,
        tablesOccupied: new Set(
          orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).map((o) => o.tableNumber),
        ).size,
        staffOnDuty: 3, // Placeholder
      })
    }

    updateRealtimeMetrics()
    const interval = setInterval(updateRealtimeMetrics, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [orders])

  return { analytics, realtimeMetrics, error }
}

// Funciones auxiliares
function findComplementaryItems(productName: string, orders: Order[]): string[] {
  const itemCombinations = new Map<string, number>()

  orders.forEach((order) => {
    const hasProduct = order.items.some((item) => item.name === productName)
    if (hasProduct) {
      order.items.forEach((item) => {
        if (item.name !== productName) {
          itemCombinations.set(item.name, (itemCombinations.get(item.name) || 0) + 1)
        }
      })
    }
  })

  return Array.from(itemCombinations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)
}

function calculateAveragePreparationTime(orders: Order[]): number {
  const completedOrders = orders.filter((order) => order.status === "delivered")
  if (completedOrders.length === 0) return 0

  // Simulación - en producción se calcularía con timestamps reales
  return 15 // minutos promedio
}

function calculateFulfillmentRate(orders: Order[]): number {
  if (orders.length === 0) return 0
  const fulfilledOrders = orders.filter((order) => order.status === "delivered").length
  return fulfilledOrders / orders.length
}

function calculateAverageWaitTime(orders: Order[]): number {
  const activeOrders = orders.filter((order) => ["confirmed", "preparing"].includes(order.status))

  if (activeOrders.length === 0) return 0

  const now = new Date()
  const totalWaitTime = activeOrders.reduce((sum, order) => {
    const orderTime = new Date(order.createdAt)
    return sum + (now.getTime() - orderTime.getTime())
  }, 0)

  return Math.round(totalWaitTime / activeOrders.length / (1000 * 60)) // en minutos
}
