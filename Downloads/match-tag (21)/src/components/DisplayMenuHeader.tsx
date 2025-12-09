"use client"

import React from "react"
import { ExternalLink, Star } from "lucide-react"
import type { DisplayMenuConfig } from "@/src/types"

interface DisplayMenuHeaderProps {
  config: DisplayMenuConfig
  onContactClick: () => void
  onRecommendedClick: () => void
}

export function DisplayMenuHeader({ config, onContactClick, onRecommendedClick }: DisplayMenuHeaderProps) {
  const headerStyle = {
    backgroundColor: config.accentColor,
    color: "white",
    fontFamily: config.headerFont,
  }

  // Valores por defecto para titleStyle si no existe
  const titleStyle = config.titleStyle || {
    titleColor: "#FFFFFF",
    subtitleColor: "#FFFFFF",
    backgroundColor: "#1F2937"
  }

  // Valores por defecto para headerButtons si no existe
  const headerButtons = config.headerButtons || {
    leftButton: {
      text: "Contáctanos",
      url: "https://wa.me/1234567890",
      isVisible: true
    },
    rightButton: {
      text: "Recomendados",
      url: "#recomendados",
      isVisible: true
    }
  }

  const handleButtonClick = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else if (url.startsWith('#')) {
      // Para enlaces internos, hacer scroll al elemento
      const element = document.querySelector(url)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (url.startsWith('tel:')) {
      window.location.href = url
    } else if (url.startsWith('mailto:')) {
      window.location.href = url
    }
  }

  return (
    <header className="relative">
      {/* Barra superior de navegación */}
      <div 
        className="px-4 py-3 flex justify-between items-center"
        style={headerStyle}
      >
        <div className="flex items-center space-x-4">
          {headerButtons.leftButton.isVisible && (
            <button
              onClick={() => handleButtonClick(headerButtons.leftButton.url)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="font-medium">{headerButtons.leftButton.text}</span>
            </button>
          )}
          
          {headerButtons.leftButton.isVisible && headerButtons.rightButton.isVisible && (
            <div className="w-px h-6 bg-white/30" />
          )}
          
          {headerButtons.rightButton.isVisible && (
            <button
              onClick={() => handleButtonClick(headerButtons.rightButton.url)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Star className="h-4 w-4" />
              <span className="font-medium">{headerButtons.rightButton.text}</span>
            </button>
          )}
        </div>
      </div>

      {/* Título principal */}
      <div 
        className="px-4 py-8 text-center"
        style={{
          backgroundColor: titleStyle.backgroundColor,
          background: `linear-gradient(to bottom, ${titleStyle.backgroundColor}, ${titleStyle.backgroundColor}dd)`
        }}
      >
        <h1 
          className="text-4xl md:text-6xl font-bold mb-2"
          style={{
            fontFamily: config.titleFont,
            color: titleStyle.titleColor,
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
          }}
        >
          {config.title}
        </h1>
        {config.subtitle && (
          <p 
            className="text-lg md:text-xl opacity-90"
            style={{
              fontFamily: config.bodyFont,
              color: titleStyle.subtitleColor
            }}
          >
            {config.subtitle}
          </p>
        )}
      </div>
    </header>
  )
}
