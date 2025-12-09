"use client"

import { useState, useEffect } from "react"
import { useAnnouncements } from "./useAnnouncements"

interface UseAnnouncementDisplayProps {
  barId: string
  showOnMenu?: boolean
  showOnTable?: boolean
}

export function useAnnouncementDisplay({ 
  barId, 
  showOnMenu = true, 
  showOnTable = true 
}: UseAnnouncementDisplayProps) {
  const { getActiveAnnouncements, loading } = useAnnouncements(barId)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [hasShownAnnouncement, setHasShownAnnouncement] = useState(false)

  const activeAnnouncements = getActiveAnnouncements(showOnMenu, showOnTable)

  useEffect(() => {
    // Solo mostrar anuncios si hay anuncios activos y no se ha mostrado uno en esta sesión
    if (activeAnnouncements.length > 0 && !hasShownAnnouncement && !loading) {
      setShowAnnouncement(true)
    }
  }, [activeAnnouncements.length, hasShownAnnouncement, loading])

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false)
    setHasShownAnnouncement(true)
  }

  const resetAnnouncementDisplay = () => {
    setHasShownAnnouncement(false)
    setShowAnnouncement(false)
  }

  return {
    announcements: activeAnnouncements,
    showAnnouncement,
    loading,
    handleCloseAnnouncement,
    resetAnnouncementDisplay
  }
}





