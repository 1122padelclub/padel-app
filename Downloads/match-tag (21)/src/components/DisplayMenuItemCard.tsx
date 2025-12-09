"use client"

import React, { useState } from "react"
import { Star, Sparkles, Flame, Leaf, Wheat } from "lucide-react"
import type { DisplayMenuConfig, DisplayMenuItem } from "@/src/types"
import { DisplayMenuItemModal } from "./DisplayMenuItemModal"

interface DisplayMenuItemCardProps {
  item: DisplayMenuItem
  config: DisplayMenuConfig
}

export function DisplayMenuItemCard({ item, config }: DisplayMenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const itemStyle = config.itemStyle

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "recommended":
        return <Star className="h-3 w-3" />
      case "new":
        return <Sparkles className="h-3 w-3" />
      case "spicy":
        return <Flame className="h-3 w-3" />
      case "vegetarian":
      case "vegan":
        return <Leaf className="h-3 w-3" />
      case "glutenFree":
        return <Wheat className="h-3 w-3" />
      default:
        return null
    }
  }

  const getBadgeText = (type: string) => {
    switch (type) {
      case "recommended":
        return "Recomendado"
      case "new":
        return "Nuevo"
      case "spicy":
        return "Picante"
      case "vegetarian":
        return "Vegetariano"
      case "vegan":
        return "Vegano"
      case "glutenFree":
        return "Sin Gluten"
      default:
        return ""
    }
  }

  const getBadgeColor = (type: string) => {
    // Usar el color personalizado de badges si está configurado
    if (config.badgeColor) {
      return `bg-[${config.badgeColor}]`
    }
    
    // Fallback a colores específicos por tipo si no hay color personalizado
    switch (type) {
      case "recommended":
        return "bg-yellow-500"
      case "new":
        return "bg-green-500"
      case "spicy":
        return "bg-red-500"
      case "vegetarian":
      case "vegan":
        return "bg-green-600"
      case "glutenFree":
        return "bg-amber-500"
      default:
        return "bg-blue-500"
    }
  }

  const getActiveBadges = () => {
    const badges = []
    if (item.isRecommended) badges.push("recommended")
    if (item.isNew) badges.push("new")
    if (item.isSpicy) badges.push("spicy")
    if (item.isVegetarian) badges.push("vegetarian")
    if (item.isVegan) badges.push("vegan")
    if (item.isGlutenFree) badges.push("glutenFree")
    return badges
  }

  const activeBadges = getActiveBadges()

  return (
    <>
      <div 
        className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: itemStyle.backgroundColor,
          border: itemStyle.showBorders ? `1px ${itemStyle.borderStyle} ${itemStyle.borderColor}` : "none",
          boxShadow: config.decorations.showShadows ? `0 2px 4px ${config.decorations.shadowColor}` : "none",
          padding: itemStyle.spacing === "tight" ? "0.75rem" : 
                   itemStyle.spacing === "normal" ? "1rem" : "1.5rem"
        }}
      >
      {/* Imagen del item */}
      {config.showImages && item.imageUrl && (
        <div 
          className="relative overflow-hidden mb-4"
          style={{
            height: config.imageSize === "small" ? "120px" :
                    config.imageSize === "medium" ? "180px" :
                    config.imageSize === "large" ? "240px" : "300px"
          }}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
              config.imageStyle === "rounded" ? "rounded-lg" :
              config.imageStyle === "circle" ? "rounded-full" :
              config.imageStyle === "square" ? "rounded-none" : ""
            }`}
          />
          
          {/* Overlay con badges */}
          {config.showBadges && activeBadges.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-col space-y-1">
              {activeBadges.slice(0, 2).map((badgeType) => (
                <div
                  key={badgeType}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-white text-xs font-medium ${
                    config.badgeStyle === "rounded" ? "rounded-full" :
                    config.badgeStyle === "square" ? "rounded" : "rounded-full"
                  }`}
                  style={{ backgroundColor: getBadgeColor(badgeType) }}
                >
                  {getBadgeIcon(badgeType)}
                  <span>{getBadgeText(badgeType)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenido del item */}
      <div className="space-y-2">
                    {/* Nombre del item */}
                    <h3 
                      className="font-bold leading-tight"
                      style={{
                        fontFamily: config.titleFont,
                        color: itemStyle.nameColor || config.textColor,
                        fontSize: itemStyle.nameFontSize === "small" ? "1.125rem" :
                                 itemStyle.nameFontSize === "medium" ? "1.25rem" :
                                 itemStyle.nameFontSize === "large" ? "1.5rem" : "1.75rem",
                        fontWeight: itemStyle.nameFontWeight === "normal" ? "400" :
                                   itemStyle.nameFontWeight === "semibold" ? "600" : "700"
                      }}
                    >
                      {item.name}
                    </h3>

                    {/* Descripción */}
                    {config.showDescriptions && item.description && (
                      <p 
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: config.bodyFont,
                          color: itemStyle.descriptionColor || config.textColor,
                          fontSize: itemStyle.fontSize === "small" ? "0.875rem" :
                                   itemStyle.fontSize === "medium" ? "1rem" : "1.125rem"
                        }}
                      >
                        {item.description}
                      </p>
                    )}

                    {/* Precio */}
                    {config.showPrices && (
                      <div 
                        className="text-lg font-bold"
                        style={{
                          fontFamily: config.titleFont,
                          color: itemStyle.priceColor || config.accentColor,
                          fontSize: itemStyle.fontSize === "small" ? "1rem" :
                                   itemStyle.fontSize === "medium" ? "1.125rem" : "1.25rem"
                        }}
                      >
                        ${item.price.toLocaleString()}
                      </div>
                    )}
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
