"use client"

import React from "react"
import { Facebook, Instagram, MessageCircle, Globe, Phone, Mail } from "lucide-react"
import type { DisplayMenuConfig } from "@/src/types"

interface DisplayMenuFooterProps {
  config: DisplayMenuConfig
}

export function DisplayMenuFooter({ config }: DisplayMenuFooterProps) {
  const socialLinks = config.socialLinks

  if (!socialLinks.showSocialLinks) {
    return null
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "whatsapp":
        return <MessageCircle className="h-5 w-5" />
      case "website":
        return <Globe className="h-5 w-5" />
      case "phone":
        return <Phone className="h-5 w-5" />
      case "email":
        return <Mail className="h-5 w-5" />
      default:
        return null
    }
  }

  const getSocialLabel = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "Facebook"
      case "instagram":
        return "Instagram"
      case "whatsapp":
        return "WhatsApp"
      case "website":
        return "Sitio Web"
      case "phone":
        return "Teléfono"
      case "email":
        return "Email"
      default:
        return platform
    }
  }

  const getSocialUrl = (platform: string, value: string) => {
    switch (platform) {
      case "facebook":
        return `https://facebook.com/${value}`
      case "instagram":
        return `https://instagram.com/${value}`
      case "whatsapp":
        return `https://wa.me/${value}`
      case "website":
        return value.startsWith("http") ? value : `https://${value}`
      case "phone":
        return `tel:${value}`
      case "email":
        return `mailto:${value}`
      default:
        return value
    }
  }

  const activeSocialLinks = Object.entries(socialLinks)
    .filter(([key, value]) => key !== "showSocialLinks" && value && value.trim() !== "")

  if (activeSocialLinks.length === 0) {
    return null
  }

  return (
    <footer 
      className="px-4 py-8 border-t"
      style={{
        backgroundColor: config.backgroundColor,
        borderColor: config.accentColor + "20"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{
              fontFamily: config.titleFont,
              color: config.accentColor
            }}
          >
            Síguenos en nuestras redes
          </h3>
          
          <div className="flex justify-center space-x-6">
            {activeSocialLinks.map(([platform, value]) => (
              <a
                key={platform}
                href={getSocialUrl(platform, value as string)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: config.accentColor + "10",
                  color: config.accentColor,
                  border: `1px solid ${config.accentColor}20`
                }}
              >
                {getSocialIcon(platform)}
                <span 
                  className="text-sm font-medium"
                  style={{ fontFamily: config.bodyFont }}
                >
                  {getSocialLabel(platform)}
                </span>
              </a>
            ))}
          </div>
          
          <div 
            className="mt-6 text-sm opacity-70"
            style={{
              fontFamily: config.bodyFont,
              color: config.textColor
            }}
          >
            <p>© {new Date().getFullYear()} {config.title}. Todos los derechos reservados.</p>
            <p className="mt-1">Diseñado con ❤️ para hacerte antojar</p>
          </div>
        </div>
      </div>
    </footer>
  )
}



