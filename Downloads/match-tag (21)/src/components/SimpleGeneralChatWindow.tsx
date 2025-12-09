"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSimpleGeneralChat } from "@/src/hooks/useSimpleGeneralChat"
import { useTableT } from "@/src/hooks/useTableTranslation"

interface SimpleGeneralChatWindowProps {
  barId: string
  tableId: string
  tableNumber: number
  isOpen: boolean
  onClose: () => void
}

const AVATARS = ["👤", "🐱", "🐶", "🐰", "🐸", "🐨", "🐼", "🦊", "🐻", "🦁", "🐯", "🐮", "🐷", "🐙", "🦋", "🐝", "🦄", "🐲", "👻", "🤖", "👽", "🎭", "🎪", "🎨"]

export function SimpleGeneralChatWindow({
  barId,
  tableId,
  tableNumber,
  isOpen,
  onClose
}: SimpleGeneralChatWindowProps) {
  const tableT = useTableT()
  const [message, setMessage] = useState("")
  const [showJoinDialog, setShowJoinDialog] = useState(true)
  const [username, setUsername] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("👤")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    users,
    currentUser,
    loading,
    error,
    joinChat,
    sendMessage,
    leaveChat
  } = useSimpleGeneralChat(barId, tableId, tableNumber)

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
  }, [isOpen, leaveChat])

  const handleJoinChat = async () => {
    if (!username.trim() && !isAnonymous) {
      alert("Por favor ingresa un nombre de usuario")
      return
    }

    console.log("🔍 [SIMPLE] Joining with:", { username, selectedAvatar, isAnonymous })

    const success = await joinChat(
      username || `Mesa ${tableNumber}`, 
      selectedAvatar, 
      isAnonymous
    )
    
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

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-2xl max-w-md border">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando chat...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      {/* Modal de unirse */}
      <Dialog open={isOpen && showJoinDialog} onOpenChange={onClose}>
        <DialogContent className="rounded-2xl max-w-md border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Unirse al Chat General
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">¿Cómo quieres aparecer?</label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={!isAnonymous ? "default" : "outline"}
                  onClick={() => setIsAnonymous(false)}
                  className="flex-1"
                >
                  Con nombre
                </Button>
                <Button
                  type="button"
                  variant={isAnonymous ? "default" : "outline"}
                  onClick={() => setIsAnonymous(true)}
                  className="flex-1"
                >
                  Anónimo
                </Button>
              </div>
            </div>

            {!isAnonymous && (
              <div>
                <label className="text-sm font-medium">Nombre de usuario</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre"
                  maxLength={20}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Avatar *</label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedAvatar === avatar
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{avatar}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleJoinChat} className="w-full" disabled={!selectedAvatar}>
              Unirse al Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ventana del chat */}
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Chat General</CardTitle>
              <Badge variant="secondary">{users.length} en línea</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.type === "system"
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
                    ) : (
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          msg.userId === currentUser?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{msg.avatar}</span>
                          <span className="text-xs font-semibold">{msg.username}</span>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            Mesa {msg.tableNumber}
                          </Badge>
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
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  disabled={!currentUser}
                />
                <Button type="submit" disabled={!message.trim() || !currentUser}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
