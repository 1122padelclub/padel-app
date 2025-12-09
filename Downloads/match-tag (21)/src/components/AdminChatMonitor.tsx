"use client"

import { useState, useEffect } from "react"
import { ref, onValue, off, remove } from "@/src/services/firebaseExtras"
import { realtimeDb } from "@/src/services/firebaseExtras"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useT } from "@/src/hooks/useTranslation"

interface AdminChatMonitorProps {
  barId: string
}

interface ChatSummary {
  chatId: string
  tableNumbers: number[]
  messageCount: number
  lastActivity: Date
  lastMessage: string
}

export function AdminChatMonitor({ barId }: AdminChatMonitorProps) {
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([])
  const [loading, setLoading] = useState(true)
  const t = useT()

  useEffect(() => {
    if (!barId) return

    console.log("[v0] AdminChatMonitor iniciando para barId:", barId)
    setLoading(true)

    // Intentar múltiples rutas para encontrar chats
    const possiblePaths = [
      `chats/${barId}`,
      `bars/${barId}/chats`,
      `chats`,
      `bars/${barId}/tableChats`
    ]

    let unsubscribeFunctions: (() => void)[] = []

    possiblePaths.forEach((path, index) => {
      console.log(`[v0] AdminChatMonitor: Intentando ruta ${index + 1}:`, path)
      const chatsRef = ref(realtimeDb, path)
      
      const unsubscribe = onValue(chatsRef, async (snapshot) => {
        const chatsData = snapshot.val()
        console.log(`[v0] AdminChatMonitor: Datos de chats recibidos de ruta ${path}:`, chatsData)

        if (chatsData) {
          const summaries: ChatSummary[] = []

          for (const [chatId, chatData] of Object.entries(chatsData) as [string, any][]) {
            if (chatData.isActive && chatData.tableNumbers) {
              // Contar mensajes en este chat
              const messagesRef = ref(realtimeDb, `messages/${barId}/${chatId}`)
              const messagesSnapshot = await new Promise<any>((resolve) => {
                onValue(messagesRef, resolve, { onlyOnce: true })
              })

              const messagesData = messagesSnapshot.val()
              const messageCount = messagesData ? Object.keys(messagesData).length : 0

              summaries.push({
                chatId,
                tableNumbers: chatData.tableNumbers || [],
                messageCount,
                lastActivity: chatData.lastMessageAt ? new Date(chatData.lastMessageAt) : new Date(chatData.createdAt),
                lastMessage: chatData.lastMessage || t("common.noMessages"),
              })
            }
          }

          // Ordenar por última actividad
          summaries.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
          setChatSummaries(summaries)
          console.log(`[v0] AdminChatMonitor: Chats activos encontrados en ruta ${path}:`, summaries.length)
        } else {
          setChatSummaries([])
          console.log(`[v0] AdminChatMonitor: No hay chats activos en ruta ${path}`)
        }
        setLoading(false)
      })

      unsubscribeFunctions.push(() => off(chatsRef, "value"))
    })

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
    }
  }, [barId])

  const handleClearChat = async (chatId: string) => {
    try {
      console.log("[v0] Limpiando chat:", chatId)

      const messagesRef = ref(realtimeDb, `messages/${barId}/${chatId}`)
      const chatRef = ref(realtimeDb, `chats/${barId}/${chatId}`)

      await Promise.all([remove(messagesRef), remove(chatRef)])

      setChatSummaries(chatSummaries.filter((summary) => summary.chatId !== chatId))
      console.log("[v0] Chat eliminado exitosamente")
    } catch (error) {
      console.error("[v0] Error clearing chat:", error)
      alert(t("admin.errorClearingChat"))
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-serif">{t("admin.chatMonitor")}</CardTitle>
        <CardDescription>{t("admin.superviseAndManageChats")}</CardDescription>
      </CardHeader>
      <CardContent>
        {chatSummaries.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>{t("admin.noActiveChats")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatSummaries.map((summary) => (
              <Card key={summary.chatId} className="rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {t("admin.table")} {summary.tableNumbers[0]} ↔ {t("admin.table")} {summary.tableNumbers[1]}
                    </CardTitle>
                    <Badge variant="secondary" className="rounded-lg">
                      {summary.messageCount} {t("admin.messages")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{t("admin.last")} {summary.lastMessage}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="rounded-lg">
                          {t("admin.resetChat")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("admin.resetChatConfirm")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("admin.resetChatDescription", { 
                              table1: summary.tableNumbers[0], 
                              table2: summary.tableNumbers[1] 
                            })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">{t("admin.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleClearChat(summary.chatId)}
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("admin.resetChat")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
