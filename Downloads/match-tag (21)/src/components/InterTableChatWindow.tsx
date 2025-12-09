"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, MessageCircle, Heart, Sparkles, Menu, ShoppingCart, Bell, Star, Users } from "@/src/components/icons/Icons"
import { useHybridChat } from "@/src/hooks/useHybridChat"
import { ChatMenuModal } from "@/src/components/ChatMenuModal"
import { TableOrderModal } from "@/src/components/TableOrderModal"
import { ServiceRatingForm } from "@/src/components/ServiceRatingForm"
import { CustomButtonsDisplay } from "@/src/components/CustomButtonsDisplay"
import { useWaiterCalls } from "@/src/hooks/useWaiterCalls"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { MenuItem, Table } from "@/src/types"
import { useThemeConfig } from "@/src/hooks/useThemeConfig"
import { useAnnouncements } from "@/src/hooks/useAnnouncements"
import { AnnouncementModal } from "@/src/components/AnnouncementModal"
import { useT } from "@/src/hooks/useTranslation"
import { useTableT } from "@/src/hooks/useTableTranslation"
import { TableLanguageSelector } from "@/src/components/TableLanguageSelector"

interface InterTableChatWindowProps {
  tableId: string
  barId: string
  tableNumber: number
  barLogo?: string | null
  generalChatEnabled?: boolean
  onOpenGeneralChat?: () => void
}

