"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ReportSchedule, ReportType } from "@/src/types"

export function useReportSchedules(barId: string) {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const schedulesRef = collection(db, "bars", barId, "reportSchedules")
    const q = query(
      schedulesRef,
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const schedulesData = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              barId: data.barId || barId,
              name: data.name || "",
              description: data.description || "",
              frequency: data.frequency || "daily",
              dataPeriod: data.dataPeriod || "day",
              time: data.time || "09:00",
              dayOfWeek: data.dayOfWeek,
              dayOfMonth: data.dayOfMonth,
              recipients: data.recipients || [],
              reportTypes: data.reportTypes || [],
              isActive: data.isActive ?? true,
              lastSent: data.lastSent?.toDate?.() || null,
              nextScheduled: data.nextScheduled?.toDate?.() || null,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date()
            } as ReportSchedule
          })

          setSchedules(schedulesData)
          setError(null)
        } catch (err: any) {
          console.error("Error processing report schedules:", err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error("Error loading report schedules:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  const createSchedule = async (scheduleData: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const nextScheduled = calculateNextScheduled(scheduleData)
      
      // Filtrar valores undefined para evitar el error de Firebase
      const cleanData = Object.entries(scheduleData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {} as any)
      
      const docRef = await addDoc(collection(db, "bars", barId, "reportSchedules"), {
        ...cleanData,
        nextScheduled: nextScheduled,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return docRef.id
    } catch (err: any) {
      console.error("Error creating report schedule:", err)
      throw err
    }
  }

  const updateSchedule = async (scheduleId: string, updates: Partial<ReportSchedule>) => {
    try {
      const scheduleRef = doc(db, "bars", barId, "reportSchedules", scheduleId)
      
      // Filtrar valores undefined para evitar el error de Firebase
      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {} as any)
      
      const updateData = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      }

      // Recalcular nextScheduled si cambió la frecuencia o tiempo
      if (updates.frequency || updates.time || updates.dayOfWeek !== undefined || updates.dayOfMonth !== undefined) {
        const currentSchedule = schedules.find(s => s.id === scheduleId)
        if (currentSchedule) {
          const updatedSchedule = { ...currentSchedule, ...updates }
          updateData.nextScheduled = calculateNextScheduled(updatedSchedule)
        }
      }

      await updateDoc(scheduleRef, updateData)
    } catch (err: any) {
      console.error("Error updating report schedule:", err)
      throw err
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const scheduleRef = doc(db, "bars", barId, "reportSchedules", scheduleId)
      await deleteDoc(scheduleRef)
    } catch (err: any) {
      console.error("Error deleting report schedule:", err)
      throw err
    }
  }

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      await updateSchedule(scheduleId, { isActive })
    } catch (err: any) {
      console.error("Error toggling report schedule:", err)
      throw err
    }
  }

  const getActiveSchedules = () => {
    return schedules.filter(schedule => schedule.isActive)
  }

  const getSchedulesByFrequency = (frequency: ReportSchedule['frequency']) => {
    return schedules.filter(schedule => schedule.frequency === frequency)
  }

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    getActiveSchedules,
    getSchedulesByFrequency
  }
}

// Función auxiliar para calcular la próxima fecha programada
function calculateNextScheduled(schedule: Partial<ReportSchedule>): Date {
  const now = new Date()
  const [hours, minutes] = (schedule.time || "09:00").split(":").map(Number)
  
  let nextDate = new Date(now)
  nextDate.setUTCHours(hours, minutes, 0, 0)

  // Si ya pasó la hora de hoy, programar para mañana
  if (nextDate <= now) {
    nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  }

  switch (schedule.frequency) {
    case "daily":
      return nextDate

    case "weekly":
      const targetDay = schedule.dayOfWeek || 0 // Domingo por defecto
      const currentDay = nextDate.getUTCDay()
      const daysUntilTarget = (targetDay - currentDay + 7) % 7
      nextDate.setUTCDate(nextDate.getUTCDate() + daysUntilTarget)
      return nextDate

    case "monthly":
      const targetDayOfMonth = schedule.dayOfMonth || 1
      nextDate.setUTCDate(targetDayOfMonth)
      
      // Si ya pasó este mes, programar para el próximo mes
      if (nextDate <= now) {
        nextDate.setUTCMonth(nextDate.getUTCMonth() + 1)
      }
      return nextDate

    default:
      return nextDate
  }
}
