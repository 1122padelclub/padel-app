"use client"

import { useState, useEffect } from "react"
import { ref, push, onValue, update, serverTimestamp } from "@/src/services/firebaseExtras"
import { getRealtimeDbInstance } from "@/lib/firebase"

export interface WaiterCall {
  id: string
  barId: string
  tableId: string
  tableNumber: number
  timestamp: number
  createdAt: number // Add createdAt field for compatibility
  status: "pending" | "attending" | "resolved"
  message?: string
}

export function useWaiterCalls(barId: string) {
  const [calls, setCalls] = useState<WaiterCall[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!barId) return

    const database = getRealtimeDbInstance()
    if (!database) {
      setLoading(false)
      return
    }

    const callsRef = ref(database, `bars/${barId}/waiterCalls`)

    const unsubscribe = onValue(callsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const callsList = Object.entries(data).map(([id, call]: [string, any]) => {
          // Convertir timestamp a número si es necesario
          let timestamp = call.timestamp || call.createdAt || Date.now()
          if (typeof timestamp === 'object' && timestamp !== null) {
            // Si es un objeto serverTimestamp, usar la fecha actual
            timestamp = Date.now()
          }
          
          return {
            id,
            ...call,
            createdAt: timestamp,
            timestamp: timestamp,
          }
        })
        // Ordenar por timestamp descendente (más recientes primero)
        callsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        setCalls(callsList)
      } else {
        setCalls([])
      }
      setLoading(false)
    }, (error) => {
      console.error("Error loading waiter calls:", error)
      setCalls([])
      setLoading(false)
    })

    return () => unsubscribe()
  }, [barId])

  const createWaiterCall = async (tableId: string, tableNumber: number, message?: string) => {
    if (!barId) throw new Error("Bar ID is required")

    const database = getRealtimeDbInstance()
    if (!database) throw new Error("Database not available")

    const callsRef = ref(database, `bars/${barId}/waiterCalls`)

    const newCall = {
      barId,
      tableId,
      tableNumber,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(), // Add createdAt field
      status: "pending",
      message: message || `Mesa ${tableNumber} solicita atención`,
    }

    await push(callsRef, newCall)
  }

  const updateCallStatus = async (callId: string, status: "pending" | "attending" | "resolved") => {
    if (!barId) throw new Error("Bar ID is required")

    const database = getRealtimeDbInstance()
    if (!database) throw new Error("Database not available")

    const callRef = ref(database, `bars/${barId}/waiterCalls/${callId}`)
    await update(callRef, { status })
  }

  const getPendingCallsCount = () => {
    return calls.filter((call) => call.status === "pending").length
  }

  const getAttendingCallsCount = () => {
    return calls.filter((call) => call.status === "attending").length
  }

  return {
    calls,
    loading,
    createWaiterCall,
    updateCallStatus,
    getPendingCallsCount,
    getAttendingCallsCount,
  }
}
