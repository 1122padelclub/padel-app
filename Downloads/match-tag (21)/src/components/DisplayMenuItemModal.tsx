"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Star, Zap, Leaf, Wheat, Heart } from "lucide-react"
import type { DisplayMenuItem, DisplayMenuConfig } from "@/src/types"

interface DisplayMenuItemModalProps {
  item: DisplayMenuItem | null
  isOpen: boolean
  onClose: () => void
  config: DisplayMenuConfig
}

export function DisplayMenuItemModal({ item, isOpen, onClose, config }: DisplayMenuItemModalProps) {
  if (!item) return null

  // Valores por defecto para modalStyle si no existe
  const modalStyle = config.modalStyle || {
    titleColor: "#8B0000",
    textColor: "#333333",
    priceColor: "#8B0000",
    descriptionColor: "#666666"
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "new":
        return <Star className="h-3 w-3" />
      case "recommended":
        return <Zap className="h-3 w-3" />
      case "spicy":
        return <Zap className="h-3 w-3" />
      case "vegetarian":
        return <Leaf className="h-3 w-3" />
      case "vegan":
        return <Heart className="h-3 w-3" />
      case "glutenFree":
        return <Wheat className="h-3 w-3" />
      default:
        return null
    }
  }

  const getBadgeText = (badge: string) => {
    switch (badge) {
      case "new":
        return "Nuevo"
      case "recommended":
        return "Recomendado"
      case "spicy":
        return "Picante"
      case "vegetarian":
        return "Vegetariano"
      case "vegan":
        return "Vegano"
      case "glutenFree":
        return "Sin Gluten"
      default:
        return badge
    }
  }

  const getBadgeColor = (badge: string) => {
    // Usar el color personalizado de badges si está configurado
    if (config.badgeColor) {
      return `bg-[${config.badgeColor}]`
    }
    
    // Fallback a colores específicos por tipo si no hay color personalizado
    switch (badge) {
      case "new":
        return "bg-blue-500"
      case "recommended":
        return "bg-yellow-500"
      case "spicy":
        return "bg-red-500"
      case "vegetarian":
        return "bg-green-500"
      case "vegan":
        return "bg-purple-500"
      case "glutenFree":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const badges = [
    item.isNew && "new",
    item.isRecommended && "recommended",
    item.isSpicy && "spicy",
    item.isVegetarian && "vegetarian",
    item.isVegan && "vegan",
    item.isGlutenFree && "glutenFree"
  ].filter(Boolean) as string[]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-md border border-white/20"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: modalStyle.textColor,
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-3xl font-bold mb-2"
            style={{ color: modalStyle.titleColor }}
          >
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Imagen del item */}
          <div className="space-y-4">
            {item.imageUrl && (
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                  style={{
                    borderRadius: config.imageStyle === "rounded" ? "0.5rem" : 
                                 config.imageStyle === "circle" ? "50%" : "0"
                  }}
                />
                {badges.length > 0 && (
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <Badge
                        key={badge}
                        className={`${getBadgeColor(badge)} text-white flex items-center gap-1`}
                      >
                        {getBadgeIcon(badge)}
                        {getBadgeText(badge)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información del item */}
          <div className="space-y-4">
            {/* Precio */}
            <div className="text-3xl font-bold" style={{ color: modalStyle.priceColor }}>
              ${item.price.toLocaleString()}
            </div>

            {/* Descripción */}
            {item.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold" style={{ color: modalStyle.textColor }}>
                  Descripción
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: modalStyle.descriptionColor }}>
                  {item.description}
                </p>
              </div>
            )}


            {/* Badges */}
            {badges.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold" style={{ color: modalStyle.textColor }}>
                  Características
                </h3>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <Badge
                      key={badge}
                      className={`${getBadgeColor(badge)} text-white flex items-center gap-1`}
                    >
                      {getBadgeIcon(badge)}
                      {getBadgeText(badge)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="backdrop-blur-md border border-white/20"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: modalStyle.textColor,
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
