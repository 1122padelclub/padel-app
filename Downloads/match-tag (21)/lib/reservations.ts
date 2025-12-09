import { doc, updateDoc, collection, query, where, orderBy, getDocs, Timestamp, addDoc } from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import { findBestAvailableTable, type Reservation } from "./availability"

export async function setTableState(
  barId: string,
  tableId: string,
  state: "available" | "reserved" | "occupied",
  currentReservationId: string | null = null,
) {
  try {
    const tableRef = doc(db, "bars", barId, "tables", tableId)
    await updateDoc(tableRef, {
      state,
      currentReservationId,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating table state:", error)
    throw error
  }
}

export async function findAvailableTables(barId: string, startAt: Date, durationMins = 120, partySize: number) {
  try {
    const endAt = new Date(startAt.getTime() + durationMins * 60 * 1000)

    // Obtener todas las mesas activas con capacidad suficiente
    const tablesQuery = query(
      collection(db, "bars", barId, "tables"),
      where("active", "==", true),
      where("capacity", ">=", partySize),
    )

    const tablesSnapshot = await getDocs(tablesQuery)
    const availableTables = []

    for (const tableDoc of tablesSnapshot.docs) {
      const table = { id: tableDoc.id, ...tableDoc.data() }

      // Verificar si la mesa está disponible en el horario solicitado
      const isAvailable = await checkTableAvailability(barId, table.id, startAt, endAt)

      if (isAvailable) {
        availableTables.push(table)
      }
    }

    // Ordenar por capacidad más ajustada (menor desperdicio)
    availableTables.sort((a, b) => a.capacity - b.capacity)

    return availableTables
  } catch (error) {
    console.error("Error finding available tables:", error)
    throw error
  }
}

async function checkTableAvailability(barId: string, tableId: string, startAt: Date, endAt: Date): Promise<boolean> {
  try {
    // Consultar reservas que se solapen con la franja horaria
    const reservationsQuery = query(
      collection(db, "bars", barId, "reservations"),
      where("tableId", "==", tableId),
      where("startAt", "<", Timestamp.fromDate(endAt)),
      orderBy("startAt", "asc"),
    )

    const reservationsSnapshot = await getDocs(reservationsQuery)

    // Filtrar en cliente las reservas que realmente se solapen
    const conflictingReservations = reservationsSnapshot.docs.filter((doc) => {
      const reservation = doc.data()
      const reservationStart = reservation.startAt.toDate()
      const reservationEnd = reservation.endAt.toDate()

      // Verificar solapamiento y estado activo
      const hasOverlap = reservationStart < endAt && reservationEnd > startAt
      const isActive = ["pending", "confirmed"].includes(reservation.status)

      return hasOverlap && isActive
    })

    return conflictingReservations.length === 0
  } catch (error) {
    console.error("Error checking table availability:", error)
    return false
  }
}

export async function createReservationWithTableAssignment(
  barId: string,
  reservationData: {
    startAt: Date
    durationMins: number
    partySize: number
    customerName: string
    customerPhone: string
    customerEmail?: string
    notes?: string
    source?: string
  },
): Promise<{ reservationId: string; tableNumber?: number }> {
  try {
    const bestTable = await findBestAvailableTable(
      barId,
      reservationData.startAt,
      reservationData.durationMins,
      reservationData.partySize,
    )

    if (!bestTable) {
      throw new Error("No hay mesas disponibles para la fecha y hora seleccionada")
    }

    // Crear la reserva con la mesa asignada
    const reservation: Omit<Reservation, "id"> = {
      barId,
      tableId: bestTable.tableId,
      tableNumber: bestTable.tableNumber,
      startAt: Timestamp.fromDate(reservationData.startAt),
      durationMins: reservationData.durationMins,
      partySize: reservationData.partySize,
      customerName: reservationData.customerName,
      customerPhone: reservationData.customerPhone,
      customerEmail: reservationData.customerEmail,
      notes: reservationData.notes,
      status: "pending",
      source: reservationData.source || "admin",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, "bars", barId, "reservations"), reservation)

    return {
      reservationId: docRef.id,
      tableNumber: bestTable.tableNumber,
    }
  } catch (error) {
    console.error("Error creating reservation with table assignment:", error)
    throw error
  }
}

export async function cancelReservation(barId: string, reservationId: string, reason?: string) {
  try {
    const reservationRef = doc(db, "bars", barId, "reservations", reservationId)

    // Obtener datos de la reserva para liberar la mesa
    const reservationDoc = await getDocs(
      query(collection(db, "bars", barId, "reservations"), where("__name__", "==", reservationId)),
    )

    if (!reservationDoc.empty) {
      const reservation = reservationDoc.docs[0].data()

      // Actualizar reserva
      await updateDoc(reservationRef, {
        status: "cancelled",
        cancelReason: reason || null,
        cancelledAt: Timestamp.now(),
      })

      // Liberar mesa si estaba asignada
      if (reservation.tableId && reservation.status !== "cancelled") {
        await setTableState(barId, reservation.tableId, "available", null)
      }
    }
  } catch (error) {
    console.error("Error cancelling reservation:", error)
    throw error
  }
}

export async function completeReservation(barId: string, reservationId: string) {
  try {
    const reservationRef = doc(db, "bars", barId, "reservations", reservationId)

    // Obtener datos de la reserva
    const reservationDoc = await getDocs(
      query(collection(db, "bars", barId, "reservations"), where("__name__", "==", reservationId)),
    )

    if (!reservationDoc.empty) {
      const reservation = reservationDoc.docs[0].data()

      // Actualizar reserva
      await updateDoc(reservationRef, {
        status: "completed",
        completedAt: Timestamp.now(),
      })

      // Liberar mesa
      if (reservation.tableId) {
        await setTableState(barId, reservation.tableId, "available", null)
      }
    }
  } catch (error) {
    console.error("Error completing reservation:", error)
    throw error
  }
}

export async function getAvailableTimeSlots(barId: string, date: Date, partySize: number, durationMins = 120) {
  try {
    const slots = []
    const startHour = 12 // 12:00 PM
    const endHour = 22 // 10:00 PM
    const slotInterval = 30 // 30 minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotTime = new Date(date)
        slotTime.setHours(hour, minute, 0, 0)

        // Verificar si hay mesas disponibles para este horario
        const availableTables = await findAvailableTables(barId, slotTime, durationMins, partySize)

        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
          datetime: slotTime,
          available: availableTables.length > 0,
          availableTablesCount: availableTables.length,
          suggestedTable: availableTables[0] || null,
        })
      }
    }

    return slots
  } catch (error) {
    console.error("Error getting available time slots:", error)
    throw error
  }
}
