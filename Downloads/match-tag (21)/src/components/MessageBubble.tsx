"use client"

// import { format } from "date-fns"
// import { es } from "date-fns/locale"
import type { Message } from "@/src/types"
import { Card } from "@/components/ui/card"

interface MessageBubbleProps {
  message: Message
  currentTableId: string
}

const formatTime = (date: Date | any) => {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function MessageBubble({ message, currentTableId }: MessageBubbleProps) {
  const isOwnMessage = message.senderTable === currentTableId
  const isOrder = message.type === "order"

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%]`}>
        <Card
          className={`p-3 rounded-2xl ${
            isOwnMessage
              ? isOrder
                ? "bg-primary/10 border-primary"
                : "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {message.type === "text" && <p className="text-sm">{message.text}</p>}

          {message.type === "gif" && (
            <div className="rounded-xl overflow-hidden">
              <img src={message.text || "/placeholder.svg"} alt="GIF" className="max-w-full h-auto" />
            </div>
          )}

          {message.type === "order" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Pedido realizado</p>
              <p className="text-xs opacity-80">{message.text}</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-2 text-xs opacity-70">
            <span>Mesa {message.senderTableNumber}</span>
            <span>{formatTime(message.timestamp || message.createdAt)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
