"use client"

import { useState, useEffect, useCallback } from "react"
import { ref, push, onValue, off, serverTimestamp, set } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import type { GeneralChatMessage, GeneralChatUser } from "@/src/types"

interface SimpleChatUser {
  id: string
  username: string
  avatar: string
  tableNumber: number
  isAnonymous: boolean
  joinedAt: Date
}

interface SimpleChatMessage {
  id: string
  userId: string
  username: string
  avatar: string
  message: string
  timestamp: Date
  type: 'text' | 'system'
}

export function useSimpleGeneralChat(barId: string, tableId: string, tableNumber: number) {
  const [messages, setMessages] = useState<SimpleChatMessage[]>([])
  const [users, setUsers] = useState<SimpleChatUser[]>([])
  const [currentUser, setCurrentUser] = useState<SimpleChatUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inicializar usuario
  useEffect(() => {
    if (!barId || !tableId) return

    const userId = `${tableId}-${Date.now()}`
    const user: SimpleChatUser = {
      id: userId,
      username: `Mesa ${tableNumber}`,
      avatar: "👤", // Avatar por defecto
      tableNumber,
      isAnonymous: true,
      joinedAt: new Date()
    }

    setCurrentUser(user)
    setLoading(false)
  }, [barId, tableId, tableNumber])

  // Cargar mensajes
  useEffect(() => {
    if (!barId || !currentUser) return

    const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val()
        const messagesList: SimpleChatMessage[] = Object.entries(messagesData).map(([id, msg]: [string, any]) => ({
          id,
          userId: msg.userId,
          username: msg.username,
          avatar: msg.avatar || "👤",
          message: msg.message,
          timestamp: new Date(msg.timestamp),
          type: msg.type || 'text'
        }))
        
        setMessages(messagesList.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()))
      } else {
        setMessages([])
      }
    })

    return () => off(messagesRef)
  }, [barId, currentUser])

  // Cargar usuarios
  useEffect(() => {
    if (!barId) return

    const usersRef = ref(realtimeDb, `generalChat/${barId}/users`)
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val()
        const usersList: SimpleChatUser[] = Object.entries(usersData)
          .filter(([_, user]: [string, any]) => user !== null)
          .map(([id, user]: [string, any]) => ({
            id,
            username: user.username,
            avatar: user.avatar || "👤",
            tableNumber: user.tableNumber,
            isAnonymous: user.isAnonymous,
            joinedAt: new Date(user.joinedAt)
          }))
        
        setUsers(usersList)
      } else {
        setUsers([])
      }
    })

    return () => off(usersRef)
  }, [barId])

  // Unirse al chat
  const joinChat = useCallback(async (username: string, avatar: string, isAnonymous: boolean = false) => {
    if (!barId || !currentUser) return false

    try {
      console.log("🔍 [SIMPLE] Joining chat:", { username, avatar, isAnonymous })

      const updatedUser = {
        ...currentUser,
        username: isAnonymous ? `Anónimo ${tableNumber}` : username,
        avatar,
        isAnonymous
      }

      setCurrentUser(updatedUser)

      // Guardar en Firebase
      const userRef = ref(realtimeDb, `generalChat/${barId}/users/${currentUser.id}`)
      await set(userRef, {
        ...updatedUser,
        joinedAt: serverTimestamp()
      })

      // Enviar mensaje de sistema
      await sendSystemMessage(`${updatedUser.username} se unió al chat`)

      return true
    } catch (err: any) {
      console.error("Error joining chat:", err)
      setError(err.message)
      return false
    }
  }, [barId, currentUser, tableNumber])

  // Enviar mensaje
  const sendMessage = useCallback(async (message: string) => {
    if (!barId || !currentUser || !message.trim()) return false

    try {
      console.log("🔍 [SIMPLE] Sending message:", { 
        username: currentUser.username, 
        avatar: currentUser.avatar,
        message 
      })

      const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)
      const newMessageRef = push(messagesRef)

      await set(newMessageRef, {
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        message: message.trim(),
        timestamp: serverTimestamp(),
        type: 'text'
      })

      return true
    } catch (err: any) {
      console.error("Error sending message:", err)
      setError(err.message)
      return false
    }
  }, [barId, currentUser])

  // Enviar mensaje de sistema
  const sendSystemMessage = useCallback(async (message: string) => {
    if (!barId) return

    try {
      const messagesRef = ref(realtimeDb, `generalChat/${barId}/messages`)
      const newMessageRef = push(messagesRef)

      await set(newMessageRef, {
        message,
        timestamp: serverTimestamp(),
        type: 'system'
      })
    } catch (err: any) {
      console.error("Error sending system message:", err)
    }
  }, [barId])

  // Salir del chat
  const leaveChat = useCallback(async () => {
    if (!barId || !currentUser) return

    try {
      // Enviar mensaje de sistema
      await sendSystemMessage(`${currentUser.username} salió del chat`)

      // Eliminar usuario de la lista
      const userRef = ref(realtimeDb, `generalChat/${barId}/users/${currentUser.id}`)
      await set(userRef, null)

      setCurrentUser(null)
    } catch (err: any) {
      console.error("Error leaving chat:", err)
    }
  }, [barId, currentUser, sendSystemMessage])

  return {
    messages,
    users,
    currentUser,
    loading,
    error,
    joinChat,
    sendMessage,
    leaveChat
  }
}
