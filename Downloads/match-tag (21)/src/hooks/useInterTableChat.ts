"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { ref, push, onValue, off, serverTimestamp as rtdbServerTimestamp, update, set } from "@/src/services/firebaseExtras"
import { db, auth, realtimeDb } from "@/src/services/firebaseExtras"
import { useTableAuth } from "@/src/hooks/useTableAuth"
import type { Message, Table, TableChat } from "@/src/types"

export function useInterTableChat(currentTableId: string, barId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [activeChats, setActiveChats] = useState<TableChat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [currentTable, setCurrentTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Usar el hook de autenticación de mesa
  const { isAuthenticated, user, loading: authLoading } = useTableAuth()

  // Función para crear ID de chat consistente
  const createChatId = (table1Id: string, table2Id: string) => {
    return [table1Id, table2Id].sort().join("-")
  }

  useEffect(() => {
    if (!barId || !currentTableId || authLoading) return

    const fetchTables = async () => {
      try {
        const tablesRef = collection(db, "tables")
        const q = query(tablesRef, where("barId", "==", barId), where("isActive", "==", true))
        const snapshot = await getDocs(q)

        const tables: Table[] = []
        let current: Table | null = null

        snapshot.forEach((doc) => {
          const table = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as Table

          if (table.id === currentTableId) {
            current = table
          } else {
            tables.push(table)
          }
        })

        setCurrentTable(current)
        setAvailableTables(tables.sort((a, b) => a.number - b.number))
      } catch (error) {
        console.error("Error fetching tables:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [barId, currentTableId, authLoading])

  useEffect(() => {
    if (!barId || !currentTableId) return

    // Intentar múltiples rutas para encontrar chats
    const possiblePaths = [
      `chats/${barId}`,
      `bars/${barId}/chats`,
      `chats`,
      `bars/${barId}/tableChats`,
      `bars/${barId}/messages`,
      `messages/${barId}`
    ]

    let unsubscribeFunctions: (() => void)[] = []

    possiblePaths.forEach((path) => {
      const chatsRef = ref(realtimeDb, path)

      const unsubscribe = onValue(chatsRef, (snapshot) => {
        const chats: TableChat[] = []
        const data = snapshot.val()

        if (data) {
          Object.entries(data).forEach(([chatId, chatData]: [string, any]) => {
            if (
              chatData &&
              chatData.tableIds &&
              Array.isArray(chatData.tableIds) &&
              chatData.tableIds.includes(currentTableId) &&
              chatData.isActive
            ) {
              chats.push({
                id: chatId,
                ...chatData,
                tableNumbers: Array.isArray(chatData.tableNumbers) ? chatData.tableNumbers : [],
                tableIds: Array.isArray(chatData.tableIds) ? chatData.tableIds : [],
                createdAt: chatData.createdAt ? new Date(chatData.createdAt) : new Date(),
                lastMessageAt: chatData.lastMessageAt ? new Date(chatData.lastMessageAt) : undefined,
              } as TableChat)
            }
          })
        }

        if (chats.length > 0) {
          setActiveChats(chats.sort((a, b) => (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0)))
        }
      })

      unsubscribeFunctions.push(() => off(chatsRef, "value"))
    })

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
    }
  }, [barId, currentTableId])

  useEffect(() => {
    if (!selectedChatId || !barId) {
      setMessages([])
      return
    }

    const messagesRef = ref(realtimeDb, `messages/${barId}/${selectedChatId}`)

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const msgs: Message[] = []
      const data = snapshot.val()

      if (data) {
        Object.entries(data).forEach(([messageId, messageData]: [string, any]) => {
          msgs.push({
            id: messageId,
            ...messageData,
            createdAt: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
            timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
          } as Message)
        })
      }

      // Ordenar por fecha de creación
      msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      setMessages(msgs)
    })

    return () => off(messagesRef, "value")
  }, [selectedChatId, barId])

  const startChatWithTable = async (targetTableId: string, targetTableNumber: number) => {
    console.log("🔍 startChatWithTable llamado con:", { targetTableId, targetTableNumber, currentTable, currentTableId, barId })
    
    if (!currentTable) {
      console.error("❌ No hay mesa actual")
      return null
    }

    const chatId = createChatId(currentTableId, targetTableId)
    console.log("🔍 ChatId generado:", chatId)

    try {
      // Verificar si ya existe el chat
      const existingChat = activeChats.find((chat) => chat.id === chatId)
      if (existingChat) {
        console.log("✅ Chat ya existe, seleccionando:", chatId)
        setSelectedChatId(chatId)
        return chatId
      }

      console.log("🔄 Creando nuevo chat en Firebase:", { chatId, barId })
      const chatRef = ref(realtimeDb, `chats/${barId}/${chatId}`)
      
      const chatData = {
        barId,
        tableIds: [currentTableId, targetTableId],
        tableNumbers: [currentTable.number, targetTableNumber].sort((a, b) => a - b),
        isActive: true,
        createdAt: rtdbServerTimestamp(),
      }
      
      console.log("🔄 Datos del chat:", chatData)
      await set(chatRef, chatData)

      console.log("✅ Chat creado exitosamente:", chatId)
      setSelectedChatId(chatId)
      return chatId
    } catch (error) {
      console.error("❌ Error starting chat:", error)
      return null
    }
  }

  const sendMessage = async (content: string, type: "text" | "gif" = "text") => {
    console.log("[v0] sendMessage llamado con:", {
      content,
      type,
      selectedChatId,
      currentTable,
      barId,
      hasCurrentTable: !!currentTable,
      isAuthenticated,
      hasAuthUser: !!auth.currentUser,
    })

    if (!isAuthenticated || !user) {
      console.error("[v0] Usuario no autenticado:", {
        isAuthenticated,
        user: !!user,
        authLoading,
      })
      return false
    }

    if (!selectedChatId || !currentTable || !barId) {
      console.error("[v0] sendMessage: Faltan datos requeridos:", {
        selectedChatId: !!selectedChatId,
        currentTable: !!currentTable,
        barId: !!barId,
      })
      return false
    }

    try {
      const messagesRef = ref(realtimeDb, `messages/${barId}/${selectedChatId}`)
      const newMessageRef = push(messagesRef)

      const messageData = {
        text: content,
        senderId: user?.uid || "anonymous",
        timestamp: rtdbServerTimestamp(),
        senderTable: currentTableId,
        chatId: selectedChatId,
        barId,
        type,
        senderTableNumber: currentTable.number,
      }

      console.log("[v0] Enviando mensaje a Firebase:", {
        path: `messages/${barId}/${selectedChatId}`,
        userId: user?.uid,
        messageData,
      })

      await update(newMessageRef, messageData)

      const chatRef = ref(realtimeDb, `chats/${barId}/${selectedChatId}`)
      await update(chatRef, {
        lastMessage: content,
        lastMessageAt: rtdbServerTimestamp(),
      })

      console.log("[v0] Mensaje enviado exitosamente a Firebase")
      return true
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      if (error instanceof Error) {
        if (error.message.includes("PERMISSION_DENIED")) {
          console.error("[v0] Error de permisos en Firebase - verificar reglas de seguridad")
        } else if (error.message.includes("network")) {
          console.error("[v0] Error de red - verificar conexión")
        }
      }
      return false
    }
  }

  const getOtherTableNumber = (chat: TableChat) => {
    if (!currentTable || !chat || !chat.tableNumbers || !Array.isArray(chat.tableNumbers)) {
      console.warn("[v0] getOtherTableNumber: Datos inválidos", { currentTable, chat })
      return 0
    }
    return chat.tableNumbers.find((num) => num !== currentTable.number) || 0
  }

  return {
    messages,
    availableTables,
    activeChats,
    selectedChatId,
    currentTable,
    loading,
    isAuthenticated,
    setSelectedChatId,
    startChatWithTable,
    sendMessage,
    getOtherTableNumber,
  }
}
