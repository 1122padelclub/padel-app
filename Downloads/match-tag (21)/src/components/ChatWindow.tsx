"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@/src/hooks/useChat"
import { MessageBubble } from "./MessageBubble"
import { MenuSheet } from "./MenuSheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ChatWindowProps {
  tableId: string
  barId: string
}

const EMOJIS = ["😀", "😂", "😍", "👍", "👏", "🔥", "❤️", "🎉", "🍺", "🍕", "🍔", "🥤"]

const GIFS = [
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif",
]

export function ChatWindow({ tableId, barId }: ChatWindowProps) {
  const { messages, loading, sendMessage } = useChat(tableId, barId)
  const [newMessage, setNewMessage] = useState("")
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const [isGifOpen, setIsGifOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    await sendMessage(newMessage)
    setNewMessage("")
  }

  const handleEmojiClick = async (emoji: string) => {
    await sendMessage(emoji)
    setIsEmojiOpen(false)
  }

  const handleGifClick = async (gifUrl: string) => {
    await sendMessage(gifUrl, "gif")
    setIsGifOpen(false)
  }

  const handleOrderCreated = async (orderId: string, orderSummary: string) => {
    await sendMessage(orderSummary, "order")
  }

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg">Chat Mesa {tableId}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>¡Bienvenido! Inicia la conversación</p>
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex gap-1">
              <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl bg-transparent">
                    😀
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 rounded-2xl">
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmojiClick(emoji)}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={isGifOpen} onOpenChange={setIsGifOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl bg-transparent">
                    GIF
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2 rounded-2xl">
                  <div className="grid grid-cols-2 gap-2">
                    {GIFS.map((gif, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleGifClick(gif)}
                        className="rounded-xl overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={gif || "/placeholder.svg"}
                          alt={`GIF ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <MenuSheet barId={barId} tableId={tableId} onOrderCreated={handleOrderCreated}>
                <Button type="button" variant="outline" size="sm" className="rounded-xl bg-transparent">
                  🍽️
                </Button>
              </MenuSheet>
            </div>

            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-xl"
            />
            <Button type="submit" className="rounded-xl">
              Enviar
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
