import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { Reservation, ReservationConfig } from "@/src/types"

/**
 * Verifica si un horario está dentro de los horarios de funcionamiento del bar
 */
export function isWithinBusinessHours(
  reservationDate: Date,
  reservationTime: string,
  config: ReservationConfig
): boolean {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayOfWeek = dayNames[reservationDate.getDay()]
  
  const dayConfig = config.businessHours[dayOfWeek]
  
  if (!dayConfig || !dayConfig.isOpen) {
    console.log(`❌ El bar está cerrado los ${dayOfWeek}`)
    return false
  }
  
  const [hours, minutes] = reservationTime.split(":").map(Number)
  const reservationMinutes = hours * 60 + minutes
  
  const [openingHours, openingMinutes] = dayConfig.openingTime.split(":").map(Number)
  const [closingHours, closingMinutes] = dayConfig.closingTime.split(":").map(Number)
  
  const openingMinutesTotal = openingHours * 60 + openingMinutes
  const closingMinutesTotal = closingHours * 60 + closingMinutes
  
  const isWithinHours = reservationMinutes >= openingMinutesTotal && reservationMinutes < closingMinutesTotal
  
  console.log(`🕐 Verificando horarios:`, {
    dayOfWeek,
    reservationTime,
    openingTime: dayConfig.openingTime,
    closingTime: dayConfig.closingTime,
    isWithinHours
  })
  
  return isWithinHours
}

/**
 * Verifica si una mesa está disponible en un horario específico
 */
export async function isTableAvailable(
  barId: string,
  tableId: string,
  reservationDate: Date,
  reservationTime: string,
  durationMinutes: number = 120
): Promise<boolean> {
  try {
    console.log("🔍 Verificando disponibilidad de mesa:", {
      barId,
      tableId,
      reservationDate: reservationDate.toISOString(),
      reservationTime,
      durationMinutes
    })

    // Calcular horarios de inicio y fin
    const [hours, minutes] = reservationTime.split(":").map(Number)
    const startTime = new Date(reservationDate)
    startTime.setHours(hours, minutes, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + durationMinutes)

    console.log("⏰ Rango de tiempo:", {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    })

    // Buscar reservas existentes para esta mesa en el mismo día
    const reservationsRef = collection(db, "bars", barId, "reservations")
    const dayStart = new Date(reservationDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(reservationDate)
    dayEnd.setHours(23, 59, 59, 999)

    // Consulta simplificada para evitar problemas de índice
    const q = query(
      reservationsRef,
      where("tableId", "==", tableId),
      where("status", "in", ["pending", "confirmed"])
    )

    const snapshot = await getDocs(q)
    const conflictingReservations: Reservation[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      const existingReservation: Reservation = {
        id: doc.id,
        ...data,
        reservationDate: data.reservationDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Reservation

      // Filtrar por fecha en JavaScript (mismo día)
      const existingDate = new Date(existingReservation.reservationDate)
      const isSameDay = existingDate.toDateString() === reservationDate.toDateString()
      
      if (!isSameDay) return // Saltar si no es el mismo día

      // Calcular horarios de la reserva existente
      const [existingHours, existingMinutes] = existingReservation.reservationTime.split(":").map(Number)
      const existingStartTime = new Date(existingReservation.reservationDate)
      existingStartTime.setHours(existingHours, existingMinutes, 0, 0)
      
      const existingEndTime = new Date(existingStartTime)
      existingEndTime.setMinutes(existingEndTime.getMinutes() + durationMinutes)

      // Verificar si hay conflicto de horarios
      const hasConflict = (
        (startTime >= existingStartTime && startTime < existingEndTime) || // Nueva reserva empieza durante reserva existente
        (endTime > existingStartTime && endTime <= existingEndTime) ||     // Nueva reserva termina durante reserva existente
        (startTime <= existingStartTime && endTime >= existingEndTime)     // Nueva reserva envuelve reserva existente
      )

      if (hasConflict) {
        conflictingReservations.push(existingReservation)
        console.log("❌ Conflicto encontrado:", {
          existingReservation: existingReservation.id,
          existingStartTime: existingStartTime.toISOString(),
          existingEndTime: existingEndTime.toISOString(),
          newStartTime: startTime.toISOString(),
          newEndTime: endTime.toISOString()
        })
      }
    })

    const isAvailable = conflictingReservations.length === 0
    
    console.log("✅ Resultado de disponibilidad:", {
      isAvailable,
      conflictingReservations: conflictingReservations.length
    })

    return isAvailable

  } catch (error) {
    console.error("❌ Error verificando disponibilidad:", error)
    return false // En caso de error, asumir que no está disponible por seguridad
  }
}

/**
 * Obtiene todas las mesas disponibles para un horario específico
 */
export async function getAvailableTables(
  barId: string,
  reservationDate: Date,
  reservationTime: string,
  durationMinutes: number = 120,
  allTables: any[]
): Promise<any[]> {
  const availableTables = []

  for (const table of allTables) {
    if (!table.isActive) continue

    const isAvailable = await isTableAvailable(
      barId,
      table.id,
      reservationDate,
      reservationTime,
      durationMinutes
    )

    if (isAvailable) {
      availableTables.push(table)
    }
  }

  return availableTables
}

/**
 * Valida si una reserva puede ser creada sin conflictos
 */
export async function validateReservation(
  barId: string,
  tableId: string,
  reservationDate: Date,
  reservationTime: string,
  durationMinutes: number = 120,
  config?: ReservationConfig
): Promise<{ isValid: boolean; error?: string }> {
  try {
    // Verificar horarios de funcionamiento si se proporciona la configuración
    if (config) {
      const isWithinHours = isWithinBusinessHours(reservationDate, reservationTime, config)
      if (!isWithinHours) {
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const dayOfWeek = dayNames[reservationDate.getDay()]
        const dayConfig = config.businessHours[Object.keys(config.businessHours)[reservationDate.getDay()]]
        
        if (!dayConfig?.isOpen) {
          return {
            isValid: false,
            error: `El bar está cerrado los ${dayOfWeek.toLowerCase()}s. Por favor, elige otro día.`
          }
        } else {
          return {
            isValid: false,
            error: `El horario seleccionado está fuera del horario de funcionamiento (${dayConfig.openingTime} - ${dayConfig.closingTime}).`
          }
        }
      }
    }

    const isAvailable = await isTableAvailable(
      barId,
      tableId,
      reservationDate,
      reservationTime,
      durationMinutes
    )

    if (!isAvailable) {
      return {
        isValid: false,
        error: "La mesa no está disponible en el horario seleccionado. Por favor, elige otro horario o mesa."
      }
    }

    return { isValid: true }

  } catch (error) {
    console.error("❌ Error validando reserva:", error)
    return {
      isValid: false,
      error: "Error verificando disponibilidad. Por favor, intenta de nuevo."
    }
  }
}
