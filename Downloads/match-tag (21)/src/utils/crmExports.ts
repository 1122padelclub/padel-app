"use client"

import * as XLSX from 'xlsx'
import type { Review, Order, Reservation } from '@/src/types'

// Utilidades para exportar reseñas
export const exportReviewsToExcel = (reviews: Review[], filename: string = 'reviews') => {
  const workbook = XLSX.utils.book_new()

  // Hoja 1: Reseñas por fecha
  const reviewsData = reviews.map(review => ({
    'ID': review.id,
    'Fecha': new Date(review.createdAt).toLocaleDateString('es-ES'),
    'Hora': new Date(review.createdAt).toLocaleTimeString('es-ES'),
    'Calificación': review.rating,
    'Comentario': review.comment || 'Sin comentario',
    'Cliente': review.customerName || 'Anónimo',
    'Email': review.customerEmail || 'No proporcionado',
    'Teléfono': review.customerPhone || 'No proporcionado',
    'Mesa': review.tableNumber || 'N/A',
    'Bar ID': review.barId,
    'Estado': review.status || 'activo'
  }))

  const reviewsSheet = XLSX.utils.json_to_sheet(reviewsData)
  XLSX.utils.book_append_sheet(workbook, reviewsSheet, 'Reseñas por Fecha')

  // Hoja 2: Análisis de sentimientos
  const sentimentAnalysis = calculateSentimentAnalysis(reviews)
  const sentimentSheet = XLSX.utils.json_to_sheet(sentimentAnalysis)
  XLSX.utils.book_append_sheet(workbook, sentimentSheet, 'Análisis de Sentimientos')

  // Hoja 3: Respuestas a reseñas
  const responsesData = reviews
    .filter(review => review.response)
    .map(review => ({
      'ID Reseña': review.id,
      'Calificación': review.rating,
      'Comentario Original': review.comment,
      'Respuesta': review.response,
      'Fecha Respuesta': review.responseDate ? new Date(review.responseDate).toLocaleDateString('es-ES') : 'N/A',
      'Cliente': review.customerName || 'Anónimo'
    }))

  const responsesSheet = XLSX.utils.json_to_sheet(responsesData)
  XLSX.utils.book_append_sheet(workbook, responsesSheet, 'Respuestas a Reseñas')

  // Descargar archivo
  XLSX.writeFile(workbook, `${filename}_reviews_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Utilidades para exportar pedidos
export const exportOrdersToExcel = (orders: Order[], filename: string = 'orders') => {
  const workbook = XLSX.utils.book_new()

  // Hoja 1: Pedidos diarios
  const ordersData = orders.map(order => ({
    'ID': order.id,
    'Fecha': new Date(order.createdAt).toLocaleDateString('es-ES'),
    'Hora': new Date(order.createdAt).toLocaleTimeString('es-ES'),
    'Mesa': order.tableNumber || 'N/A',
    'Estado': order.status,
    'Total': order.total,
    'Items': order.items.length,
    'Cliente': order.customerName || 'No registrado',
    'Teléfono': order.customerPhone || 'No proporcionado',
    'Tipo Cuenta': order.accountType || 'Estándar',
    'Bar ID': order.barId
  }))

  const ordersSheet = XLSX.utils.json_to_sheet(ordersData)
  XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Pedidos Diarios')

  // Hoja 2: Productos más vendidos
  const productAnalysis = calculateProductAnalysis(orders)
  const productsSheet = XLSX.utils.json_to_sheet(productAnalysis)
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Productos Más Vendidos')

  // Hoja 3: Análisis de revenue
  const revenueAnalysis = calculateRevenueAnalysis(orders)
  const revenueSheet = XLSX.utils.json_to_sheet(revenueAnalysis)
  XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Análisis de Revenue')

  // Descargar archivo
  XLSX.writeFile(workbook, `${filename}_orders_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Utilidades para exportar reservas
export const exportReservationsToExcel = (reservations: Reservation[], filename: string = 'reservations') => {
  const workbook = XLSX.utils.book_new()

  // Hoja 1: Reservas por fecha
  const reservationsData = reservations.map(reservation => ({
    'ID': reservation.id,
    'Fecha Reserva': new Date(reservation.reservationDate).toLocaleDateString('es-ES'),
    'Hora': reservation.time,
    'Personas': reservation.partySize,
    'Cliente': reservation.customerName,
    'Email': reservation.customerEmail,
    'Teléfono': reservation.customerPhone,
    'Estado': reservation.status,
    'Notas': reservation.notes || 'Sin notas',
    'Mesa Asignada': reservation.assignedTable || 'Pendiente',
    'Bar ID': reservation.barId,
    'Creado': new Date(reservation.createdAt).toLocaleDateString('es-ES')
  }))

  const reservationsSheet = XLSX.utils.json_to_sheet(reservationsData)
  XLSX.utils.book_append_sheet(workbook, reservationsSheet, 'Reservas por Fecha')

  // Hoja 2: Análisis de ocupación
  const occupancyAnalysis = calculateOccupancyAnalysis(reservations)
  const occupancySheet = XLSX.utils.json_to_sheet(occupancyAnalysis)
  XLSX.utils.book_append_sheet(workbook, occupancySheet, 'Análisis de Ocupación')

  // Hoja 3: Cancelaciones y no-shows
  const cancellationsData = reservations
    .filter(res => res.status === 'cancelled' || res.status === 'no_show')
    .map(reservation => ({
      'ID': reservation.id,
      'Fecha Reserva': new Date(reservation.reservationDate).toLocaleDateString('es-ES'),
      'Hora': reservation.time,
      'Personas': reservation.partySize,
      'Cliente': reservation.customerName,
      'Estado': reservation.status,
      'Motivo Cancelación': reservation.cancellationReason || 'No especificado',
      'Fecha Cancelación': reservation.cancelledAt ? new Date(reservation.cancelledAt).toLocaleDateString('es-ES') : 'N/A'
    }))

  const cancellationsSheet = XLSX.utils.json_to_sheet(cancellationsData)
  XLSX.utils.book_append_sheet(workbook, cancellationsSheet, 'Cancelaciones y No-Shows')

  // Descargar archivo
  XLSX.writeFile(workbook, `${filename}_reservations_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Función para exportar dashboard consolidado
export const exportConsolidatedDashboard = (
  reviews: Review[], 
  orders: Order[], 
  reservations: Reservation[],
  filename: string = 'dashboard_consolidado'
) => {
  const workbook = XLSX.utils.book_new()

  // Hoja 1: KPIs consolidados
  const kpis = calculateConsolidatedKPIs(reviews, orders, reservations)
  const kpisSheet = XLSX.utils.json_to_sheet(kpis)
  XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs Consolidados')

  // Hoja 2: Métricas por período
  const periodMetrics = calculatePeriodMetrics(reviews, orders, reservations)
  const periodSheet = XLSX.utils.json_to_sheet(periodMetrics)
  XLSX.utils.book_append_sheet(workbook, periodSheet, 'Métricas por Período')

  // Hoja 3: Comparativas mensuales
  const monthlyComparison = calculateMonthlyComparison(reviews, orders, reservations)
  const monthlySheet = XLSX.utils.json_to_sheet(monthlyComparison)
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Comparativas Mensuales')

  // Descargar archivo
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Funciones auxiliares para análisis
function calculateSentimentAnalysis(reviews: Review[]) {
  const totalReviews = reviews.length
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    'Calificación': rating,
    'Cantidad': reviews.filter(r => r.rating === rating).length,
    'Porcentaje': ((reviews.filter(r => r.rating === rating).length / totalReviews) * 100).toFixed(2) + '%'
  }))

  return [
    { 'Métrica': 'Total Reseñas', 'Valor': totalReviews },
    { 'Métrica': 'Calificación Promedio', 'Valor': avgRating.toFixed(2) },
    { 'Métrica': 'NPS Score', 'Valor': calculateNPS(reviews) },
    ...ratingDistribution
  ]
}

function calculateProductAnalysis(orders: Order[]) {
  const productMap = new Map()
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const existing = productMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 }
      existing.quantity += item.quantity
      existing.revenue += (item.promotionPrice || item.price) * item.quantity
      productMap.set(item.name, existing)
    })
  })

  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .map((product, index) => ({
      'Ranking': index + 1,
      'Producto': product.name,
      'Cantidad Vendida': product.quantity,
      'Revenue': product.revenue.toFixed(2),
      'Promedio por Unidad': (product.revenue / product.quantity).toFixed(2)
    }))
}

function calculateRevenueAnalysis(orders: Order[]) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const avgOrderValue = totalRevenue / orders.length
  
  const statusBreakdown = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + order.total
    return acc
  }, {} as Record<string, number>)

  return [
    { 'Métrica': 'Revenue Total', 'Valor': totalRevenue.toFixed(2) },
    { 'Métrica': 'Valor Promedio por Pedido', 'Valor': avgOrderValue.toFixed(2) },
    { 'Métrica': 'Total de Pedidos', 'Valor': orders.length },
    ...Object.entries(statusBreakdown).map(([status, revenue]) => ({
      'Métrica': `Revenue - ${status}`,
      'Valor': revenue.toFixed(2)
    }))
  ]
}

function calculateOccupancyAnalysis(reservations: Reservation[]) {
  const totalReservations = reservations.length
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length
  const noShowReservations = reservations.filter(r => r.status === 'no_show').length

  return [
    { 'Métrica': 'Total Reservas', 'Valor': totalReservations },
    { 'Métrica': 'Reservas Confirmadas', 'Valor': confirmedReservations },
    { 'Métrica': 'Reservas Canceladas', 'Valor': cancelledReservations },
    { 'Métrica': 'No-Shows', 'Valor': noShowReservations },
    { 'Métrica': 'Tasa de Confirmación', 'Valor': ((confirmedReservations / totalReservations) * 100).toFixed(2) + '%' },
    { 'Métrica': 'Tasa de Cancelación', 'Valor': ((cancelledReservations / totalReservations) * 100).toFixed(2) + '%' },
    { 'Métrica': 'Tasa de No-Show', 'Valor': ((noShowReservations / totalReservations) * 100).toFixed(2) + '%' }
  ]
}

function calculateConsolidatedKPIs(reviews: Review[], orders: Order[], reservations: Reservation[]) {
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalReservations = reservations.length
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length
  const confirmationRate = totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return [
    { 'KPI': 'Calificación Promedio', 'Valor': avgRating.toFixed(2), 'Unidad': 'estrellas' },
    { 'KPI': 'Total Revenue', 'Valor': totalRevenue.toFixed(2), 'Unidad': 'pesos' },
    { 'KPI': 'Total Pedidos', 'Valor': orders.length, 'Unidad': 'pedidos' },
    { 'KPI': 'Total Reservas', 'Valor': totalReservations, 'Unidad': 'reservas' },
    { 'KPI': 'Tasa de Confirmación', 'Valor': confirmationRate.toFixed(2), 'Unidad': '%' },
    { 'KPI': 'Valor Promedio por Pedido', 'Valor': avgOrderValue.toFixed(2), 'Unidad': 'pesos' }
  ]
}

function calculatePeriodMetrics(reviews: Review[], orders: Order[], reservations: Reservation[]) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const today = new Date(currentYear, currentMonth, now.getDate())
  const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))
  const monthStart = new Date(currentYear, currentMonth, 1)

  // Calcular métricas para hoy
  const todayReviews = reviews.filter(r => new Date(r.createdAt) >= today).length
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today).length
  const todayReservations = reservations.filter(r => new Date(r.reservationDate) >= today).length

  // Calcular métricas para esta semana
  const weekReviews = reviews.filter(r => new Date(r.createdAt) >= weekStart).length
  const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekStart).length
  const weekReservations = reservations.filter(r => new Date(r.reservationDate) >= weekStart).length

  // Calcular métricas para este mes
  const monthReviews = reviews.filter(r => new Date(r.createdAt) >= monthStart).length
  const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthStart).length
  const monthReservations = reservations.filter(r => new Date(r.reservationDate) >= monthStart).length

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return [
    { 'Período': `Hoy (${today.toLocaleDateString('es-ES')})`, 'Reseñas': todayReviews, 'Pedidos': todayOrders, 'Reservas': todayReservations },
    { 'Período': `Esta Semana (${weekStart.toLocaleDateString('es-ES')} - ${today.toLocaleDateString('es-ES')})`, 'Reseñas': weekReviews, 'Pedidos': weekOrders, 'Reservas': weekReservations },
    { 'Período': `${months[currentMonth]} ${currentYear}`, 'Reseñas': monthReviews, 'Pedidos': monthOrders, 'Reservas': monthReservations }
  ]
}

function calculateMonthlyComparison(reviews: Review[], orders: Order[], reservations: Reservation[]) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const monthlyData = months.map((monthName, monthIndex) => {
    const monthStart = new Date(currentYear, monthIndex, 1)
    const monthEnd = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59)

    // Filtrar datos por mes
    const monthReviews = reviews.filter(r => {
      const reviewDate = new Date(r.createdAt)
      return reviewDate >= monthStart && reviewDate <= monthEnd
    }).length

    const monthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= monthStart && orderDate <= monthEnd
    })

    const monthReservations = reservations.filter(r => {
      const reservationDate = new Date(r.reservationDate)
      return reservationDate >= monthStart && reservationDate <= monthEnd
    }).length

    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)

    return {
      'Mes': `${monthName} ${currentYear}`,
      'Reseñas': monthReviews,
      'Pedidos': monthOrders.length,
      'Reservas': monthReservations,
      'Revenue': monthRevenue.toFixed(2)
    }
  })

  return monthlyData
}

function calculateNPS(reviews: Review[]) {
  const promoters = reviews.filter(r => r.rating >= 4).length
  const detractors = reviews.filter(r => r.rating <= 2).length
  const total = reviews.length
  
  return total > 0 ? (((promoters - detractors) / total) * 100).toFixed(2) : '0.00'
}
