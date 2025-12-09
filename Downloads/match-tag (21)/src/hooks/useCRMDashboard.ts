"use client"

import { useReviews } from "./useReviews"
import { useOrders } from "./useOrders"
import { useReservations } from "./useReservations"

export function useCRMDashboard(barId: string) {
  const reviews = useReviews(barId)
  const orders = useOrders(barId)
  const reservations = useReservations(barId)

  const loading = reviews.loading || orders.loading || reservations.loading
  const error = reviews.error || orders.error || reservations.error

  return {
    // Datos
    reviews: reviews.reviews,
    orders: orders.orders,
    reservations: reservations.reservations,
    
    // Estados
    loading,
    error,
    
    // Funciones específicas
    reviewsActions: {
      addReview: reviews.addReview,
      updateReview: reviews.updateReview
    },
    ordersActions: {
      updateOrderStatus: orders.updateOrderStatus,
      getOrdersByStatus: orders.getOrdersByStatus,
      getOrdersByDateRange: orders.getOrdersByDateRange
    },
    reservationsActions: {
      updateReservationStatus: reservations.updateReservationStatus,
      getReservationsByStatus: reservations.getReservationsByStatus,
      getReservationsByDateRange: reservations.getReservationsByDateRange,
      getReservationsByDate: reservations.getReservationsByDate
    }
  }
}