export function InterTableChatWindow({ tableId, barId, tableNumber, barLogo, generalChatEnabled = false, onOpenGeneralChat }: InterTableChatWindowProps) {
  const t = useT()
  const tableT = useTableT()
  const [newMessage, setNewMessage] = useState("")
  const [currentView, setCurrentView] = useState<"home" | "chats" | "discover" | "chat">("home")
  const [currentTableIndex, setCurrentTableIndex] = useState(0)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const [matchedTable, setMatchedTable] = useState<string | number | null>(null)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [chatsEnabled, setChatsEnabled] = useState(true)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [menuDataReady, setMenuDataReady] = useState(false)
  const [callingWaiter, setCallingWaiter] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { themeConfig } = useThemeConfig(barId)
  const { announcements } = useAnnouncements(barId)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const { createWaiterCall } = useWaiterCalls(barId)

  const {
    messages,
    availableTables,
    activeChats,
    selectedChatId,
    currentTable,
    loading,
    setSelectedChatId,
    startChatWithTable,
    sendMessage,
    getOtherTableNumber,
    getOtherTableName,
    isUsingLocal,
    firebaseError,
  } = useHybridChat(tableId, barId)

  const safeMessages = messages || []
  const safeAvailableTables = availableTables || []
  const safeActiveChats = activeChats || []


  // Debug function to check Firebase structure
  const debugFirebaseStructure = async () => {
    console.log("🔍 [DEBUG] Verificando estructura de Firebase...")
    console.log("🔍 [DEBUG] barId:", barId)
    console.log("🔍 [DEBUG] tableId:", tableId)
    console.log("🔍 [DEBUG] currentTable:", currentTable)
    
    try {
      // Importar Firebase modules
      const { ref, get } = await import('firebase/database')
      const { realtimeDb } = await import('@/src/services/firebaseExtras')
      
      const paths = [
        `chats/${barId}`,
        `bars/${barId}/chats`,
        `chats`,
        `bars/${barId}/tableChats`,
        `bars/${barId}/tables`
      ]
      
      console.log("🔍 [DEBUG] Verificando rutas...")
      
      for (const path of paths) {
        try {
          console.log(`🔍 [DEBUG] Verificando ruta: ${path}`)
          const snapshot = await get(ref(realtimeDb, path))
          const data = snapshot.val()
          console.log(`✅ [DEBUG] Ruta ${path}:`, data)
        } catch (error) {
          console.log(`❌ [DEBUG] Error en ruta ${path}:`, (error as any)?.message || error)
        }
      }
      
      console.log("🔍 [DEBUG] Verificación completada")
    } catch (error) {
      console.error("❌ [DEBUG] Error general:", error)
    }
  }

  const quickMessages = [
    tableT.t("chat.hello"),
    tableT.t("chat.joinOurTable"),
    tableT.t("chat.cheers"),
    tableT.t("chat.everythingOk"),
    "🍻"
  ]

  useEffect(() => {
    if (!barId) return

    const barRef = doc(db, "bars", barId)
    const unsubscribe = onSnapshot(barRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setChatsEnabled(data.chatsEnabled !== false) // Por defecto true si no existe
        setMenuDataReady(true)
      }
    })

    return () => unsubscribe()
  }, [barId])

  useEffect(() => {
    if (!tableId) return

    // La configuración ahora viene del tema global
  }, [tableId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [safeMessages]) // Usar safeMessages en lugar de messages

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    console.log("[v0] Enviando mensaje:", {
      message: newMessage.trim(),
      selectedChatId,
      currentTable,
      barId,
      isUsingLocal,
      firebaseError,
    })

    const success = await sendMessage(newMessage.trim())

    if (success) {
      console.log("[v0] Mensaje enviado exitosamente")
      setNewMessage("")
    } else {
      console.error("[v0] Error al enviar mensaje")
      alert(t("errors.networkError"))
    }
  }

  const handleQuickMessage = async (message: string) => {
    console.log("[v0] Enviando mensaje rápido:", {
      message,
      selectedChatId,
      currentTable,
      barId,
    })

    const success = await sendMessage(message)

    if (!success) {
      console.error("[v0] Error al enviar mensaje rápido")
      alert(t("errors.networkError"))
    } else {
      console.log("[v0] Mensaje rápido enviado exitosamente")
    }
  }

  const handleConnectWithTable = async (targetTable?: Table) => {
    let tableToConnect: Table

    if (targetTable) {
      // Conexión directa desde la lista
      tableToConnect = targetTable
    } else {
      // Conexión desde vista tipo Tinder (mantenemos compatibilidad)
      if (currentTableIndex >= safeAvailableTables.length) return // Usar safeAvailableTables
      tableToConnect = safeAvailableTables[currentTableIndex] // Usar safeAvailableTables
    }

    console.log("🔗 Conectando con mesa:", tableToConnect)
    console.log("🔗 Mesa actual:", { tableId, barId, tableNumber })

    try {
      // Usar la función startChatWithTable del hook híbrido
      const chatId = await startChatWithTable(tableToConnect)

      if (chatId) {
        console.log("✅ Chat iniciado con ID:", chatId)
        // Mostrar animación de match
        // Usar el nombre personalizado si existe, si no usar el número
        setMatchedTable(tableToConnect.name || tableToConnect.number)
        setShowMatchAnimation(true)

        setTimeout(() => {
          setShowMatchAnimation(false)
          setMatchedTable(null)
          setCurrentView("chat")
          setSelectedChatId(chatId)
        }, 2000)
      } else {
        console.error("❌ No se pudo iniciar el chat - chatId es null")
        alert(t("errors.networkError"))
      }
    } catch (error) {
      console.error("❌ Error al conectar con la mesa:", error)
      alert(t("errors.networkError"))
    }
  }

  const handlePassTable = () => {
    if (currentTableIndex < safeAvailableTables.length - 1) {
      // Usar safeAvailableTables
      setCurrentTableIndex(currentTableIndex + 1)
    } else {
      // No hay más mesas, volver al inicio
      setCurrentView("home")
      setCurrentTableIndex(0)
    }
  }

  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId)
    setCurrentView("chat")
  }

  const handleBackToHome = () => {
    setSelectedChatId(null)
    setCurrentView("home")
    setCurrentTableIndex(0)
  }

  const handleStartDiscovery = () => {
    setCurrentTableIndex(0)
    setCurrentView("discover")
  }

  const handleSendMenuItem = async (item: MenuItem) => {
    // Verificar que hay un chat activo antes de enviar
    if (!selectedChatId) {
      // Si no hay chat seleccionado, simplemente retornar silenciosamente
      // Esto puede ocurrir cuando los chats están desactivados o no hay conversación activa
      console.log("[v0] No hay chat seleccionado - item del menú no enviado (chats desactivados o sin conversación activa)")
      return
    }

    const menuMessage = `🍽️ **${item.name}** - $${item.price.toFixed(2)}\n${item.description || t("menu.items")}`

    console.log("[v0] Enviando item del menú:", {
      item: item.name,
      price: item.price,
      selectedChatId,
      currentTable,
      barId,
    })

    const success = await sendMessage(menuMessage)

    if (!success) {
      console.error("[v0] Error al enviar item del menú")
      alert(t("errors.networkError"))
    } else {
      console.log("[v0] Item del menú enviado exitosamente")
    }
  }

  const handleOrderCreated = (orderId: string, orderSummary: string) => {
    console.log("Order created:", { orderId, orderSummary })
    // Aquí podrías mostrar una notificación o actualizar el estado
  }

  const getTargetTableInfo = () => {
    if (!selectedChatId) return null
    const activeChat = safeActiveChats.find((chat) => chat.id === selectedChatId) // Usar safeActiveChats
    if (!activeChat) return null

    const targetTableId = activeChat.tableIds[0] === tableId ? activeChat.tableIds[1] : activeChat.tableIds[0]

    // Buscar la mesa en availableTables o usar la información del chat
    const targetTable = safeAvailableTables.find((table: any) => table.id === targetTableId) // Usar safeAvailableTables

    if (targetTable) {
      return {
        id: targetTable.id,
        number: targetTable.number,
      }
    }

    // Si no está en availableTables, usar la información del chat
    return {
      id: targetTableId,
      number: getOtherTableNumber(activeChat as any),
    }
  }

  const handleCallWaiter = async () => {
    if (callingWaiter) return

    setCallingWaiter(true)
    try {
      await createWaiterCall(tableId, currentTable?.name || tableNumber, `${tableT.t("table.table")} ${currentTable?.name || tableNumber} ${tableT.t("table.requestWaiterAttention")}`)

      // Mostrar confirmación visual
      alert(`✅ ${tableT.t("table.waiterCalledSuccessfully")}`)
    } catch (error) {
      console.error("Error al llamar al mesero:", error)
      alert(`❌ ${tableT.t("table.errorCallingWaiter")}`)
    } finally {
      setCallingWaiter(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--mt-bg)" }}>
        <div className="text-lg" style={{ color: "var(--mt-text)" }}>
          {t("common.loading")}
        </div>
      </div>
    )
  }

  if (!currentTable) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--mt-bg)" }}>
        <div className="text-red-400 text-lg">{tableT.t("table.tableNotFound")}</div>
      </div>
    )
  }

  const shouldRenderModals = Boolean(menuDataReady && barId && tableId && tableNumber)

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--mt-bg)",
        backgroundImage: (themeConfig as any)?.assets?.backgroundImageUrl
          ? `url(${(themeConfig as any).assets.backgroundImageUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "var(--mt-text)",
      }}
    >
      {showMatchAnimation && (
        <div className="fixed inset-0 bg-gradient-to-br from-pink-500/90 via-purple-500/90 to-blue-500/90 flex items-center justify-center z-50">
          <div className="text-center animate-pulse">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-2 text-white">¡MATCH!</h2>
            <p className="text-xl text-white">{tableT.t("table.connectedWithTable")} {matchedTable}</p>
            <div className="flex justify-center mt-4">
              <Sparkles className="h-8 w-8 animate-spin text-white" />
            </div>
          </div>
        </div>
      )}


      {/* Header */}
      <div className="text-center py-2 px-4 relative">
        {/* Language Selector */}
        <div className="absolute top-2 right-4">
          <TableLanguageSelector />
        </div>
        {((themeConfig as any)?.assets?.logoUrl || barLogo) && (
          <div className="flex justify-center mb-2">
            <img
              src={(themeConfig as any)?.assets?.logoUrl || barLogo || "/placeholder.svg"}
              alt="Logo"
              className="w-auto object-contain"
              style={{
                height: (themeConfig as any)?.branding?.logoSize ? `${(themeConfig as any).branding.logoSize}px` : '40px'
              }}
              onLoad={() => {
                console.log('Logo loaded, size:', (themeConfig as any)?.branding?.logoSize)
              }}
            />
          </div>
        )}
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--mt-text)" }}>
          {(themeConfig as any)?.branding?.restaurantName || "Match Tag"}
        </h1>
        <p className="text-xs mb-2" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
          {(themeConfig as any)?.branding?.tagline ||
            (chatsEnabled ? tableT.t("table.joinTable") : tableT.t("table.orderNow"))}
        </p>
        <h2 className="text-lg font-semibold" style={{ color: "var(--mt-text)" }}>
          {tableT.t("table.yourTable")}: {currentTable?.name || tableNumber}
        </h2>
      </div>

      <div className="px-4 max-w-lg mx-auto">
        {/* Vista Principal */}
        {currentView === "home" && (
          <>
            {chatsEnabled && (
              <div
                className="backdrop-blur-sm rounded-2xl p-6 mb-6 min-h-[300px] border"
                style={{
                  backgroundColor: "var(--mt-surface)",
                  borderColor: "var(--mt-secondary)",
                  borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--mt-text)" }}>
                  <MessageCircle className="h-5 w-5" />
                  {tableT.t("table.activeConversations")}
                </h3>
                {safeActiveChats.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-lg mb-2" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                        {tableT.t("table.noActiveConversations")}
                      </div>
                      <div className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                        {tableT.t("table.discoverTablesAndMatch")}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {safeActiveChats.map((chat) => (
                      <button
                        key={chat.id}
                        className="w-full rounded-xl p-4 text-left transition-colors border"
                        style={{
                          backgroundColor: "var(--mt-surface)",
                          borderColor: "var(--mt-secondary)",
                          borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                        }}
                        onClick={() => handleOpenChat(chat.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-lg" style={{ color: "var(--mt-text)" }}>
                              {tableT.t("table.table")} {getOtherTableName(chat as any)}
                            </div>
                            {chat.lastMessage && (
                              <div className="text-sm truncate mt-1" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                                {chat.lastMessage}
                              </div>
                            )}
                          </div>
                          <Badge className="text-white" style={{ backgroundColor: "var(--mt-primary)" }}>
                            Activo
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {chatsEnabled && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button
                  className="text-white py-4 text-lg font-medium"
                  style={{
                    backgroundColor: "var(--mt-primary)",
                    borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                  }}
                  onClick={() => setCurrentView("chats")}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {tableT.t("table.viewChats")}
                </Button>
                <Button
                  className="text-white py-4 text-lg font-medium"
                  style={{
                    background: `linear-gradient(135deg, var(--mt-secondary), var(--mt-primary))`,
                    borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                  }}
                  onClick={handleStartDiscovery}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {tableT.t("table.discover")}
                </Button>
              </div>
            )}


            {/* En modo Solo Pedidos, mostrar directamente el menú */}
            {!chatsEnabled && (
              <>
                {/* Menú del Bar */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--mt-text)" }}>
                    <ShoppingCart className="h-5 w-5" />
                    {tableT.t("table.barMenu")}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      className="w-full text-white py-4 text-lg font-medium"
                      style={{
                        background: "linear-gradient(to right, #3b82f6, #1d4ed8)",
                        borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                      }}
                      onClick={() => setShowMenuModal(true)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {tableT.t("table.viewFullMenu")}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Botones de Acción - Solo en modo con chats */}
            {chatsEnabled && (
              <>
                {/* Botón de Calificación de Servicio */}
                <div className="mb-4">
                  <Button
                    className="w-full text-white py-4 text-lg font-medium"
                    style={{
                      background: `linear-gradient(135deg, #f59e0b, #d97706)`,
                      borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                    }}
                    onClick={() => setShowRatingForm(true)}
                  >
                    <Star className="h-5 w-5 mr-2" />
                    {tableT.t("table.rateService")}
                  </Button>
                </div>

                <div className="mb-4">
                  <Button
                    className="w-full text-white py-4 text-lg font-medium"
                    style={{
                      background: "linear-gradient(to right, #f59e0b, #d97706)",
                      borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                    }}
                    onClick={handleCallWaiter}
                    disabled={callingWaiter}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    {callingWaiter ? tableT.t("common.loading") : tableT.t("table.callWaiter")}
                  </Button>
                </div>

                <div className="mb-4">
                  <Button
                    className="w-full text-white py-4 text-lg font-medium"
                    style={{
                      background: "linear-gradient(to right, #10b981, #059669)",
                      borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                    }}
                    onClick={() => setShowOrderModal(true)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {tableT.t("table.makeOrderForMyTable")}
                  </Button>
                </div>
                
                {/* Botón de Chat General */}
                {generalChatEnabled && onOpenGeneralChat && (
                  <div className="mb-8">
                    <Button
                      className="w-full text-white py-4 text-lg font-medium"
                      style={{
                        background: `linear-gradient(135deg, #8b5cf6, #6d28d9)`,
                        borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                      }}
                      onClick={onOpenGeneralChat}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      {tableT.t("generalChat.title")}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Botones de Acción - En modo Solo Pedidos */}
            {!chatsEnabled && (
              <>
                <div className="mb-4">
                  <Button
                    className="w-full text-white py-4 text-lg font-medium"
                    style={{
                      background: `linear-gradient(135deg, #f59e0b, #d97706)`,
                      borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                    }}
                    onClick={() => setShowRatingForm(true)}
                  >
                    <Star className="h-5 w-5 mr-2" />
                    {tableT.t("table.rateService")}
                  </Button>
                </div>

                <div className="mb-4">
                  <Button
                    className="w-full text-white py-4 text-lg font-medium"
                    style={{
                      background: "linear-gradient(to right, #f59e0b, #d97706)",
                      borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                    }}
                    onClick={handleCallWaiter}
                    disabled={callingWaiter}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    {callingWaiter ? tableT.t("common.loading") : tableT.t("table.callWaiter")}
                  </Button>
                </div>
                
                {/* Botón de Chat General */}
                {generalChatEnabled && onOpenGeneralChat && (
                  <div className="mb-8">
                    <Button
                      className="w-full text-white py-4 text-lg font-medium"
                      style={{
                        background: `linear-gradient(135deg, #8b5cf6, #6d28d9)`,
                        borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                      }}
                      onClick={onOpenGeneralChat}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      {tableT.t("generalChat.title")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Chat View */}
        {chatsEnabled && currentView === "chat" && selectedChatId && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="text-white px-4 py-2 rounded-lg"
                style={{ backgroundColor: "var(--mt-primary)" }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("common.back")}
              </Button>
              <div className="text-xl font-semibold" style={{ color: "var(--mt-text)" }}>
                {tableT.t("table.table")} {getOtherTableName(safeActiveChats.find((c) => c.id === selectedChatId) as any)}
              </div>
            </div>

            <div
              className="backdrop-blur-sm rounded-2xl mb-4 border min-h-[400px] flex flex-col"
              style={{
                backgroundColor: "var(--mt-surface)",
                borderColor: "var(--mt-secondary)",
                borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
              }}
            >
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {safeMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-lg mb-2" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                        {tableT.t("chat.startConversation")}
                      </div>
                      <div className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                        {tableT.t("chat.sendFirstMessage")}
                      </div>
                    </div>
                  ) : (
                    safeMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderTable === tableId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className="max-w-[80%] rounded-2xl px-4 py-3"
                          style={{
                            backgroundColor:
                              message.senderTable === tableId ? "var(--mt-primary)" : "var(--mt-surface)",
                            color: message.senderTable === tableId ? "var(--mt-menutext)" : "var(--mt-text)",
                            border: message.senderTable === tableId ? "none" : "1px solid var(--mt-secondary)",
                          }}
                        >
                          <div>{message.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div
                className="p-4 border-t"
                style={{
                  backgroundColor: "var(--mt-surface)",
                  borderColor: "var(--mt-secondary)",
                }}
              >
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={tableT.t("chat.typeMessage")}
                    className="flex-1 rounded-xl"
                    style={{
                      backgroundColor: "var(--mt-surface)",
                      borderColor: "var(--mt-secondary)",
                      color: "var(--mt-text)",
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="text-white px-6 rounded-xl"
                    style={{
                      backgroundColor: "var(--mt-primary)",
                      borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                    }}
                  >
                    {tableT.t("chat.send")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowMenuModal(true)}
                    className="text-white rounded-xl"
                    style={{
                      backgroundColor: "var(--mt-secondary)",
                      borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                    }}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm mb-3" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                {tableT.t("chat.quickMessages")}
              </div>
              <div className="flex flex-wrap gap-2">
                {quickMessages.map((msg) => (
                  <Button
                    key={msg}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickMessage(msg)}
                    className="rounded-lg"
                    style={{
                      backgroundColor: "var(--mt-surface)",
                      borderColor: "var(--mt-secondary)",
                      color: "var(--mt-text)",
                    }}
                  >
                    {msg}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Chats View */}
        {chatsEnabled && currentView === "chats" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="text-white px-4 py-2 rounded-lg"
                style={{ backgroundColor: "var(--mt-primary)" }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("common.back")}
              </Button>
              <div className="text-xl font-semibold" style={{ color: "var(--mt-text)" }}>
                Conversaciones Activas
              </div>
            </div>

            <div className="space-y-3">
              {safeActiveChats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-lg mb-2" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                    {tableT.t("table.noActiveConversations")}
                  </div>
                  <div className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                    {tableT.t("table.discoverTablesAndMatch")}
                  </div>
                </div>
              ) : (
                safeActiveChats.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full rounded-xl p-4 text-left transition-colors border"
                    style={{
                      backgroundColor: "var(--mt-surface)",
                      borderColor: "var(--mt-secondary)",
                      borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                    }}
                    onClick={() => handleOpenChat(chat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-lg" style={{ color: "var(--mt-text)" }}>
                          {tableT.t("table.table")} {getOtherTableName(chat as any)}
                        </div>
                        {chat.lastMessage && (
                          <div className="text-sm truncate mt-1" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                            {chat.lastMessage}
                          </div>
                        )}
                      </div>
                      <Badge
                        className="bg-green-500/20 text-green-400 border-green-500/30 mt-2"
                        style={{ backgroundColor: "var(--mt-primary)" }}
                      >
                        Activa
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {/* Discover View */}
        {chatsEnabled && currentView === "discover" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="text-white px-4 py-2 rounded-lg"
                style={{ backgroundColor: "var(--mt-primary)" }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("common.back")}
              </Button>
              <div className="text-xl font-semibold" style={{ color: "var(--mt-text)" }}>
                {tableT.t("table.availableTables")}
              </div>
            </div>

            {safeAvailableTables.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-lg mb-2" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                  {tableT.t("table.noAvailableTables")}
                </div>
                <div className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                  {tableT.t("table.allTablesOccupiedOrInactive")}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-lg" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                    {tableT.t("table.selectTableToConnect")}
                  </p>
                  <p className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                    {tableT.t("table.youCanStartConversationDirectly")}
                  </p>
                </div>

                <div className="space-y-3">
                  {safeAvailableTables.map((table: any) => (
                    <div
                      key={table.id}
                      className="backdrop-blur-sm rounded-2xl p-6 border"
                      style={{
                        backgroundColor: "var(--mt-surface)",
                        borderColor: "var(--mt-secondary)",
                        borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">🍻</div>
                          <div>
                            <h3 className="text-xl font-bold" style={{ color: "var(--mt-text)" }}>
                              {tableT.t("table.table")} {table.number}
                            </h3>
                            <p style={{ color: "var(--mt-text)", opacity: 0.7 }}>{tableT.t("table.availableForChat")}</p>
                            <Badge
                              className="bg-green-500/20 text-green-400 border-green-500/30 mt-2"
                              style={{ backgroundColor: "var(--mt-primary)" }}
                            >
                              {tableT.t("table.active")}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleConnectWithTable(table)}
                          className="text-white py-3 rounded-xl font-medium"
                          style={{
                            background: `linear-gradient(135deg, var(--mt-secondary), var(--mt-primary))`,
                            borderRadius: `${themeConfig?.menuCustomization?.borderRadius || 12}px`,
                          }}
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          {tableT.t("table.connect")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Botones Personalizados */}
      <div className="px-4 py-4">
        <CustomButtonsDisplay barId={barId} className="justify-center" />
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-4">
        <p className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
          {chatsEnabled
            ? "Escanea el tag NFC de tu mesa para unirte al chat"
            : "Escanea el tag NFC de tu mesa para hacer pedidos"}
        </p>
        {(themeConfig as any)?.branding?.showPoweredBy && (
          <p className="text-xs mt-2" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
            Powered by Gibra Company
          </p>
        )}
      </div>

      <TableOrderModal
        isOpen={showOrderModal && shouldRenderModals}
        onClose={() => setShowOrderModal(false)}
        barId={barId}
        tableId={tableId}
        tableNumber={currentTable?.name || tableNumber}
        onOrderCreated={handleOrderCreated}
      />

      {shouldRenderModals && (
        <ChatMenuModal
          isOpen={showMenuModal}
          onClose={() => setShowMenuModal(false)}
          barId={barId}
          tableId={getTargetTableInfo()?.id || tableId || ""}
          tableNumber={getTargetTableInfo()?.number || currentTable?.name || tableNumber || 1}
          senderTableId={tableId}
          senderTableNumber={currentTable?.name || tableNumber}
          onSendMenuItem={handleSendMenuItem}
        />
      )}

      {/* Formulario de Calificación de Servicio */}
      {showRatingForm && tableId && barId && tableNumber && (
        <ServiceRatingForm
          tableId={tableId}
          barId={barId}
          tableNumber={currentTable?.name || tableNumber}
          onClose={() => setShowRatingForm(false)}
        />
      )}

      {/* Modal de Anuncios */}
      <AnnouncementModal
        announcements={announcements.filter(a => a.isActive && a.showOnTable)}
        isOpen={showAnnouncement && announcements.filter(a => a.isActive && a.showOnTable).length > 0}
        onClose={() => setShowAnnouncement(false)}
      />
    </div>
  )
}
