"use client"

import { useEffect } from "react"
import { FONT_OPTIONS } from "@/src/constants/fonts"

export function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    // Filtrar solo las fuentes de Google
    const googleFonts = fonts.filter(font => {
      const fontOption = FONT_OPTIONS.find(f => f.value === font)
      return fontOption?.googleFont === true
    })

    if (googleFonts.length === 0) return

    // Crear URL de Google Fonts
    const fontFamilies = googleFonts.map(font => font.replace(/\s+/g, '+')).join('|')
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@300;400;500;600;700&display=swap`

    // Verificar si el link ya existe
    const existingLink = document.querySelector(`link[href="${googleFontsUrl}"]`)
    if (existingLink) return

    // Crear y agregar el link
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = googleFontsUrl
    link.crossOrigin = 'anonymous'
    
    document.head.appendChild(link)

    console.log(`✅ Google Fonts cargadas: ${googleFonts.join(', ')}`)

    // Cleanup function
    return () => {
      const linkToRemove = document.querySelector(`link[href="${googleFontsUrl}"]`)
      if (linkToRemove) {
        document.head.removeChild(linkToRemove)
        console.log(`🗑️ Google Fonts removidas: ${googleFonts.join(', ')}`)
      }
    }
  }, [fonts])
}

export function useGoogleFont(font: string) {
  useGoogleFonts([font])
}





