"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Announcement } from "@/src/types"

interface AnnouncementModalProps {
  announcements: Announcement[]
  isOpen: boolean
  onClose: () => void
}

export function AnnouncementModal({ announcements, isOpen, onClose }: AnnouncementModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset index when announcements change
  useEffect(() => {
    setCurrentIndex(0)
  }, [announcements])

  if (!isOpen || announcements.length === 0) return null

  const currentAnnouncement = announcements[currentIndex]
  const hasNext = currentIndex < announcements.length - 1
  const hasPrev = currentIndex > 0

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowLeft' && hasPrev) {
      handlePrev()
    } else if (e.key === 'ArrowRight' && hasNext) {
      handleNext()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl p-0 overflow-hidden rounded-2xl border-none bg-transparent shadow-none"
        aria-describedby="announcement-description"
      >
        <div className="relative w-full max-h-[90vh] bg-black rounded-2xl overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Navigation arrows */}
        {hasPrev && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {hasNext && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Content */}
        <div className="relative">
          {/* Image */}
          <div className="aspect-[4/3] w-full">
            <img
              src={currentAnnouncement.imageUrl}
              alt={currentAnnouncement.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-center text-white">
              <h2 className="text-2xl md:text-4xl font-bold uppercase mb-2">
                {currentAnnouncement.title}
              </h2>
              {currentAnnouncement.description && (
                <p className="text-sm md:text-lg opacity-90">
                  {currentAnnouncement.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        {announcements.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {announcements.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
        </div>
        
        {/* Descripción para accesibilidad */}
        <div id="announcement-description" className="sr-only">
          {currentAnnouncement?.description || 
           `Anuncio ${currentIndex + 1} de ${activeAnnouncements.length}: ${currentAnnouncement?.title || 'Sin título'}`}
        </div>
      </DialogContent>
    </Dialog>
  )
}
