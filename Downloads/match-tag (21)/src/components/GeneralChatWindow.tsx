"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGeneralChat } from "@/src/hooks/useGeneralChat"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useT } from "@/src/hooks/useTranslation"
import { useTableT } from "@/src/hooks/useTableTranslation"
import { ref, set, serverTimestamp } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"

interface GeneralChatWindowProps {
  barId: string
  tableId: string
  tableNumber: number
  isOpen: boolean
  onClose: () => void
}

export function GeneralChatWindow({
  barId,
  tableId,
  tableNumber,
  isOpen,
  onClose
}: GeneralChatWindowProps) {
  const t = useT()
  const tableT = useTableT()
  const [message, setMessage] = useState("")
  const [showJoinDialog, setShowJoinDialog] = useState(true)
  const [username, setUsername] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    users,
    currentUser,
    loading,
    isBanned,
    joinChat,
    sendMessage,
    leaveChat
  } = useGeneralChat(barId, tableId, tableNumber)

  // Verificar si el usuario ya se unió antes
  useEffect(() => {
    const storedUsername = localStorage.getItem(`generalChat_username_${barId}_${tableId}`)
    if (storedUsername && isOpen) {
      const storedIsAnonymous = localStorage.getItem(`generalChat_isAnonymous_${barId}_${tableId}`) === "true"
      const storedAvatar = localStorage.getItem(`generalChat_avatar_${barId}_${tableId}`)
      setUsername(storedUsername)
      setIsAnonymous(storedIsAnonymous)
      setSelectedAvatar(storedAvatar || "")
      joinChat(storedUsername, storedIsAnonymous, storedAvatar || undefined)
      setShowJoinDialog(false)
    }
  }, [barId, tableId, isOpen, joinChat])

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Cleanup al cerrar
  useEffect(() => {
    return () => {
      if (!isOpen) {
        leaveChat()
      }
    }
  }, [isOpen])

  // Heartbeat para mantener usuarios activos
  useEffect(() => {
    if (!barId || !currentUser || !isOpen) return

    const heartbeatInterval = setInterval(async () => {
      try {
        // Actualizar lastActive del usuario actual
        const userRef = ref(realtimeDb, `generalChat/${barId}/users/${currentUser.id}`)
        await set(userRef, {
          ...currentUser,
          lastActive: serverTimestamp()
        })
      } catch (err) {
        console.error("Error updating heartbeat:", err)
      }
    }, 30000) // Cada 30 segundos

    return () => clearInterval(heartbeatInterval)
  }, [barId, currentUser, isOpen])

  const handleJoinChat = async () => {
    if (!username.trim() && !isAnonymous) {
      alert(t("chat.enterUsername"))
      return
    }

    console.log("🔍 [DEBUG] GeneralChatWindow - handleJoinChat:", {
      username: username || `Mesa ${tableNumber}`,
      isAnonymous
    })

    const success = await joinChat(username || `Mesa ${tableNumber}`, isAnonymous)
    if (success) {
      setShowJoinDialog(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const success = await sendMessage(message)
    if (success) {
      setMessage("")
    }
  }

  const handleClose = () => {
    leaveChat()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Diálogo de unirse al chat */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {tableT.t("generalChat.joinGeneralChat")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {tableT.t("generalChat.howDoYouWantToAppear")}
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!isAnonymous ? "default" : "outline"}
                  onClick={() => setIsAnonymous(false)}
                  className="flex-1"
                >
                  {tableT.t("generalChat.withName")}
                </Button>
                <Button
                  type="button"
                  variant={isAnonymous ? "default" : "outline"}
                  onClick={() => setIsAnonymous(true)}
                  className="flex-1"
                >
                  {tableT.t("generalChat.anonymous")}
                </Button>
              </div>
            </div>

            {!isAnonymous && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    {tableT.t("generalChat.username")}
                  </label>
                  <Input
                    id="username"
                    placeholder={tableT.t("generalChat.usernamePlaceholder")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={20}
                  />
                </div>
                
              </div>
            )}

            <Button 
              onClick={handleJoinChat} 
              className="w-full"
            >
              {tableT.t("generalChat.joinChat")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ventana del chat */}
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl h-[600px] flex flex-col">
          <CardHeader className="border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {tableT.t("generalChat.generalChat")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {users.length} {tableT.t("generalChat.online")}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{tableT.t("generalChat.loadingMessages")}</p>
              </div>
            ) : isBanned ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <p className="text-red-600 font-semibold">{tableT.t("generalChat.youHaveBeenBanned")}</p>
                  <p className="text-sm text-muted-foreground">
                    {tableT.t("generalChat.bannedByAdmin")}
                  </p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {tableT.t("generalChat.noMessagesYet")}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                // Debug: Log message information
                if (msg.type === "text") {
                  console.log(`Message from ${msg.username}:`, {
                    userId: msg.userId,
                    tableNumber: msg.tableNumber
                  })
                }
                return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.type === "system" || msg.type === "admin"
                      ? "items-center"
                      : msg.userId === currentUser?.id
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  {msg.type === "system" ? (
                    <div className="text-xs text-muted-foreground italic bg-muted px-3 py-1 rounded-full">
                      {msg.message}
                    </div>
                  ) : msg.type === "admin" ? (
                    <div className="w-full max-w-[80%] bg-purple-100 border-l-4 border-purple-500 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-purple-600 text-white text-xs">
                          {tableT.t("generalChat.administrator")}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-purple-900">{msg.message}</p>
                      <span className="text-xs text-purple-700 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        msg.userId === currentUser?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">
                          {msg.username}
                        </span>
                        {msg.tableNumber && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {tableT.t("table.table")} {msg.tableNumber}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm break-words">{msg.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  )}
                </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder={isBanned ? tableT.t("generalChat.youAreBanned") : tableT.t("chat.typeMessage")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                disabled={showJoinDialog || isBanned}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || showJoinDialog || isBanned}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

    </>
  )
}
