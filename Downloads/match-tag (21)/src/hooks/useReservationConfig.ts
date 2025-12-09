"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { ReservationConfig } from "@/src/types"

const DEFAULT_CONFIG: Omit<ReservationConfig, "barId" | "createdAt" | "updatedAt"> = {
  openingTime: "09:00",
  closingTime: "23:00",
  slotDuration: 30,
  maxPartySize: 8,
  minPartySize: 1,
  advanceBookingDays: 30,
  advanceBookingHours: 2,
  isActive: true,
  specialHours: {},
  reservationDurationMinutes: 120, // 2 horas por defecto
  businessHours: {
    monday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
    tuesday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
    wednesday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
    thursday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
    friday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
    saturday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
    sunday: { isOpen: false, openingTime: "09:00", closingTime: "23:00" }
  }
}

export function useReservationConfig(barId: string) {
  const [config, setConfig] = useState<ReservationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    console.log("⚙️ Cargando configuración de reservas para barId:", barId)
    setLoading(true)

    const configRef = doc(db, "bars", barId, "reservationConfig", "config")

    const unsubscribe = onSnapshot(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        setConfig({
          barId,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ReservationConfig)
      } else {
        // Crear configuración por defecto si no existe
        const defaultConfig: ReservationConfig = {
          barId,
          ...DEFAULT_CONFIG,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setConfig(defaultConfig)
      }
      
      setLoading(false)
      setError(null)
    }, (err) => {
      console.error("❌ Error cargando configuración de reservas:", err)
      setError(err.message || "Error desconocido al cargar configuración")
      setLoading(false)
    })

    return () => unsubscribe()
  }, [barId])

  const updateConfig = async (updates: Partial<ReservationConfig>) => {
    try {
      if (!config) {
        console.error("❌ No hay configuración cargada para actualizar")
        return
      }

      const configRef = doc(db, "bars", barId, "reservationConfig", "config")
      
      // Crear una copia profunda de la configuración actual
      const updatedConfig = {
        ...config,
        ...updates,
        updatedAt: new Date(),
      }

      console.log("🔄 Actualizando configuración de reservas:", {
        barId,
        updates,
        updatedConfig
      })

      await setDoc(configRef, updatedConfig, { merge: true })
      
      // Actualizar el estado local inmediatamente para feedback visual
      setConfig(updatedConfig)
      
      console.log("✅ Configuración de reservas actualizada exitosamente")
    } catch (err: any) {
      console.error("❌ Error actualizando configuración de reservas:", err)
      throw new Error(err.message || "Error desconocido al actualizar configuración")
    }
  }

  const generateTimeSlots = (date: Date) => {
    if (!config) return []

    const slots: string[] = []
    const targetDate = new Date(date)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = dayNames[targetDate.getDay()]
    
    // Verificar si el bar está abierto este día
    const dayConfig = config.businessHours[dayOfWeek]
    if (!dayConfig || !dayConfig.isOpen) {
      return [] // No hay slots si el bar está cerrado
    }

    const openingTime = dayConfig.openingTime
    const closingTime = dayConfig.closingTime

    const [openHour, openMinute] = openingTime.split(':').map(Number)
    const [closeHour, closeMinute] = closingTime.split(':').map(Number)

    const startTime = new Date(targetDate)
    startTime.setHours(openHour, openMinute, 0, 0)

    const endTime = new Date(targetDate)
    endTime.setHours(closeHour, closeMinute, 0, 0)

    const currentTime = new Date()
    const minAdvanceTime = new Date(currentTime.getTime() + (config.advanceBookingHours * 60 * 60 * 1000))

    let currentSlot = new Date(startTime)
    while (currentSlot < endTime) {
      // Solo incluir slots que estén en el futuro y cumplan con la anticipación mínima
      if (currentSlot >= minAdvanceTime) {
        const timeString = currentSlot.toTimeString().slice(0, 5)
        slots.push(timeString)
      }
      
      currentSlot.setMinutes(currentSlot.getMinutes() + config.slotDuration)
    }

    return slots
  }

  const isDateAvailable = (date: Date) => {
    if (!config) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    const maxAdvanceDate = new Date(today)
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + config.advanceBookingDays)

    // Verificar que esté dentro del rango de fechas permitidas
    const withinDateRange = targetDate >= today && targetDate <= maxAdvanceDate
    if (!withinDateRange) return false

    // Verificar que el bar esté abierto ese día
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = dayNames[targetDate.getDay()]
    const dayConfig = config.businessHours[dayOfWeek]
    
    return dayConfig?.isOpen || false
  }

  return {
    config,
    loading,
    error,
    updateConfig,
    generateTimeSlots,
    isDateAvailable,
  }
}
