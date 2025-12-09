"use client"

import { useState, useEffect } from "react"
import { useReservations } from "./useReservations"
import { useReservationNotifications } from "./useReservationNotifications"

export function useReservationReminders(barId: string) {
  const { reservations } = useReservations(barId)
  const { sendNotification } = useReservationNotifications()
  const [remindersSent, setRemindersSent] = useState<Set<string>>(new Set())

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 horas desde ahora
      
      reservations.forEach(async (reservation) => {
        if (reservation.status !== 'confirmed') return
        
        const reservationDateTime = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`)
        
        // Verificar si la reserva está dentro de las próximas 2 horas
        if (reservationDateTime <= twoHoursFromNow && reservationDateTime > now) {
          const reminderKey = `${reservation.id}-${reservationDateTime.toISOString()}`
          
          // Verificar si ya se envió el recordatorio
          if (!remindersSent.has(reminderKey)) {
            try {
              await sendNotification({
                customerName: reservation.customerName,
                customerEmail: reservation.customerEmail,
                customerPhone: reservation.customerPhone,
                reservationDate: reservation.reservationDate,
                reservationTime: reservation.reservationTime,
                tableNumber: reservation.tableNumber,
                partySize: reservation.partySize,
                barName: "Nuestro Restaurante",
                type: 'reminder'
              })
              
              setRemindersSent(prev => new Set([...prev, reminderKey]))
              console.log(`✅ Recordatorio enviado para reserva ${reservation.id}`)
            } catch (error) {
              console.error(`❌ Error enviando recordatorio para reserva ${reservation.id}:`, error)
            }
          }
        }
      })
    }

    // Verificar recordatorios cada 5 minutos
    const interval = setInterval(checkReminders, 5 * 60 * 1000)
    
    // Verificar inmediatamente al cargar
    checkReminders()

    return () => clearInterval(interval)
  }, [reservations, sendNotification, remindersSent])

  return {
    remindersSent: remindersSent.size
  }
}

