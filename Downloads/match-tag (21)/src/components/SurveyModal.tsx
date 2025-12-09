"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCRM } from "@/src/hooks/useCRM"
import { Star, Send, X } from "lucide-react"

interface SurveyModalProps {
  isOpen: boolean
  onClose: () => void
  barId: string
  orderId?: string
  tableId?: string
}

export function SurveyModal({ isOpen, onClose, barId, orderId, tableId }: SurveyModalProps) {
  const { createReview } = useCRM(barId)
  const [stars, setStars] = useState(0)
  const [hoveredStars, setHoveredStars] = useState(0)
  const [categories, setCategories] = useState({
    food: 0,
    service: 0,
    ambiance: 0,
    value: 0,
  })
  const [comment, setComment] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarClick = (rating: number) => {
    setStars(rating)
  }

  const handleCategoryRating = (category: keyof typeof categories, rating: number) => {
    setCategories((prev) => ({ ...prev, [category]: rating }))
  }

  const handleSubmit = async () => {
    if (stars === 0) return

    setIsSubmitting(true)

    try {
      await createReview({
        stars,
        comment: comment.trim() || undefined,
        categories,
        isAnonymous,
        customerName: isAnonymous ? undefined : customerName.trim() || undefined,
        isPublic,
        orderId,
        tableId,
      })

      onClose()
      // Reset form
      setStars(0)
      setCategories({ food: 0, service: 0, ambiance: 0, value: 0 })
      setComment("")
      setCustomerName("")
      setIsAnonymous(false)
      setIsPublic(true)
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({
    value,
    onChange,
    onHover,
    size = "w-8 h-8",
  }: {
    value: number
    onChange: (rating: number) => void
    onHover?: (rating: number) => void
    size?: string
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          onMouseEnter={() => onHover?.(rating)}
          onMouseLeave={() => onHover?.(0)}
          className={`${size} transition-colors`}
        >
          <Star
            className={`w-full h-full ${
              rating <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      ))}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            ¿Cómo fue tu experiencia?
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Rating */}
          <div className="text-center space-y-3">
            <Label className="text-base font-medium">Calificación General</Label>
            <StarRating value={hoveredStars || stars} onChange={handleStarClick} onHover={setHoveredStars} />
            <p className="text-sm text-muted-foreground">
              {stars === 0 && "Selecciona una calificación"}
              {stars === 1 && "Muy malo"}
              {stars === 2 && "Malo"}
              {stars === 3 && "Regular"}
              {stars === 4 && "Bueno"}
              {stars === 5 && "Excelente"}
            </p>
          </div>

          {/* Category Ratings */}
          {stars > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Califica por categorías</Label>

              {Object.entries({
                food: "Comida",
                service: "Servicio",
                ambiance: "Ambiente",
                value: "Relación calidad-precio",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <StarRating
                    value={categories[key as keyof typeof categories]}
                    onChange={(rating) => handleCategoryRating(key as keyof typeof categories, rating)}
                    size="w-5 h-5"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Comment */}
          {stars > 0 && (
            <div className="space-y-2">
              <Label htmlFor="comment">Comentario (opcional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos más sobre tu experiencia..."
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Customer Name */}
          {stars > 0 && !isAnonymous && (
            <div className="space-y-2">
              <Label htmlFor="customerName">Tu nombre (opcional)</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
          )}

          {/* Privacy Options */}
          {stars > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="anonymous">Reseña anónima</Label>
                <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="public">Hacer pública mi reseña</Label>
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button onClick={handleSubmit} disabled={stars === 0 || isSubmitting} className="w-full">
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Reseña
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
