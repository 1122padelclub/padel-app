"use client"

import { Button } from "@/components/ui/button"
import { useButtonConfiguration } from "@/src/hooks/useButtonConfiguration"
import { SocialIcon, SOCIAL_PLATFORMS } from "@/src/components/SocialMediaIcons"
import type { CustomButton } from "@/src/types"

interface CustomButtonsDisplayProps {
  barId: string
  className?: string
}

export function CustomButtonsDisplay({ barId, className = "" }: CustomButtonsDisplayProps) {
  const { configuration, loading } = useButtonConfiguration(barId)

  if (loading || !configuration.showButtons || configuration.buttons.length === 0) {
    return null
  }

  const activeButtons = configuration.buttons
    .filter(button => button.isActive)
    .sort((a, b) => a.order - b.order)

  if (activeButtons.length === 0) {
    return null
  }

  const getButtonIcon = (type: string, customIcon?: string, button?: CustomButton) => {
    // Si hay un icono personalizado (emoji), usarlo
    if (customIcon) return <span className="text-lg">{customIcon}</span>
    
    // Para botones de redes sociales, usar el logo real
    if (type === "social" && button?.label) {
      const platform = Object.keys(SOCIAL_PLATFORMS).find(key => 
        SOCIAL_PLATFORMS[key as keyof typeof SOCIAL_PLATFORMS].label === button.label
      )
      if (platform) {
        return <SocialIcon platform={platform} size={18} className="text-white" />
      }
    }
    
    // Iconos por defecto para otros tipos
    switch (type) {
      case "social": return <span className="text-lg">📱</span>
      case "website": return <span className="text-lg">🌐</span>
      case "phone": return <span className="text-lg">📞</span>
      case "email": return <span className="text-lg">📧</span>
      default: return <span className="text-lg">🔗</span>
    }
  }

  const getButtonStyles = () => {
    const { size, spacing } = configuration.buttonStyle
    
    const sizeClasses = {
      small: "text-xs px-2 py-1",
      medium: "text-sm px-3 py-2",
      large: "text-base px-4 py-3"
    }
    
    const spacingClasses = {
      tight: "gap-1",
      normal: "gap-2",
      loose: "gap-4"
    }
    
    return {
      buttonClass: sizeClasses[size] || sizeClasses.medium,
      containerClass: spacingClasses[spacing] || spacingClasses.normal
    }
  }

  const getLayoutClasses = () => {
    const { layout } = configuration.buttonStyle
    
    switch (layout) {
      case "horizontal":
        return "flex flex-wrap"
      case "vertical":
        return "flex flex-col"
      case "grid":
        return "grid grid-cols-2 gap-2"
      default:
        return "flex flex-wrap"
    }
  }

  const handleButtonClick = (button: CustomButton) => {
    let url = button.url
    
    // Manejar diferentes tipos de URLs
    if (button.type === "phone" && !url.startsWith("tel:")) {
      url = `tel:${url.replace(/\D/g, "")}` // Remover caracteres no numéricos
    } else if (button.type === "email" && !url.startsWith("mailto:")) {
      url = `mailto:${url}`
    } else if (button.type === "website" && !url.startsWith("http")) {
      url = `https://${url}`
    }
    
    // Abrir en nueva pestaña para enlaces web
    if (button.type === "website" || button.type === "social") {
      window.open(url, "_blank", "noopener,noreferrer")
    } else {
      window.location.href = url
    }
  }

  const { buttonClass, containerClass } = getButtonStyles()
  const layoutClass = getLayoutClasses()

  return (
    <div className={`${layoutClass} ${containerClass} ${className}`}>
      {activeButtons.map((button) => (
        <Button
          key={button.id}
          variant="outline"
          className={`
            ${buttonClass}
            flex items-center gap-2
            transition-all duration-200
            hover:scale-105
            ${button.backgroundColor ? '' : 'bg-white/10 border-white/20 hover:bg-white/20'}
          `}
          style={{
            backgroundColor: button.backgroundColor || undefined,
            color: button.color || undefined,
            borderColor: button.backgroundColor ? 'transparent' : undefined
          }}
          onClick={() => handleButtonClick(button)}
        >
          {getButtonIcon(button.type, button.icon, button)}
          <span className="truncate">{button.label}</span>
        </Button>
      ))}
    </div>
  )
}
