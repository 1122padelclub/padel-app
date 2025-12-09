"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, MessageCircleOff } from "lucide-react"
import { useT } from "@/src/hooks/useTranslation"

interface ChatToggleControlProps {
  barId: string
}

export function ChatToggleControl({ barId }: ChatToggleControlProps) {
  const [chatsEnabled, setChatsEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useT()

  useEffect(() => {
    if (!barId) return

    const barRef = doc(db, "bars", barId)
    const unsubscribe = onSnapshot(barRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setChatsEnabled(data.chatsEnabled !== false) // Por defecto true si no existe
      }
    })

    return () => unsubscribe()
  }, [barId])

  const handleToggleChats = async () => {
    if (!barId) return

    setLoading(true)
    setError(null)

    try {
      const barRef = doc(db, "bars", barId)
      await updateDoc(barRef, {
        chatsEnabled: !chatsEnabled,
        updatedAt: new Date(),
      })

      console.log("[v0] Chat status updated:", !chatsEnabled)
    } catch (err) {
      console.error("[v0] Error updating chat status:", err)
      setError(t("admin.errorUpdatingChatStatus"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-xl p-6 border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <MessageCircle className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{t("admin.liveChats")}</h3>
          <p className="text-sm text-muted-foreground">{t("admin.controlTableChatting")}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {chatsEnabled ? (
              <MessageCircle className="h-5 w-5 text-green-500" />
            ) : (
              <MessageCircleOff className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">{chatsEnabled ? t("admin.chatsActivated") : t("admin.chatsDeactivated")}</span>
          </div>
          <Badge variant={chatsEnabled ? "default" : "secondary"}>{chatsEnabled ? t("admin.active") : t("admin.inactive")}</Badge>
        </div>

        <Button
          onClick={handleToggleChats}
          disabled={loading}
          variant={chatsEnabled ? "destructive" : "default"}
          className="min-w-[120px]"
        >
          {loading ? t("admin.updating") : chatsEnabled ? t("admin.deactivate") : t("admin.activate")}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">{t("admin.howItWorks")}</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">•</span>
            <span>
              <strong>{t("admin.activated")}:</strong> {t("admin.chatsActivatedDescription")}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>
              <strong>{t("admin.deactivated")}:</strong> {t("admin.chatsDeactivatedDescription")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
