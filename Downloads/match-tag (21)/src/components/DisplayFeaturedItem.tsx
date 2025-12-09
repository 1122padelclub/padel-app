"use client"

import React, { useState } from "react"
import { Star, Sparkles, Flame, Leaf, Wheat, Heart } from "lucide-react"
import type { DisplayMenuConfig, DisplayMenuItem } from "@/src/types"
import { DisplayMenuItemModal } from "./DisplayMenuItemModal"

interface DisplayFeaturedItemProps {
  item: DisplayMenuItem
  config: DisplayMenuConfig
  onItemClick?: (item: DisplayMenuItem) => void
}

export function DisplayFeaturedItem({ item, config, onItemClick }: DisplayFeaturedItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "new":
        return <Star className="h-4 w-4" />
      case "recommended":
        return <Sparkles className="h-4 w-4" />
      case "spicy":
        return <Flame className="h-4 w-4" />
      case "vegetarian":
        return <Leaf className="h-4 w-4" />
      case "vegan":
        return <Heart className="h-4 w-4" />
      case "glutenFree":
        return <Wheat className="h-4 w-4" />
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

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item)
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <div 
        className="relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 cursor-pointer group"
        onClick={handleClick}
        style={{
          background: config.decorations.showGradients && config.decorations.gradientColors.length > 1
            ? `linear-gradient(135deg, ${config.decorations.gradientColors[0]}, ${config.decorations.gradientColors[1]})`
            : config.backgroundColor,
          boxShadow: config.decorations.showShadows 
            ? `0 20px 40px ${config.decorations.shadowColor}` 
            : "0 10px 30px rgba(0, 0, 0, 0.3)"
        }}
      >
        {/* Imagen de fondo */}
        {item.imageUrl && (
          <div className="absolute inset-0">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay para mejorar legibilidad */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            />
          </div>
        )}

        {/* Contenido */}
        <div className="relative z-10 p-8 md:p-12 min-h-[400px] flex flex-col justify-end">
          {/* Badges */}
          {config.showBadges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.slice(0, 3).map((badge) => (
                <div
                  key={badge}
                  className={`${getBadgeColor(badge)} text-white flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {getBadgeIcon(badge)}
                  {getBadgeText(badge)}
                </div>
              ))}
            </div>
          )}

          {/* Nombre del item */}
          <h2 
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            style={{
              fontFamily: config.titleFont,
              color: config.textColor,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)"
            }}
          >
            {item.name}
          </h2>

          {/* Descripción */}
          {config.showDescriptions && item.description && (
            <p 
              className="text-lg md:text-xl mb-6 leading-relaxed max-w-2xl"
              style={{
                fontFamily: config.bodyFont,
                color: config.textColor,
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)"
              }}
            >
              {item.description}
            </p>
          )}

          {/* Precio */}
          {config.showPrices && (
            <div 
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: config.titleFont,
                color: config.accentColor,
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)"
              }}
            >
              ${item.price.toLocaleString()}
            </div>
          )}

          {/* Indicador de click */}
          <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: config.accentColor,
                color: "white"
              }}
            >
              <span>Ver detalles</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de vista ampliada */}
      <DisplayMenuItemModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={config}
      />
    </>
  )
}
