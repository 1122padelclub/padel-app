"use client"

import { useState } from "react"

export interface NotificationData {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  reservationDate: Date
  reservationTime: string
  tableNumber: number | string
  partySize: number
  barName?: string
  type?: 'confirmation' | 'rejection' | 'cancelled' | 'completed' | 'no_show' | 'reminder'
}

export function useReservationNotifications() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendNotification = async (data: NotificationData) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("📧 Enviando notificación de reserva:", data)

      const response = await fetch('/api/send-reservation-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          reservationDate: data.reservationDate.toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error enviando notificación')
      }

      console.log("✅ Notificación enviada exitosamente:", result)
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error("❌ Error enviando notificación:", errorMessage)
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendNotification,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}




