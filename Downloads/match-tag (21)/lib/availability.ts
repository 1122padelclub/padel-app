import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import type { Reservation } from "@/src/types/reservation"
import type { Table } from "@/src/types"

export interface TimeSlot {
  time: string
  available: boolean
  availableTables: number
  totalTables: number
}

export interface AvailabilityCheck {
  date: Date
  partySize: number
  durationMins: number
}

export interface TableAvailability {
  tableId: string
  tableNumber: number
  capacity: number
  isAvailable: boolean
  nextAvailableTime?: Date
}

/**
 * Verifica la disponibilidad de mesas para una fecha y hora específica
 */
export async function checkTableAvailability(
  barId: string,
  startTime: Date,
  durationMins: number,
  partySize: number,
): Promise<TableAvailability[]> {
  try {
    // Obtener todas las mesas del bar
    const tablesSnapshot = await getDocs(query(collection(db, "tables"), where("barId", "==", barId)))
    const tables = tablesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Table[]

    // Filtrar mesas que pueden acomodar el grupo y están activas
    const suitableTables = tables.filter(
      (table) => table.capacity >= partySize && table.isActive && !table.isOccupied, // Exclude manually occupied tables
    )

    // Calcular tiempo de fin de la nueva reserva
    const endTime = new Date(startTime.getTime() + durationMins * 60000)

    // Obtener reservas existentes que podrían conflictar
    const reservationsSnapshot = await getDocs(
      query(
        collection(db, "reservations"),
        where("barId", "==", barId),
        where("status", "in", ["pending", "confirmed"]),
      ),
    )

    const existingReservations = reservationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reservation[]

    // Verificar disponibilidad de cada mesa
    const availability: TableAvailability[] = suitableTables.map((table) => {
      const conflictingReservations = existingReservations.filter((reservation) => {
        // Verificar si la reserva es para esta mesa
        if (reservation.tableId !== table.id && reservation.tableNumber !== table.number) {
          return false
        }

        // Obtener tiempo de inicio y fin de la reserva existente
        let reservationStart: Date
        let reservationEnd: Date

        if (reservation.startAt) {
          reservationStart = reservation.startAt.toDate ? reservation.startAt.toDate() : new Date(reservation.startAt)
          reservationEnd = new Date(reservationStart.getTime() + (reservation.durationMins || 120) * 60000)
        } else if (reservation.date && reservation.time) {
          const dateStr =
            typeof reservation.date === "string" ? reservation.date : reservation.date.toISOString().split("T")[0]
          reservationStart = new Date(`${dateStr}T${reservation.time}:00`)
          reservationEnd = new Date(reservationStart.getTime() + (reservation.durationMins || 120) * 60000)
        } else {
          return false
        }

        // Verificar si hay solapamiento
        return startTime < reservationEnd && endTime > reservationStart
      })

      const isAvailable = conflictingReservations.length === 0

      // Si no está disponible, calcular próximo tiempo disponible
      let nextAvailableTime: Date | undefined
      if (!isAvailable) {
        const latestEndTime = Math.max(
          ...conflictingReservations.map((res) => {
            if (res.startAt) {
              const start = res.startAt.toDate ? res.startAt.toDate() : new Date(res.startAt)
              return start.getTime() + (res.durationMins || 120) * 60000
            } else if (res.date && res.time) {
              const dateStr = typeof res.date === "string" ? res.date : res.date.toISOString().split("T")[0]
              const start = new Date(`${dateStr}T${res.time}:00`)
              return start.getTime() + (res.durationMins || 120) * 60000
            }
            return 0
          }),
        )
        nextAvailableTime = new Date(latestEndTime)
      }

      return {
        tableId: table.id,
        tableNumber: table.number,
        capacity: table.capacity || 4,
        isAvailable,
        nextAvailableTime,
      }
    })

    return availability
  } catch (error) {
    console.error("Error checking table availability:", error)
    throw new Error("Error al verificar disponibilidad de mesas")
  }
}

/**
 * Obtiene los horarios disponibles para una fecha específica
 */
export async function getAvailableTimeSlots(
  barId: string,
  date: Date,
  partySize: number,
  durationMins = 120,
): Promise<TimeSlot[]> {
  const timeSlots: TimeSlot[] = []

  // Generar slots de 30 minutos desde las 12:00 hasta las 22:00
  for (let hour = 12; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

      // Crear fecha y hora específica
      const slotDateTime = new Date(date)
      slotDateTime.setHours(hour, minute, 0, 0)

      // Verificar si el slot es en el pasado
      if (slotDateTime < new Date()) {
        timeSlots.push({
          time,
          available: false,
          availableTables: 0,
          totalTables: 0,
        })
        continue
      }

      try {
        const availability = await checkTableAvailability(barId, slotDateTime, durationMins, partySize)
        const availableTables = availability.filter((table) => table.isAvailable).length
        const totalTables = availability.length

        timeSlots.push({
          time,
          available: availableTables > 0,
          availableTables,
          totalTables,
        })
      } catch (error) {
        console.error(`Error checking availability for ${time}:`, error)
        timeSlots.push({
          time,
          available: false,
          availableTables: 0,
          totalTables: 0,
        })
      }
    }
  }

  return timeSlots
}

