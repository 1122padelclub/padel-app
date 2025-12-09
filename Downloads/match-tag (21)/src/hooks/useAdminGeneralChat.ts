"use client"

import { useState, useEffect } from "react"
import { ref, push, onValue, off, serverTimestamp, set, remove } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import type { GeneralChatMessage, GeneralChatUser, BannedChatUser } from "@/src/types"

export function useAdminGeneralChat(barId: string) {
  const [messages, setMessages] = useState<GeneralChatMessage[]>([])
  const [users, setUsers] = useState<GeneralChatUser[]>([])
  const [bannedUsers, setBannedUsers] = useState<BannedChatUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Escuchar mensajes
  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)

    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        try {
          const messagesData: GeneralChatMessage[] = []

          if (snapshot.exists()) {
            const data = snapshot.val()
            Object.entries(data).forEach(([id, messageData]: [string, any]) => {
              messagesData.push({
                id,
                ...messageData,
                timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
                createdAt: messageData.createdAt ? new Date(messageData.createdAt) : new Date()
              })
            })

            // Ordenar por timestamp
            messagesData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          }

          setMessages(messagesData)
          setError(null)
          setLoading(false)
        } catch (err: any) {
          console.error("Error processing general chat messages:", err)
          setError(err.message)
          setLoading(false)
        }
      },
      (err) => {
        console.error("Error loading general chat messages:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => {
      off(messagesRef)
    }
  }, [barId])

  // Escuchar usuarios activos
  useEffect(() => {
    if (!barId) return

    const usersRef = ref(realtimeDb, `generalChat/${barId}/users`)

    const unsubscribe = onValue(usersRef, (snapshot) => {
      try {
        const usersData: GeneralChatUser[] = []

        console.log("useAdminGeneralChat - Users snapshot:", snapshot.exists() ? snapshot.val() : "No data")

        if (snapshot.exists()) {
          const data = snapshot.val()
          Object.entries(data).forEach(([id, userData]: [string, any]) => {
            usersData.push({
              id,
              ...userData,
              joinedAt: userData.joinedAt ? new Date(userData.joinedAt) : new Date(),
              lastActive: userData.lastActive ? new Date(userData.lastActive) : new Date()
            })
          })
        }

        console.log("useAdminGeneralChat - Processed users:", usersData)
        setUsers(usersData)
      } catch (err: any) {
        console.error("Error processing general chat users:", err)
      }
    })

    return () => {
      off(usersRef)
    }
  }, [barId])

  // Escuchar usuarios baneados
  useEffect(() => {
    if (!barId) return

    const bannedRef = ref(realtimeDb, `generalChat/${barId}/banned`)

    const unsubscribe = onValue(bannedRef, (snapshot) => {
      try {
        const bannedData: BannedChatUser[] = []

        if (snapshot.exists()) {
          const data = snapshot.val()
          Object.entries(data).forEach(([id, banData]: [string, any]) => {
            bannedData.push({
              id,
              ...banData,
              bannedAt: banData.bannedAt ? new Date(banData.bannedAt) : new Date()
            })
          })
        }

        setBannedUsers(bannedData)
      } catch (err: any) {
        console.error("Error processing banned users:", err)
      }
    })

    return () => {
      off(bannedRef)
    }
  }, [barId])

  // Enviar anuncio como admin
  const sendAdminAnnouncement = async (message: string) => {
    if (!barId || !message.trim()) return

    try {
      const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)
      const newMessageRef = push(messagesRef)

      const messageData = {
        barId,
        userId: "admin",
        username: "Administrador",
        isAnonymous: false,
        message: message.trim(),
        type: "admin",
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      }

      await set(newMessageRef, messageData)
      return true
    } catch (err: any) {
      console.error("Error sending admin announcement:", err)
      setError(err.message)
      return false
    }
  }

  // Bannear usuario
  const banUser = async (user: GeneralChatUser, reason?: string) => {
    if (!barId || !user) return

    try {
      // Agregar a lista de baneados
      const bannedRef = ref(realtimeDb, `generalChat/${barId}/banned/${user.id}`)
      await set(bannedRef, {
        barId,
        tableId: user.tableId,
        tableNumber: user.tableNumber,
        username: user.username,
        reason: reason || "Violación de las normas del chat",
        bannedAt: serverTimestamp(),
        bannedBy: "admin"
      })

      // Remover de usuarios activos
      const userRef = ref(realtimeDb, `generalChat/${barId}/users/${user.id}`)
      await remove(userRef)

      // Enviar mensaje del sistema
      const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)
      const newMessageRef = push(messagesRef)
      await set(newMessageRef, {
        barId,
        userId: "system",
        username: "Sistema",
        isAnonymous: false,
        message: `${user.username} ha sido expulsado del chat por el administrador`,
        type: "system",
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      })

      return true
    } catch (err: any) {
      console.error("Error banning user:", err)
      setError(err.message)
      return false
    }
  }

  // Desbanear usuario
  const unbanUser = async (bannedUserId: string) => {
    if (!barId || !bannedUserId) return

    try {
      const bannedRef = ref(realtimeDb, `generalChat/${barId}/banned/${bannedUserId}`)
      await remove(bannedRef)
      return true
    } catch (err: any) {
      console.error("Error unbanning user:", err)
      setError(err.message)
      return false
    }
  }

  // Verificar si un usuario está baneado
  const isUserBanned = (userId: string): boolean => {
    return bannedUsers.some(banned => banned.id === userId)
  }

  // Limpiar mensajes antiguos (opcional)
  const clearMessages = async () => {
    if (!barId) return

    try {
      const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)
      await set(messagesRef, null)
      return true
    } catch (err: any) {
      console.error("Error clearing messages:", err)
      setError(err.message)
      return false
    }
  }

  return {
    messages,
    users,
    bannedUsers,
    loading,
    error,
    sendAdminAnnouncement,
    banUser,
    unbanUser,
    isUserBanned,
    clearMessages
  }
}
