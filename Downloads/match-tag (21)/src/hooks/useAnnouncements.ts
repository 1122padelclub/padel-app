"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Announcement } from "@/src/types"

export function useAnnouncements(barId?: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const announcementsRef = collection(db, "bars", barId, "announcements")
    const q = query(
      announcementsRef,
      orderBy("order", "asc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const announcementsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            startDate: doc.data().startDate?.toDate?.() || null,
            endDate: doc.data().endDate?.toDate?.() || null
          })) as Announcement[]

          // Ordenar por order (asc) y luego por createdAt (desc) en el cliente
          const sortedAnnouncements = announcementsData.sort((a, b) => {
            if (a.order !== b.order) {
              return a.order - b.order
            }
            return b.createdAt.getTime() - a.createdAt.getTime()
          })

          setAnnouncements(sortedAnnouncements)
          setError(null)
        } catch (err: any) {
          console.error("Error processing announcements:", err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error("Error loading announcements:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const docRef = await addDoc(collection(db, "bars", barId, "announcements"), {
        ...announcementData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return docRef.id
    } catch (err: any) {
      console.error("Error creating announcement:", err)
      throw err
    }
  }

  const updateAnnouncement = async (announcementId: string, updates: Partial<Announcement>) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const announcementRef = doc(db, "bars", barId, "announcements", announcementId)
      await updateDoc(announcementRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (err: any) {
      console.error("Error updating announcement:", err)
      throw err
    }
  }

  const deleteAnnouncement = async (announcementId: string) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const announcementRef = doc(db, "bars", barId, "announcements", announcementId)
      await deleteDoc(announcementRef)
    } catch (err: any) {
      console.error("Error deleting announcement:", err)
      throw err
    }
  }

  const toggleAnnouncement = async (announcementId: string, isActive: boolean) => {
    try {
      await updateAnnouncement(announcementId, { isActive })
    } catch (err: any) {
      console.error("Error toggling announcement:", err)
      throw err
    }
  }

  const reorderAnnouncements = async (newOrder: { id: string; order: number }[]) => {
    try {
      const updatePromises = newOrder.map(({ id, order }) =>
        updateAnnouncement(id, { order })
      )
      await Promise.all(updatePromises)
    } catch (err: any) {
      console.error("Error reordering announcements:", err)
      throw err
    }
  }

  const getActiveAnnouncements = (showOnMenu: boolean = true, showOnTable: boolean = true) => {
    const now = new Date()
    return announcements.filter(announcement => {
      if (!announcement.isActive) return false
      
      // Verificar fechas de inicio y fin
      if (announcement.startDate && new Date(announcement.startDate) > now) return false
      if (announcement.endDate && new Date(announcement.endDate) < now) return false
      
      // Verificar dónde debe mostrarse
      if (showOnMenu && !announcement.showOnMenu) return false
      if (showOnTable && !announcement.showOnTable) return false
      
      return true
    }).sort((a, b) => a.order - b.order)
  }

  return {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncement,
    reorderAnnouncements,
    getActiveAnnouncements
  }
}