/**
 * Encuentra la mejor mesa disponible para una reserva
 */
export async function findBestAvailableTable(
  barId: string,
  startTime: Date,
  durationMins: number,
  partySize: number,
): Promise<{ tableId: string; tableNumber: number } | null> {
  try {
    const availability = await checkTableAvailability(barId, startTime, durationMins, partySize)

    // Filtrar solo mesas disponibles
    const availableTables = availability.filter((table) => table.isAvailable)

    if (availableTables.length === 0) {
      return null
    }

    // Ordenar por capacidad (preferir la mesa más pequeña que acomode el grupo)
    availableTables.sort((a, b) => a.capacity - b.capacity)

    const bestTable = availableTables[0]
    return {
      tableId: bestTable.tableId,
      tableNumber: bestTable.tableNumber,
    }
  } catch (error) {
    console.error("Error finding best available table:", error)
    return null
  }
}

/**
 * Verifica si una mesa específica está disponible
 */
export async function isTableAvailable(
  barId: string,
  tableId: string,
  startTime: Date,
  durationMins: number,
  excludeReservationId?: string,
): Promise<boolean> {
  try {
    const tableSnapshot = await getDocs(query(collection(db, "tables"), where("barId", "==", barId)))
    const table = tableSnapshot.docs.find((doc) => doc.id === tableId)?.data() as Table | undefined

    if (!table || !table.isActive || table.isOccupied) {
      return false
    }

    const endTime = new Date(startTime.getTime() + durationMins * 60000)

    const reservationsQuery = query(
      collection(db, "reservations"),
      where("barId", "==", barId),
      where("status", "in", ["pending", "confirmed"]),
    )

    const reservationsSnapshot = await getDocs(reservationsQuery)
    const existingReservations = reservationsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((res) => res.id !== excludeReservationId) as Reservation[]

    // Verificar conflictos
    const conflictingReservations = existingReservations.filter((reservation) => {
      // Verificar si la reserva es para esta mesa
      if (reservation.tableId !== tableId) {
        return false
      }

      // Obtener tiempo de inicio y fin de la reserva existente
      let reservationStart: Date
      let reservationEnd: Date

      if (reservation.startAt) {
        reservationStart = reservation.startAt.toDate ? reservation.startAt.toDate() : new Date(reservation.startAt)
        reservationEnd = new Date(reservationStart.getTime() + (reservation.durationMins || 120) * 60000)
      } else if (reservation.date && reservation.time) {
        const dateStr =
          typeof reservation.date === "string" ? reservation.date : reservation.date.toISOString().split("T")[0]
        reservationStart = new Date(`${dateStr}T${reservation.time}:00`)
        reservationEnd = new Date(reservationStart.getTime() + (reservation.durationMins || 120) * 60000)
      } else {
        return false
      }

      // Verificar si hay solapamiento
      return startTime < reservationEnd && endTime > reservationStart
    })

    return conflictingReservations.length === 0
  } catch (error) {
    console.error("Error checking table availability:", error)
    return false
  }
}

/**
 * Obtiene estadísticas de ocupación para un día
 */
export async function getDayOccupancyStats(barId: string, date: Date) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const reservationsSnapshot = await getDocs(
      query(
        collection(db, "reservations"),
        where("barId", "==", barId),
        where("status", "in", ["pending", "confirmed", "completed"]),
      ),
    )

    const dayReservations = reservationsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((reservation) => {
        let reservationDate: Date

        if (reservation.startAt) {
          reservationDate = reservation.startAt.toDate ? reservation.startAt.toDate() : new Date(reservation.startAt)
        } else if (reservation.date) {
          reservationDate = typeof reservation.date === "string" ? new Date(reservation.date) : reservation.date
        } else {
          return false
        }

        return reservationDate >= startOfDay && reservationDate <= endOfDay
      }) as Reservation[]

    const tablesSnapshot = await getDocs(query(collection(db, "tables"), where("barId", "==", barId)))
    const tables = tablesSnapshot.docs.map((doc) => doc.data() as Table)
    const totalTables = tables.length
    const totalCapacity = tables.reduce((sum, table) => sum + (table.capacity || 4), 0)
    const manuallyOccupiedTables = tables.filter((table) => table.isOccupied).length

    // Calcular estadísticas
    const totalReservations = dayReservations.length
    const totalGuests = dayReservations.reduce((sum, res) => sum + (res.partySize || res.guestCount || 0), 0)
    const confirmedReservations = dayReservations.filter((res) => res.status === "confirmed").length
    const pendingReservations = dayReservations.filter((res) => res.status === "pending").length

    return {
      totalReservations,
      confirmedReservations,
      pendingReservations,
      totalGuests,
      totalTables,
      totalCapacity,
      manuallyOccupiedTables, // Add manually occupied tables count
      occupancyRate: totalTables > 0 ? ((totalReservations + manuallyOccupiedTables) / totalTables) * 100 : 0,
      capacityUtilization: totalCapacity > 0 ? (totalGuests / totalCapacity) * 100 : 0,
    }
  } catch (error) {
    console.error("Error getting day occupancy stats:", error)
    throw new Error("Error al obtener estadísticas de ocupación")
  }
}
