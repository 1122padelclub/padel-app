"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Reservation, Table } from "@/src/types"

interface TableAvailability {
  tableId: string
  tableNumber: number | string
  capacity: number
  isAvailable: boolean
  conflictingReservation?: Reservation
}

interface ReservationSlot {
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // minutes
  partySize: number
}

export function useTableAvailability(barId: string) {
  const [tables, setTables] = useState<Table[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar mesas
  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    const tablesRef = collection(db, "tables")
    const tablesQuery = query(
      tablesRef, 
      where("barId", "==", barId),
      where("isActive", "==", true)
    )

    const unsubscribeTables = onSnapshot(
      tablesQuery,
      (snapshot) => {
        const tablesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
        })) as Table[]
        
        // Ordenar por número de mesa manualmente
        const sortedTables = tablesData.sort((a, b) => {
          const numA = typeof a.number === 'string' ? parseInt(a.number) || 0 : a.number || 0
          const numB = typeof b.number === 'string' ? parseInt(b.number) || 0 : b.number || 0
          return numA - numB
        })
        
        console.log("Tables loaded for occupancy:", sortedTables.length, "tables")
        setTables(sortedTables)
      },
      (err) => {
        console.error("Error loading tables:", err)
        setError(err.message)
      }
    )

    return () => unsubscribeTables()
  }, [barId])

  // Cargar reservas
  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    const reservationsRef = collection(db, "reservations")
    const reservationsQuery = query(
      reservationsRef,
      where("barId", "==", barId)
    )

    const unsubscribeReservations = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        const reservationsData = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            reservationDate: data.reservationDate?.toDate?.() || new Date(data.reservationDate),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
          }
        }) as Reservation[]
        
        // Ordenar por fecha de reserva manualmente
        const sortedReservations = reservationsData.sort((a, b) => {
          const dateA = new Date(a.reservationDate).getTime()
          const dateB = new Date(b.reservationDate).getTime()
          return dateA - dateB
        })
        
        console.log("Reservations loaded for occupancy:", sortedReservations.length, "reservations")
        setReservations(sortedReservations)
        setLoading(false)
      },
      (err) => {
        console.error("Error loading reservations:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribeReservations()
  }, [barId])

  // Calcular disponibilidad de mesas para un slot específico
  const getTableAvailability = (slot: ReservationSlot): TableAvailability[] => {
    const slotStartTime = new Date(`${slot.date}T${slot.time}:00`)
    const slotEndTime = new Date(slotStartTime.getTime() + slot.duration * 60000)

    return tables.map(table => {
      // Buscar reservas conflictivas para esta mesa
      const conflictingReservation = reservations.find(reservation => {
        if (reservation.tableNumber === table.number || reservation.tableId === table.id) {
          const reservationStart = new Date(reservation.reservationDate)
          const reservationTime = reservation.reservationTime || reservation.time
          
          if (reservationTime) {
            const [hours, minutes] = reservationTime.split(':').map(Number)
            reservationStart.setHours(hours, minutes, 0, 0)
            
            // Asumir duración de 2 horas si no está especificada
            const reservationDuration = 120 // minutos
            const reservationEnd = new Date(reservationStart.getTime() + reservationDuration * 60000)
            
            // Verificar si hay conflicto de horarios
            return (slotStartTime < reservationEnd && slotEndTime > reservationStart)
          }
        }
        return false
      })

      return {
        tableId: table.id,
        tableNumber: table.number,
        capacity: table.capacity || 4,
        isAvailable: !conflictingReservation && table.capacity >= slot.partySize,
        conflictingReservation
      }
    })
  }

  // Encontrar la mejor mesa disponible para un slot
  const findBestAvailableTable = (slot: ReservationSlot): Table | null => {
    const availableTables = getTableAvailability(slot)
      .filter(table => table.isAvailable)
      .sort((a, b) => {
        // Priorizar mesas con capacidad más cercana al tamaño del grupo
        const aDiff = Math.abs(a.capacity - slot.partySize)
        const bDiff = Math.abs(b.capacity - slot.partySize)
        return aDiff - bDiff
      })

    if (availableTables.length === 0) return null

    const bestTable = availableTables[0]
    return tables.find(table => table.id === bestTable.tableId) || null
  }

  // Verificar si hay mesas disponibles para un slot
  const isSlotAvailable = (slot: ReservationSlot): boolean => {
    return getTableAvailability(slot).some(table => table.isAvailable)
  }

  // Obtener tasa de ocupación por día y hora
  const getOccupancyRate = (date: string, time?: string) => {
    try {
      if (!date || !tables || !reservations) {
        return {
          date: date || '',
          time: time || '',
          totalCapacity: 0,
          occupiedCapacity: 0,
          availableCapacity: 0,
          occupancyRate: 0,
          reservationsCount: 0,
          tablesAvailable: 0
        }
      }

      const dateObj = new Date(date)
      
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date provided to getOccupancyRate:', date)
        return {
          date,
          time: time || '',
          totalCapacity: 0,
          occupiedCapacity: 0,
          availableCapacity: 0,
          occupancyRate: 0,
          reservationsCount: 0,
          tablesAvailable: 0
        }
      }
      
      if (time) {
        // Ocupación para una hora específica
        const [hours, minutes] = time.split(':').map(Number)
        
        if (isNaN(hours) || isNaN(minutes)) {
          console.error('Invalid time format provided to getOccupancyRate:', time)
          return {
            date,
            time,
            totalCapacity: 0,
            occupiedCapacity: 0,
            availableCapacity: 0,
            occupancyRate: 0,
            reservationsCount: 0,
            tablesAvailable: 0
          }
        }

        const targetTime = new Date(dateObj)
        targetTime.setHours(hours, minutes, 0, 0)
        
        const reservationsAtTime = reservations.filter(reservation => {
          if (!reservation || !reservation.reservationDate) return false
          
          try {
            const reservationDate = new Date(reservation.reservationDate)
            const reservationTime = reservation.reservationTime || reservation.time
            
            if (reservationTime) {
              const [resHours, resMinutes] = reservationTime.split(':').map(Number)
              if (isNaN(resHours) || isNaN(resMinutes)) return false
              
              reservationDate.setHours(resHours, resMinutes, 0, 0)
              
              // Considerar que una reserva ocupa la mesa por 2 horas
              const reservationEnd = new Date(reservationDate.getTime() + 120 * 60000)
              
              return targetTime >= reservationDate && targetTime < reservationEnd
            }
            return false
          } catch (error) {
            console.error('Error processing reservation in getOccupancyRate:', error)
            return false
          }
        })

        const totalCapacity = tables.reduce((sum, table) => sum + (table?.capacity || 4), 0)
        const occupiedCapacity = reservationsAtTime.reduce((sum, reservation) => sum + (reservation?.partySize || 0), 0)
        
        return {
          date,
          time,
          totalCapacity,
          occupiedCapacity,
          availableCapacity: Math.max(0, totalCapacity - occupiedCapacity),
          occupancyRate: totalCapacity > 0 ? (occupiedCapacity / totalCapacity) * 100 : 0,
          reservationsCount: reservationsAtTime.length,
          tablesAvailable: Math.max(0, tables.length - reservationsAtTime.length)
        }
      } else {
        // Ocupación para todo el día
        const reservationsOnDate = reservations.filter(reservation => {
          if (!reservation || !reservation.reservationDate) return false
          
          try {
            const reservationDate = new Date(reservation.reservationDate)
            return reservationDate.toDateString() === dateObj.toDateString()
          } catch (error) {
            console.error('Error processing reservation date in getOccupancyRate:', error)
            return false
          }
        })

        const totalCapacity = tables.reduce((sum, table) => sum + (table?.capacity || 4), 0)
        const occupiedCapacity = reservationsOnDate.reduce((sum, reservation) => sum + (reservation?.partySize || 0), 0)
        
        return {
          date,
          totalCapacity,
          occupiedCapacity,
          availableCapacity: Math.max(0, totalCapacity - occupiedCapacity),
          occupancyRate: totalCapacity > 0 ? (occupiedCapacity / totalCapacity) * 100 : 0,
          reservationsCount: reservationsOnDate.length
        }
      }
    } catch (error) {
      console.error('Error in getOccupancyRate:', error)
      return {
        date: date || '',
        time: time || '',
        totalCapacity: 0,
        occupiedCapacity: 0,
        availableCapacity: 0,
        occupancyRate: 0,
        reservationsCount: 0,
        tablesAvailable: 0
      }
    }
  }

  return {
    tables,
    reservations,
    loading,
    error,
    getTableAvailability,
    findBestAvailableTable,
    isSlotAvailable,
    getOccupancyRate
  }
}