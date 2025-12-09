"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UsersRound } from "lucide-react"
import { useT } from "@/src/hooks/useTranslation"

interface GeneralChatToggleControlProps {
  barId: string
}

export function GeneralChatToggleControl({ barId }: GeneralChatToggleControlProps) {
  const [generalChatEnabled, setGeneralChatEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useT()

  useEffect(() => {
    if (!barId) return

    const barRef = doc(db, "bars", barId)
    const unsubscribe = onSnapshot(barRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setGeneralChatEnabled(data.generalChatEnabled === true) // Por defecto false si no existe
      }
    })

    return () => unsubscribe()
  }, [barId])

  const handleToggleGeneralChat = async () => {
    if (!barId) return

    setLoading(true)
    setError(null)

    try {
      const barRef = doc(db, "bars", barId)
      await updateDoc(barRef, {
        generalChatEnabled: !generalChatEnabled,
        updatedAt: new Date(),
      })

      console.log("[v0] General chat status updated:", !generalChatEnabled)
    } catch (err) {
      console.error("[v0] Error updating general chat status:", err)
      setError(t("admin.errorUpdatingGeneralChatStatus"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-xl p-6 border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Users className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{t("admin.generalChat")}</h3>
          <p className="text-sm text-muted-foreground">{t("admin.publicChatDescription")}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {generalChatEnabled ? (
              <UsersRound className="h-5 w-5 text-green-500" />
            ) : (
              <Users className="h-5 w-5 text-gray-500" />
            )}
            <span className="font-medium">{generalChatEnabled ? t("admin.generalChatActivated") : t("admin.generalChatDeactivated")}</span>
          </div>
          <Badge variant={generalChatEnabled ? "default" : "secondary"}>{generalChatEnabled ? t("admin.active") : t("admin.inactive")}</Badge>
        </div>

        <Button
          onClick={handleToggleGeneralChat}
          disabled={loading}
          variant={generalChatEnabled ? "destructive" : "default"}
          className="min-w-[120px]"
        >
          {loading ? t("admin.updating") : generalChatEnabled ? t("admin.deactivate") : t("admin.activate")}
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
              <strong>{t("admin.activated")}:</strong> {t("admin.generalChatActivatedDescription")}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">•</span>
            <span>
              <strong>{t("admin.participation")}:</strong> {t("admin.participationDescription")}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>
              <strong>{t("admin.deactivated")}:</strong> {t("admin.generalChatDeactivatedDescription")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}





