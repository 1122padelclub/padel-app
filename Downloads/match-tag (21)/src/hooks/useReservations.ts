"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, limit, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Reservation, Bar, Table } from "@/src/types"
import { ReservationEmailService } from "@/src/services/reservationEmailService"

export function useReservations(barId: string) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const reservationsRef = collection(db, "bars", barId, "reservations")
    const q = query(
      reservationsRef,
      orderBy("reservationDate", "desc"),
      limit(1000) // Limitar para performance
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const reservationsData = snapshot.docs.map(doc => {
            const data = doc.data()
            
            // Manejar tanto reservationDate (legacy) como startAt (nuevo)
            let reservationDate: Date
            let reservationTime: string
            
            if (data.startAt) {
              // Nuevo formato con startAt
              const startAt = data.startAt?.toDate?.() || new Date(data.startAt)
              reservationDate = new Date(startAt)
              reservationDate.setHours(0, 0, 0, 0) // Solo la fecha
              reservationTime = startAt.toTimeString().slice(0, 5) // HH:MM
            } else {
              // Formato legacy con reservationDate
              reservationDate = data.reservationDate?.toDate?.() || new Date(data.reservationDate)
              reservationTime = data.reservationTime || ""
            }
            
            return {
              id: doc.id,
              barId: data.barId || "",
              customerName: data.customerName || "",
              customerEmail: data.customerEmail || "",
              customerPhone: data.customerPhone || "",
              partySize: data.partySize || 1,
              reservationDate: reservationDate,
              reservationTime: reservationTime,
              status: data.status || "pending",
              notes: data.notes || "",
              assignedTable: data.assignedTable || "",
              cancellationReason: data.cancellationReason || "",
              cancelledAt: data.cancelledAt?.toDate?.() || (data.cancelledAt ? new Date(data.cancelledAt) : null),
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
              // Campos adicionales para compatibilidad
              startAt: data.startAt?.toDate?.() || new Date(data.startAt),
              endAt: data.endAt?.toDate?.() || new Date(data.endAt),
              tableId: data.tableId || null,
              tableNumber: data.tableNumber || null
            } as Reservation
          })

          setReservations(reservationsData)
          setError(null)
        } catch (err: any) {
          console.error("Error processing reservations:", err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error("Error loading reservations:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  const updateReservation = async (reservationId: string, updates: Partial<Reservation>) => {
    try {
      const reservationRef = doc(db, "bars", barId, "reservations", reservationId)
      await updateDoc(reservationRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      // Enviar email de actualización si hay email del cliente
      if (updates.customerEmail || updates.status) {
        try {
          const updatedReservation = { ...reservations.find(r => r.id === reservationId), ...updates } as Reservation
          if (updatedReservation.customerEmail) {
            const emailService = ReservationEmailService.getInstance()
            const updateType = updates.status === 'confirmed' ? 'confirmed' : 
                              updates.status === 'cancelled' ? 'cancelled' : 'modified'
            await emailService.sendReservationUpdate(updatedReservation, undefined, updateType)
            console.log("✅ Email de actualización enviado para reserva:", reservationId)
          }
        } catch (emailError) {
          console.error("⚠️ Error enviando email de actualización:", emailError)
          // No lanzar error para no interrumpir la actualización
        }
      }
    } catch (err: any) {
      console.error("Error updating reservation:", err)
      throw err
    }
  }

  const updateReservationStatus = async (reservationId: string, status: Reservation['status']) => {
    try {
      await updateReservation(reservationId, { status })
    } catch (err: any) {
      console.error("Error updating reservation status:", err)
      throw err
    }
  }

  const deleteReservation = async (reservationId: string) => {
    try {
      const reservationRef = doc(db, "bars", barId, "reservations", reservationId)
      await deleteDoc(reservationRef)
    } catch (err: any) {
      console.error("Error deleting reservation:", err)
      throw err
    }
  }

  // Función para asignar automáticamente una mesa
  const assignTable = async (reservationDate: Date, reservationTime: string, partySize: number): Promise<Table | null> => {
    try {
      // Cargar todas las mesas
      const tablesRef = collection(db, "bars", barId, "tables")
      const tablesSnapshot = await getDocs(tablesRef)
      const tables = tablesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Table[]

      // Cargar reservas existentes para la fecha
      const reservationsRef = collection(db, "bars", barId, "reservations")
      const dateStr = reservationDate.toISOString().split('T')[0]
      const startOfDay = new Date(reservationDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(reservationDate)
      endOfDay.setHours(23, 59, 59, 999)

      const reservationsQuery = query(
        reservationsRef,
        where("reservationDate", ">=", startOfDay),
        where("reservationDate", "<=", endOfDay)
      )
      
      const reservationsSnapshot = await getDocs(reservationsQuery)
      const existingReservations = reservationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[]

      // Calcular horarios de la reserva
      const [hours, minutes] = reservationTime.split(':').map(Number)
      const reservationStart = new Date(reservationDate)
      reservationStart.setHours(hours, minutes, 0, 0)
      
      // Duración de reserva (2 horas por defecto)
      const reservationDuration = 120 // minutos
      const reservationEnd = new Date(reservationStart.getTime() + reservationDuration * 60000)

      // Filtrar mesas disponibles
      const availableTables = tables.filter(table => {
        // Verificar que la mesa tenga capacidad suficiente
        if (table.capacity && table.capacity < partySize) return false

        // Verificar que no haya conflictos de horario
        const hasConflict = existingReservations.some(existingReservation => {
          if (existingReservation.tableNumber === table.number || existingReservation.tableId === table.id) {
            const existingTime = existingReservation.reservationTime || existingReservation.time
            if (existingTime) {
              const [existingHours, existingMinutes] = existingTime.split(':').map(Number)
              const existingStart = new Date(existingReservation.reservationDate)
              existingStart.setHours(existingHours, existingMinutes, 0, 0)
              
              const existingEnd = new Date(existingStart.getTime() + reservationDuration * 60000)
              
              // Verificar si hay solapamiento de horarios
              return (reservationStart < existingEnd && reservationEnd > existingStart)
            }
          }
          return false
        })

        return !hasConflict
      })

      // Ordenar por capacidad (preferir mesa más pequeña que pueda acomodar al grupo)
      availableTables.sort((a, b) => {
        const aCapacity = a.capacity || 4
        const bCapacity = b.capacity || 4
        
        // Si ambas pueden acomodar al grupo, preferir la más pequeña
        if (aCapacity >= partySize && bCapacity >= partySize) {
          return aCapacity - bCapacity
        }
        
        // Si solo una puede acomodar al grupo, preferir esa
        if (aCapacity >= partySize) return -1
        if (bCapacity >= partySize) return 1
        
        return aCapacity - bCapacity
      })

      return availableTables.length > 0 ? availableTables[0] : null
    } catch (error) {
      console.error("Error assigning table:", error)
      return null
    }
  }

  const createReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt'>) => {
    try {
      // Intentar asignar una mesa automáticamente
      let assignedTable: Table | null = null
      let tableNumber: number | string = "Por asignar"
      let tableId: string | null = null

      if (reservationData.reservationTime) {
        assignedTable = await assignTable(
          reservationData.reservationDate,
          reservationData.reservationTime,
          reservationData.partySize
        )

        if (assignedTable) {
          tableNumber = assignedTable.number
          tableId = assignedTable.id
        } else {
          // Si no hay mesas disponibles, rechazar la reserva
          throw new Error("No hay mesas disponibles para la fecha y hora seleccionada. Por favor, elige otra hora.")
        }
      }

      const reservationWithTable = {
        ...reservationData,
        tableNumber,
        tableId,
        assignedTable: tableNumber !== "Por asignar" ? "asignada" : "pendiente"
      }

      const reservationsRef = collection(db, "bars", barId, "reservations")
      const docRef = await addDoc(reservationsRef, {
        ...reservationWithTable,
        createdAt: serverTimestamp()
      })
      
      // Crear objeto de reserva completo para el email
      const fullReservation: Reservation = {
        ...reservationWithTable,
        id: docRef.id,
        createdAt: new Date()
      }

      // Enviar email de confirmación
      try {
        // Cargar configuración del bar para el email
        const barDoc = await getDoc(doc(db, "bars", barId))
        const barData = barDoc.data()
        const barConfig = barData?.emailConfig

        const emailService = ReservationEmailService.getInstance()
        await emailService.sendReservationConfirmation(fullReservation, barConfig)
        console.log("✅ Email de confirmación enviado para reserva:", docRef.id)
      } catch (emailError) {
        console.error("⚠️ Error enviando email de confirmación:", emailError)
        // No lanzar error para no interrumpir la creación de la reserva
      }

      return docRef.id
    } catch (err: any) {
      console.error("Error creating reservation:", err)
      throw err
    }
  }

  const getReservationsByStatus = (status: Reservation['status']) => {
    return reservations.filter(reservation => reservation.status === status)
  }

  const getReservationsByDateRange = (startDate: Date, endDate: Date) => {
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate)
      return reservationDate >= startDate && reservationDate <= endDate
    })
  }

  const getReservationsByDate = (date: Date) => {
    const targetDate = date.toISOString().split('T')[0]
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate).toISOString().split('T')[0]
      return reservationDate === targetDate
    })
  }

  return {
    reservations,
    loading,
    error,
    createReservation,
    updateReservation,
    updateReservationStatus,
    deleteReservation,
    getReservationsByStatus,
    getReservationsByDateRange,
    getReservationsByDate
  }
}