"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore"
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

export function useTableAvailabilitySimple(barId: string) {
  const [tables, setTables] = useState<Table[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar mesas usando getDocs en lugar de onSnapshot para evitar problemas de índices
  const loadTables = useCallback(async () => {
    if (!barId) {
      setLoading(false)
      return
    }

    try {
      let tablesData: Table[] = []
      
      // Intentar cargar desde la colección principal primero
      try {
        const tablesRef = collection(db, "tables")
        const tablesQuery = query(tablesRef, where("barId", "==", barId))
        
        const snapshot = await getDocs(tablesQuery)
        tablesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
        })) as Table[]
        
        console.log("Tables loaded from main collection:", tablesData.length)
      } catch (err) {
        console.log("No tables in main collection, trying subcollection...")
      }
      
      // Si no hay mesas en la colección principal, intentar desde la subcolección
      if (tablesData.length === 0) {
        try {
          const tablesSubRef = collection(db, "bars", barId, "tables")
          const tablesSubQuery = query(tablesSubRef)
          
          const snapshot = await getDocs(tablesSubQuery)
          tablesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
          })) as Table[]
          
          console.log("Tables loaded from subcollection:", tablesData.length)
        } catch (err) {
          console.error("Error loading tables from subcollection:", err)
        }
      }
      
      // Filtrar solo mesas activas y ordenar por número
      const activeTables = tablesData
        .filter(table => table.isActive !== false)
        .sort((a, b) => {
          const numA = typeof a.number === 'string' ? parseInt(a.number) || 0 : a.number || 0
          const numB = typeof b.number === 'string' ? parseInt(b.number) || 0 : b.number || 0
          return numA - numB
        })
      
      console.log("Final tables loaded for occupancy:", activeTables.length, "tables")
      setTables(activeTables)
    } catch (err) {
      console.error("Error loading tables:", err)
      setError(err instanceof Error ? err.message : "Error loading tables")
    }
  }, [barId])

  // Cargar reservas usando getDocs
  const loadReservations = useCallback(async () => {
    if (!barId) {
      setLoading(false)
      return
    }

    try {
      const reservationsRef = collection(db, "bars", barId, "reservations")
      const reservationsQuery = query(reservationsRef)
      
      const snapshot = await getDocs(reservationsQuery)
      const reservationsData = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          reservationDate: data.reservationDate?.toDate?.() || new Date(data.reservationDate),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        }
      }) as Reservation[]
      
      // Ordenar por fecha de reserva
      const sortedReservations = reservationsData.sort((a, b) => {
        const dateA = new Date(a.reservationDate).getTime()
        const dateB = new Date(b.reservationDate).getTime()
        return dateA - dateB
      })
      
      console.log("Reservations loaded for occupancy:", sortedReservations.length, "reservations")
      console.log("Reservations details:", sortedReservations.map(r => ({
        id: r.id,
        customerName: r.customerName,
        reservationDate: r.reservationDate,
        reservationTime: r.reservationTime,
        partySize: r.partySize,
        status: r.status
      })))
      setReservations(sortedReservations)
    } catch (err) {
      console.error("Error loading reservations:", err)
      setError(err instanceof Error ? err.message : "Error loading reservations")
    }
  }, [barId])

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      await Promise.all([
        loadTables(),
        loadReservations()
      ])
      
      setLoading(false)
    }

    loadData()
  }, [loadTables, loadReservations])

  // Función para calcular ocupación por hora (igual que la original)
  const calculateHourlyOccupancy = useCallback((date: string, time: string) => {
    if (!tables || !reservations) {
      return {
        time,
        totalTables: 0,
        occupiedTables: 0,
        availableTables: 0,
        totalCapacity: 0,
        occupiedCapacity: 0,
        availableCapacity: 0,
        occupancyRate: 0,
        reservations: []
      }
    }

    const dateObj = new Date(date)
    const [hours, minutes] = time.split(':').map(Number)
    const targetTime = new Date(dateObj)
    targetTime.setHours(hours, minutes, 0, 0)

    // Filtrar reservas activas en este horario
    const activeReservations = reservations.filter(reservation => {
      if (!reservation?.reservationDate) return false

      // Incluir reservas que estén confirmadas, completadas o pendientes
      const validStatuses = ['confirmed', 'completed', 'pending', 'active']
      if (reservation.status && !validStatuses.includes(reservation.status)) {
        return false
      }

      try {
        const resDate = new Date(reservation.reservationDate)
        // Verificar que sea el mismo día
        if (resDate.toDateString() !== dateObj.toDateString()) return false

        const reservationTime = reservation.reservationTime || (reservation as any).time
        if (!reservationTime) return false

        const [resHours, resMinutes] = reservationTime.split(':').map(Number)
        if (isNaN(resHours) || isNaN(resMinutes)) return false

        const resStart = new Date(resDate)
        resStart.setHours(resHours, resMinutes, 0, 0)

        // Duración estándar de 2 horas
        const resEnd = new Date(resStart.getTime() + 120 * 60000)

        // Verificar si la reserva está activa en este horario
        return targetTime >= resStart && targetTime < resEnd
      } catch (error) {
        console.log("Error processing reservation:", error, reservation)
        return false
      }
    })

    console.log(`Calculating occupancy for ${time} on ${date}:`, {
      totalReservations: reservations.length,
      activeReservations: activeReservations.length,
      activeReservationsDetails: activeReservations.map(r => ({
        time: r.reservationTime,
        partySize: r.partySize,
        customerName: r.customerName,
        status: r.status
      })),
      allReservationsForDate: reservations.filter(r => {
        if (!r?.reservationDate) return false
        const resDate = new Date(r.reservationDate)
        return resDate.toDateString() === dateObj.toDateString()
      }).map(r => ({
        time: r.reservationTime,
        partySize: r.partySize,
        customerName: r.customerName,
        status: r.status
      }))
    })

    const totalTables = tables.length
    const totalCapacity = tables.reduce((sum, table) => sum + (table?.capacity || 4), 0)
    const occupiedCapacity = activeReservations.reduce((sum, res) => sum + (res?.partySize || 0), 0)
    const availableCapacity = totalCapacity - occupiedCapacity
    
    // Calcular mesas ocupadas basado en capacidad, no en número de reservas
    // Una mesa está ocupada si su capacidad está siendo utilizada
    let occupiedTables = 0
    let remainingCapacity = occupiedCapacity
    
    // Ordenar mesas por capacidad (de menor a mayor) para asignación óptima
    const sortedTables = [...tables].sort((a, b) => (a?.capacity || 4) - (b?.capacity || 4))
    
    for (const table of sortedTables) {
      const tableCapacity = table?.capacity || 4
      if (remainingCapacity > 0) {
        occupiedTables++
        remainingCapacity = Math.max(0, remainingCapacity - tableCapacity)
      }
    }
    
    const availableTables = totalTables - occupiedTables
    const occupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0

    return {
      time,
      totalTables,
      occupiedTables,
      availableTables,
      totalCapacity,
      occupiedCapacity,
      availableCapacity,
      occupancyRate,
      reservations: activeReservations
    }
  }, [tables, reservations])

  return {
    tables,
    reservations,
    loading,
    error,
    calculateHourlyOccupancy,
    refetch: async () => {
      await Promise.all([loadTables(), loadReservations()])
    }
  }
}
