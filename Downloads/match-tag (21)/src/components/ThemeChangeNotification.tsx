"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, RefreshCw, X } from "lucide-react"

interface ThemeChangeNotificationProps {
  barId?: string
}

export default function ThemeChangeNotification({ barId }: ThemeChangeNotificationProps) {
  const [showNotification, setShowNotification] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  useEffect(() => {
    if (!barId || typeof window === "undefined") return

    let channel: BroadcastChannel | null = null

    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(`bar-updates-${barId}`)

        const handleMessage = (event: MessageEvent) => {
          try {
            if (event.data.type === "THEME_UPDATED" && event.data.barId === barId) {
              const updateTime = event.data.timestamp
              if (!lastUpdate || updateTime > lastUpdate) {
                setLastUpdate(updateTime)
                setShowNotification(true)
              }
            }
          } catch (error) {
            console.error("Error handling broadcast message:", error)
          }
        }

        channel.addEventListener("message", handleMessage)

        return () => {
          if (channel) {
            channel.removeEventListener("message", handleMessage)
            channel.close()
          }
        }
      }
    } catch (error) {
      console.error("BroadcastChannel not supported or error:", error)
    }

    return () => {
      if (channel) {
        channel.close()
      }
    }
  }, [barId, lastUpdate])

  const handleReload = () => {
    window.location.reload()
  }

  const handleDismiss = () => {
    setShowNotification(false)
  }

  if (!showNotification) {
    return null
  }

  return (
    <Alert className="border-green-500/50 bg-green-500/10 fixed top-4 right-4 max-w-md z-50 shadow-lg">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium mb-1">Configuración actualizada</div>
          <div className="text-sm opacity-80">Se han aplicado cambios al tema. Recarga para ver los cambios.</div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button size="sm" onClick={handleReload}>
            <RefreshCw className="w-3 h-3" />
            Recargar
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
