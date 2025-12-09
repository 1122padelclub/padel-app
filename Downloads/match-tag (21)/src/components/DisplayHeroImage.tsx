"use client"

import React from "react"
import type { DisplayMenuConfig } from "@/src/types"

interface DisplayHeroImageProps {
  config: DisplayMenuConfig
}

export function DisplayHeroImage({ config }: DisplayHeroImageProps) {
  if (!config.showHeroImage || !config.heroImage) {
    return null
  }

  return (
    <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl mb-12">
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${config.heroImage})`,
        }}
      >
        {/* Overlay para mejorar la legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      </div>

      {/* Contenido de texto */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
          style={{
            fontFamily: config.titleFont,
            color: config.textColor,
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)"
          }}
        >
          {config.heroTitle || "Bienvenidos"}
        </h1>
        
        {config.heroSubtitle && (
          <p 
            className="text-lg md:text-xl lg:text-2xl max-w-2xl leading-relaxed"
            style={{
              fontFamily: config.bodyFont,
              color: config.textColor,
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)"
            }}
          >
            {config.heroSubtitle}
          </p>
        )}
      </div>

      {/* Efectos decorativos opcionales */}
      {config.decorations.showShadows && (
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            boxShadow: `0 8px 32px ${config.decorations.shadowColor}`,
          }}
        ></div>
      )}
    </div>
  )
}



