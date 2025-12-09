"use client"

import { useState, useEffect, useCallback } from "react"
import { ref, push, onValue, off, serverTimestamp, set } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import type { GeneralChatMessage, GeneralChatUser } from "@/src/types"
import { useTableT } from "./useTableTranslation"

export function useGeneralChat(barId: string, tableId: string, tableNumber: number) {
  const tableT = useTableT()
  const [messages, setMessages] = useState<GeneralChatMessage[]>([])
  const [users, setUsers] = useState<GeneralChatUser[]>([])
  const [currentUser, setCurrentUser] = useState<GeneralChatUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBanned, setIsBanned] = useState(false)

  // Inicializar usuario
  useEffect(() => {
    if (!barId || !tableId) return

    const userId = `${tableId}-${Date.now()}`
    const storedUsername = localStorage.getItem(`generalChat_username_${barId}_${tableId}`)
    const storedIsAnonymous = localStorage.getItem(`generalChat_isAnonymous_${barId}_${tableId}`)
    const storedAvatar = localStorage.getItem(`generalChat_avatar_${barId}_${tableId}`)

    const user: GeneralChatUser = {
      id: userId,
      barId,
      tableId,
      tableNumber,
      username: storedUsername || `Mesa ${tableNumber}`,
      isAnonymous: storedIsAnonymous === "true",
      avatar: storedAvatar || null,
      joinedAt: new Date(),
      lastActive: new Date()
    }

    setCurrentUser(user)
  }, [barId, tableId, tableNumber])

  // Verificar si el usuario está baneado
  useEffect(() => {
    if (!barId || !currentUser) return

    const bannedRef = ref(realtimeDb, `generalChat/${barId}/banned`)

    const unsubscribe = onValue(bannedRef, (snapshot) => {
      if (snapshot.exists()) {
        const bannedData = snapshot.val()
        // Verificar si el usuario actual está baneado por tableId
        const banned = Object.values(bannedData).some(
          (ban: any) => ban.tableId === currentUser.tableId || ban.id === currentUser.id
        )
        setIsBanned(banned)
        
        if (banned) {
          setError("Has sido expulsado del chat por el administrador")
        }
      } else {
        setIsBanned(false)
      }
    })

    return () => {
      off(bannedRef)
    }
  }, [barId, currentUser])

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
                avatar: messageData.avatar || null,
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
        const now = Date.now()
        const INACTIVE_THRESHOLD = 5 * 60 * 1000 // 5 minutos

        if (snapshot.exists()) {
          const data = snapshot.val()
          Object.entries(data).forEach(([id, userData]: [string, any]) => {
            if (userData === null) return
            
            const lastActive = userData.lastActive ? new Date(userData.lastActive).getTime() : 0
            const isActive = (now - lastActive) < INACTIVE_THRESHOLD
            
            // Si el usuario está inactivo, eliminarlo de Firebase
            if (!isActive) {
              const userRef = ref(realtimeDb, `generalChat/${barId}/users/${id}`)
              set(userRef, null).catch(console.error)
              return
            }
            
            usersData.push({
              id,
              ...userData,
              joinedAt: userData.joinedAt ? new Date(userData.joinedAt) : new Date(),
              lastActive: userData.lastActive ? new Date(userData.lastActive) : new Date()
            })
          })
        }

        setUsers(usersData)
      } catch (err: any) {
        console.error("Error processing general chat users:", err)
      }
    })

    return () => {
      off(usersRef)
    }
  }, [barId])

  // Registrar usuario al unirse
  const joinChat = useCallback(async (username: string, isAnonymous: boolean) => {
    if (!barId || !currentUser) return

    try {
      console.log("🔍 [DEBUG] Joining chat with:", {
        username,
        isAnonymous
      })

      const userRef = ref(realtimeDb, `generalChat/${barId}/users/${currentUser.id}`)
      await set(userRef, {
        barId,
        tableId: currentUser.tableId,
        tableNumber: currentUser.tableNumber,
        username: isAnonymous ? `Anónimo ${currentUser.tableNumber}` : username,
        isAnonymous,
        joinedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      })

      // Guardar preferencias en localStorage con clave única por mesa
      localStorage.setItem(`generalChat_username_${barId}_${tableId}`, username)
      localStorage.setItem(`generalChat_isAnonymous_${barId}_${tableId}`, isAnonymous.toString())

      // Actualizar usuario actual
      const updatedUser = {
        ...currentUser,
        username: isAnonymous ? `Anónimo ${currentUser.tableNumber}` : username,
        isAnonymous
      }
      
      console.log("🔍 [DEBUG] Updated currentUser:", {
        username: updatedUser.username,
        isAnonymous: updatedUser.isAnonymous
      })
      
      setCurrentUser(updatedUser)

      // Enviar mensaje de sistema
      await sendSystemMessage(`${isAnonymous ? `${tableT.t("generalChat.anonymous")} ${currentUser.tableNumber}` : username} ${tableT.t("generalChat.joinedChat")}`)

      return true
    } catch (err: any) {
      console.error("Error joining general chat:", err)
      setError(err.message)
      return false
    }
  }, [barId, currentUser, tableT])

  // Enviar mensaje
  const sendMessage = useCallback(async (message: string) => {
    if (!barId || !currentUser || !message.trim()) return

    try {
      console.log("🔍 [DEBUG] Sending message with currentUser:", {
        username: currentUser.username,
        userId: currentUser.id,
        tableNumber: currentUser.tableNumber
      })

      const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)
      const newMessageRef = push(messagesRef)

      const messageData: Omit<GeneralChatMessage, "id"> = {
        barId,
        userId: currentUser.id,
        username: currentUser.username,
        isAnonymous: currentUser.isAnonymous,
        tableNumber: currentUser.tableNumber,
        message: message.trim(),
        type: "text",
        timestamp: new Date(),
        createdAt: new Date()
      }

      console.log("Message data being sent:", {
        username: messageData.username,
        tableNumber: messageData.tableNumber
      })

      await set(newMessageRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      })

      // Actualizar última actividad del usuario
      const userRef = ref(realtimeDb, `generalChat/${barId}/users/${currentUser.id}`)
      await set(userRef, {
        ...currentUser,
        lastActive: serverTimestamp()
      })

      return true
    } catch (err: any) {
      console.error("Error sending message to general chat:", err)
      setError(err.message)
      return false
    }
  }, [barId, currentUser])

  // Enviar mensaje de sistema
  const sendSystemMessage = async (message: string) => {
    if (!barId) return

    try {
      const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)
      const newMessageRef = push(messagesRef)

      const messageData = {
        barId,
        userId: "system",
        username: "Sistema",
        isAnonymous: false,
        message: message.trim(),
        type: "system",
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      }

      await set(newMessageRef, messageData)
    } catch (err: any) {
      console.error("Error sending system message:", err)
    }
  }

  // Salir del chat
  const leaveChat = async () => {
    if (!barId || !currentUser) return

    try {
      // Enviar mensaje de sistema
      await sendSystemMessage(`${currentUser.username} ${tableT.t("generalChat.leftChat")}`)

      // Eliminar usuario de la lista
      const userRef = ref(realtimeDb, `generalChat/${barId}/users/${currentUser.id}`)
      await set(userRef, null)
    } catch (err: any) {
      console.error("Error leaving general chat:", err)
    }
  }

  return {
    messages,
    users,
    currentUser,
    loading,
    error,
    isBanned,
    joinChat,
    sendMessage,
    leaveChat
  }
}
