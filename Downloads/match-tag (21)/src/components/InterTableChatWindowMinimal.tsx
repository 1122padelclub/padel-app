"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, MessageCircle, Heart, Sparkles, Menu, ShoppingCart, Bell, Star } from "@/src/components/icons/Icons"
import { useT } from "@/src/hooks/useTranslation"

interface InterTableChatWindowProps {
  tableId: string
  barId: string
  tableNumber: number
  barLogo?: string | null
}

export function InterTableChatWindowMinimal({ tableId, barId, tableNumber, barLogo }: InterTableChatWindowProps) {
  const t = useT()
  const [newMessage, setNewMessage] = useState("")
  const [currentView, setCurrentView] = useState<"home" | "chats" | "discover" | "chat">("home")
  const [showRatingForm, setShowRatingForm] = useState(false)

  // Validar props críticas
  const safeTableId = tableId || ""
  const safeBarId = barId || ""
  const safeTableNumber = tableNumber || 1
  const safeBarLogo = barLogo || null

  console.log("[MINIMAL] Props recibidas:", {
    tableId: safeTableId,
    barId: safeBarId,
    tableNumber: safeTableNumber,
    barLogo: safeBarLogo
  })

  // Función para manejar el botón de calificación
  const handleRatingClick = () => {
    console.log("[MINIMAL] Botón de calificación clickeado")
    setShowRatingForm(true)
  }

  // Función para manejar el botón de chats
  const handleChatsClick = () => {
    console.log("[MINIMAL] Botón de chats clickeado")
    setCurrentView("chats")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header simplificado */}
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          Mesa {safeTableNumber}
        </h1>
        {safeBarLogo && (
          <img 
            src={safeBarLogo} 
            alt="Logo del bar" 
            className="mx-auto mb-4 h-12 w-auto object-contain"
          />
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4">
        {currentView === "home" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white text-center mb-6">
              ¿Qué te gustaría hacer?
            </h2>
            
            {/* Botón de Calificar Servicio */}
            <Button
              className="w-full text-white py-4 text-lg font-medium"
              style={{
                background: `linear-gradient(135deg, #f59e0b, #d97706)`,
                borderRadius: `12px`,
              }}
              onClick={handleRatingClick}
            >
              <Star className="h-5 w-5 mr-2" />
              {t("table.rateService")}
            </Button>

            {/* Botón de Ver Chats */}
            <Button
              className="w-full text-white py-4 text-lg font-medium"
              style={{
                background: `linear-gradient(135deg, #3b82f6, #1d4ed8)`,
                borderRadius: `12px`,
              }}
              onClick={handleChatsClick}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {t("table.viewChats")}
            </Button>
          </div>
        )}

        {currentView === "chats" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("home")}
                className="text-white px-4 py-2 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("common.back")}
              </Button>
              <div className="text-xl font-semibold text-white">
                {t("table.activeConversations")}
              </div>
            </div>

            <div className="text-center py-8">
              <div className="text-lg mb-2 text-white opacity-70">
                No hay conversaciones activas
              </div>
              <div className="text-sm text-white opacity-70">
                Inicia una conversación con otra mesa
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-sm text-white opacity-50">
          Powered by Gibra Company
        </p>
      </div>
    </div>
  )
}





