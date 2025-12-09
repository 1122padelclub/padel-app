"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAnnouncements } from "@/src/hooks/useAnnouncements"
import type { Announcement } from "@/src/types/announcement"
import { X, ExternalLink, ShoppingCart, Calendar } from "lucide-react"

interface PromoBannerProps {
  barId: string
  tableId?: string
  customerId?: string
  onAction?: (action: string, announcement: Announcement) => void
}

export function PromoBanner({ barId, tableId, customerId, onAction }: PromoBannerProps) {
  const { activeAnnouncements, trackImpression, trackClick } = useAnnouncements(barId)
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([])
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0)

  // Filter announcements for display
  const displayAnnouncements = activeAnnouncements
    .filter((announcement) => {
      // Filter out dismissed announcements
      if (dismissedAnnouncements.includes(announcement.id)) return false

      // Filter by display type (only show banner and toast types here)
      if (!["banner", "toast"].includes(announcement.display)) return false

      // Filter by target audience if specified
      if (announcement.targetAudience) {
        const { tableIds, customerSegments, tags } = announcement.targetAudience

        if (tableIds && tableId && !tableIds.includes(tableId)) return false
        // Additional filtering logic for customer segments and tags would go here
      }

      return true
    })
    .sort((a, b) => b.priority - a.priority)

  const currentAnnouncement = displayAnnouncements[currentAnnouncementIndex]

  // Track impressions when announcements are shown
  useEffect(() => {
    if (currentAnnouncement) {
      trackImpression(currentAnnouncement.id)
    }
  }, [currentAnnouncement, trackImpression])

  // Auto-rotate announcements every 10 seconds
  useEffect(() => {
    if (displayAnnouncements.length > 1) {
      const interval = setInterval(() => {
        setCurrentAnnouncementIndex((prev) => (prev + 1) % displayAnnouncements.length)
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [displayAnnouncements.length])

  const handleDismiss = (announcementId: string) => {
    setDismissedAnnouncements((prev) => [...prev, announcementId])
  }

  const handleClick = (announcement: Announcement) => {
    trackClick(announcement.id)

    if (announcement.actions) {
      const { buttonAction, buttonUrl } = announcement.actions

      switch (buttonAction) {
        case "redirect":
          if (buttonUrl) window.open(buttonUrl, "_blank")
          break
        case "order":
          onAction?.("order", announcement)
          break
        case "reservation":
          onAction?.("reservation", announcement)
          break
      }
    }
  }

  if (!currentAnnouncement) return null

  const styling = currentAnnouncement.styling || {}
  const isToast = currentAnnouncement.display === "toast"

  return (
    <div
      className={`
        ${isToast ? "fixed top-4 right-4 z-50 max-w-sm" : "w-full"}
        animate-in slide-in-from-top-2 duration-300
      `}
    >
      <Card
        className="relative overflow-hidden border-2"
        style={{
          backgroundColor: styling.backgroundColor,
          borderColor: styling.borderColor,
          color: styling.textColor,
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              {/* Header with icon and type */}
              <div className="flex items-center gap-2">
                {styling.icon && <span className="text-lg">{styling.icon}</span>}
                <Badge variant="secondary" className="text-xs">
                  {currentAnnouncement.type.toUpperCase()}
                </Badge>
                {displayAnnouncements.length > 1 && (
                  <span className="text-xs opacity-75">
                    {currentAnnouncementIndex + 1} de {displayAnnouncements.length}
                  </span>
                )}
              </div>

              {/* Title and Message */}
              <div>
                <h3 className="font-semibold text-sm md:text-base">{currentAnnouncement.title}</h3>
                <p className="text-sm opacity-90 mt-1">{currentAnnouncement.message}</p>
              </div>

              {/* Action Button */}
              {currentAnnouncement.actions?.buttonText && (
                <Button
                  onClick={() => handleClick(currentAnnouncement)}
                  size="sm"
                  variant="secondary"
                  className="mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {currentAnnouncement.actions.buttonAction === "redirect" && <ExternalLink className="w-4 h-4 mr-2" />}
                  {currentAnnouncement.actions.buttonAction === "order" && <ShoppingCart className="w-4 h-4 mr-2" />}
                  {currentAnnouncement.actions.buttonAction === "reservation" && <Calendar className="w-4 h-4 mr-2" />}
                  {currentAnnouncement.actions.buttonText}
                </Button>
              )}
            </div>

            {/* Dismiss Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(currentAnnouncement.id)}
              className="text-white/70 hover:text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress indicator for multiple announcements */}
          {displayAnnouncements.length > 1 && (
            <div className="flex gap-1 mt-3">
              {displayAnnouncements.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    index === currentAnnouncementIndex ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
