"use client"

import React from "react"
import { Star, Sparkles } from "lucide-react"
import type { DisplayMenuConfig, DisplayMenuCategory, DisplayMenuItem } from "@/src/types"

interface DisplayMenuHeroProps {
  config: DisplayMenuConfig
  categories: DisplayMenuCategory[]
  items: DisplayMenuItem[]
}

export function DisplayMenuHero({ config, categories, items }: DisplayMenuHeroProps) {
  // Si showHeroImage está habilitado, no mostrar el hero con item destacado
  // La imagen hero se mostrará en DisplayMenuCategories
  if (config.showHeroImage) {
    return null
  }

  // Obtener items recomendados o el primer item con imagen
  const recommendedItems = items.filter(item => item.isRecommended && item.isVisible)
  const featuredItem = recommendedItems[0] || items.find(item => item.imageUrl && item.isVisible)

  if (!featuredItem || !config.showImages) {
    return null
  }

  return (
    <section className="relative h-96 md:h-[500px] overflow-hidden">
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${featuredItem.imageUrl})`,
        }}
      >
        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Contenido del hero */}
      <div className="relative z-10 h-full flex items-end">
        <div className="px-4 pb-8 w-full">
          <div className="max-w-4xl mx-auto">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {featuredItem.isRecommended && (
                <div 
                  className="flex items-center space-x-1 px-3 py-1 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: config.accentColor }}
                >
                  <Star className="h-4 w-4" />
                  <span>Recomendado</span>
                </div>
              )}
              {featuredItem.isNew && (
                <div 
                  className="flex items-center space-x-1 px-3 py-1 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: "#10B981" }}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Nuevo</span>
                </div>
              )}
            </div>

            {/* Título del plato */}
            <h2 
              className="text-3xl md:text-5xl font-bold text-white mb-2"
              style={{
                fontFamily: config.titleFont,
                textShadow: "2px 2px 4px rgba(0,0,0,0.7)"
              }}
            >
              {featuredItem.name}
            </h2>

            {/* Descripción */}
            {featuredItem.description && config.showDescriptions && (
              <p 
                className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl"
                style={{
                  fontFamily: config.bodyFont,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.7)"
                }}
              >
                {featuredItem.description}
              </p>
            )}

            {/* Precio */}
            {config.showPrices && (
              <div 
                className="text-2xl md:text-3xl font-bold text-white"
                style={{
                  fontFamily: config.titleFont,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)"
                }}
              >
                ${featuredItem.price.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
