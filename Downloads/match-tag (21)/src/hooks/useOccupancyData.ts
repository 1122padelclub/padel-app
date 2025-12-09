"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Reservation, Table } from "@/src/types"

interface HourlyOccupancy {
  time: string
  totalTables: number
  occupiedTables: number
  availableTables: number
  totalCapacity: number
  occupiedCapacity: number
  availableCapacity: number
  occupancyRate: number
  reservations: Reservation[]
}

export function useOccupancyData(barId: string) {
  const [tables, setTables] = useState<Table[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar mesas
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

  // Cargar reservas específicamente para ocupación
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
        
        // Manejar tanto reservationDate (legacy) como startAt (nuevo)
        let reservationDate: Date
        let reservationTime: string
        
        if (data.startAt) {
          // Nuevo formato con startAt
          const startAt = data.startAt?.toDate?.() || new Date(data.startAt)
          reservationDate = new Date(startAt)
          reservationDate.setHours(0, 0, 0, 0) // Solo la fecha
          reservationTime = startAt.toTimeString().slice(0, 5) // HH:MM
        } else if (data.reservationDate) {
          // Formato legacy con reservationDate
          reservationDate = data.reservationDate?.toDate?.() || new Date(data.reservationDate)
          reservationTime = data.reservationTime || ""
        } else {
          // Si no hay ni startAt ni reservationDate, usar createdAt como fallback
          const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt)
          reservationDate = new Date(createdAt)
          reservationDate.setHours(0, 0, 0, 0)
          reservationTime = "12:00" // Hora por defecto
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
        status: r.status,
        startAt: r.startAt
      })))
      
      // Log de datos raw de Firebase para debugging
      console.log("Raw Firebase data sample:", snapshot.docs.slice(0, 2).map(doc => ({
        id: doc.id,
        data: doc.data()
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

  // Función para calcular ocupación por hora
  const calculateHourlyOccupancy = useCallback((date: string, time: string): HourlyOccupancy => {
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

    // Crear fecha correctamente para evitar problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day) // month - 1 porque Date usa 0-indexed months
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
        
        // Crear fechas de comparación solo con año, mes y día
        const resDateOnly = new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate())
        const targetDateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
        
        // Verificar que sea el mismo día
        if (resDateOnly.getTime() !== targetDateOnly.getTime()) return false

        const reservationTime = reservation.reservationTime || (reservation as any).time
        if (!reservationTime) return false

        const [resHours, resMinutes] = reservationTime.split(':').map(Number)
        if (isNaN(resHours) || isNaN(resMinutes)) return false

        const resStart = new Date(resDateOnly)
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

    // Debug detallado de comparación de fechas
    console.log("=== DATE COMPARISON DEBUG ===")
    console.log("Target date:", date)
    console.log("DateObj:", dateObj)
    console.log("DateObj string:", dateObj.toDateString())
    
    const filteredReservations = reservations.filter(r => {
      if (!r?.reservationDate) return false
      const resDate = new Date(r.reservationDate)
      
      // Crear fechas de comparación solo con año, mes y día
      const resDateOnly = new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate())
      const targetDateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
      
      console.log(`Reservation ${r.customerName}:`, {
        originalDate: r.reservationDate,
        resDate: resDate,
        resDateOnly: resDateOnly,
        targetDateOnly: targetDateOnly,
        resDateOnlyTime: resDateOnly.getTime(),
        targetDateOnlyTime: targetDateOnly.getTime(),
        match: resDateOnly.getTime() === targetDateOnly.getTime()
      })
      
      return resDateOnly.getTime() === targetDateOnly.getTime()
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
      allReservationsForDate: filteredReservations.map(r => ({
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
