"use client"
import { useState, useEffect, useCallback } from "react"
import { normalizeTableData, createDefaultTableData, type NormalizedTable } from "@/src/utils/tableNormalizer"
import { useRobustTables } from "./useRobustTables"

interface LocalMessage {
  id: string
  text: string
  senderId: string
  timestamp: number
  senderTable: string
  chatId: string
  barId: string
  type: "text" | "gif"
  senderTableNumber: number
}

interface LocalChat {
  id: string
  barId: string
  tableIds: string[]
  tableNumbers: number[]
  isActive: boolean
  lastMessage: string
  lastMessageAt: number
}

const CHAT_STORAGE_KEY = 'match-tag-local-chats'
const MESSAGES_STORAGE_KEY = 'match-tag-local-messages'

export function useLocalChat(tableId: string, barId: string) {
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [activeChats, setActiveChats] = useState<LocalChat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [currentTable, setCurrentTable] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  // Usar mesas robustas (admin + prueba)
  const { tables: robustTables, loading: robustLoading, debugInfo } = useRobustTables(barId)

  // Cargar datos del localStorage
  const loadLocalData = useCallback(() => {
    try {
      const storedChats = localStorage.getItem(CHAT_STORAGE_KEY)
      const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
      
      if (storedChats) {
        const chats = JSON.parse(storedChats)
        setActiveChats(chats.filter((chat: LocalChat) => chat.barId === barId))
      }
      
      if (storedMessages) {
        const allMessages = JSON.parse(storedMessages)
        const chatMessages = allMessages.filter((msg: LocalMessage) => 
          msg.barId === barId && msg.chatId === selectedChatId
        )
        setMessages(chatMessages.sort((a: LocalMessage, b: LocalMessage) => a.timestamp - b.timestamp))
      }
    } catch (error) {
      console.error("Error loading local chat data:", error)
    }
  }, [barId, selectedChatId])

  // Guardar datos en localStorage
  const saveLocalData = useCallback((chats: LocalChat[], messages: LocalMessage[]) => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats))
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages))
    } catch (error) {
      console.error("Error saving local chat data:", error)
    }
  }, [])

  // Crear chat local
  const createLocalChat = useCallback((targetTable: any) => {
    console.log("🔍 Creando chat local con mesa:", targetTable)
    
    // Normalizar datos de la mesa objetivo
    const normalizedTable = normalizeTableData(targetTable, barId)
    console.log("✅ Mesa normalizada:", normalizedTable)
    
    // Asegurar que los IDs son strings válidos
    const currentTableId = String(tableId)
    const targetTableId = String(normalizedTable.id)
    
    // Crear ID de chat válido (sin caracteres especiales)
    const chatId = `${currentTableId}-${targetTableId}`.replace(/[.#$[\]]/g, '-')
    
    console.log("🔗 IDs del chat:", {
      currentTableId,
      targetTableId,
      chatId
    })
    
    const newChat: LocalChat = {
      id: chatId,
      barId: String(barId),
      tableIds: [currentTableId, targetTableId],
      tableNumbers: [1, Number(normalizedTable.number)], // Asegurar que son números
      isActive: true,
      lastMessage: "Chat iniciado",
      lastMessageAt: Date.now()
    }

    const updatedChats = [...activeChats, newChat]
    setActiveChats(updatedChats)
    setSelectedChatId(chatId)
    
    // Guardar en localStorage
    const allChats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]')
    const filteredChats = allChats.filter((chat: LocalChat) => chat.barId !== barId)
    saveLocalData([...filteredChats, ...updatedChats], [])
    
    console.log("✅ Chat local creado:", newChat)
    return chatId
  }, [tableId, barId, activeChats, saveLocalData])

  // Enviar mensaje local
  const sendLocalMessage = useCallback((content: string, type: "text" | "gif" = "text") => {
    if (!selectedChatId) {
      console.error("No hay chat seleccionado")
      return false
    }

    const newMessage: LocalMessage = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: content,
      senderId: "local-user",
      timestamp: Date.now(),
      senderTable: tableId,
      chatId: selectedChatId,
      barId: barId,
      type: type,
      senderTableNumber: 1 // Número por defecto
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)

    // Actualizar último mensaje del chat
    const updatedChats = activeChats.map(chat => 
      chat.id === selectedChatId 
        ? { ...chat, lastMessage: content, lastMessageAt: Date.now() }
        : chat
    )
    setActiveChats(updatedChats)

    // Guardar en localStorage
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]')
    const filteredMessages = allMessages.filter((msg: LocalMessage) => 
      !(msg.barId === barId && msg.chatId === selectedChatId)
    )
    saveLocalData(updatedChats, [...filteredMessages, ...updatedMessages])

    console.log("Mensaje local enviado:", newMessage)
    return true
  }, [selectedChatId, messages, activeChats, tableId, barId, saveLocalData])

  // Inicializar datos
  useEffect(() => {
    setCurrentTable({
      id: tableId,
      number: 1,
      barId: barId
    })
    
    // Crear mesas de prueba si no existen
    const createTestTables = () => {
      const testTables = [
        { id: 'test-table-1', number: 2, barId: barId, isActive: true },
        { id: 'test-table-2', number: 3, barId: barId, isActive: true }
      ]
      
      // Guardar mesas de prueba en localStorage
      const existingTables = JSON.parse(localStorage.getItem('match-tag-test-tables') || '[]')
      const hasTables = existingTables.some((table: any) => table.barId === barId)
      
      if (!hasTables) {
        localStorage.setItem('match-tag-test-tables', JSON.stringify(testTables))
        console.log("Mesas de prueba creadas")
      }
    }
    
    createTestTables()
    loadLocalData()
  }, [tableId, barId, loadLocalData])

  // Cargar mensajes cuando cambia el chat seleccionado
  useEffect(() => {
    if (selectedChatId) {
      loadLocalData()
    }
  }, [selectedChatId, loadLocalData])

  // Obtener mesas disponibles (robustas)
  const getAvailableTables = useCallback(() => {
    try {
      // Usar mesas robustas (admin + prueba)
      if (robustTables && robustTables.length > 0) {
        console.log("✅ Usando mesas robustas:", robustTables)
        return robustTables
      }
      
      // Fallback a mesas de prueba del localStorage
      const testTables = JSON.parse(localStorage.getItem('match-tag-test-tables') || '[]')
      const filteredTestTables = testTables.filter((table: any) => table.barId === barId)
      console.log("🧪 Usando mesas de prueba del localStorage:", filteredTestTables)
      return filteredTestTables
    } catch (error) {
      console.error("❌ Error obteniendo mesas disponibles:", error)
      return []
    }
  }, [barId, robustTables])

  // Función wrapper para startChatWithTable
  const startChatWithTable = useCallback((targetTable: any) => {
    console.log("🏠 startChatWithTable local llamado con:", targetTable)
    try {
      const chatId = createLocalChat(targetTable)
      console.log("🏠 Chat local creado con ID:", chatId)
      return chatId
    } catch (error) {
      console.error("❌ Error en startChatWithTable local:", error)
      return null
    }
  }, [createLocalChat])

  return {
    messages,
    availableTables: getAvailableTables(),
    activeChats,
    selectedChatId,
    currentTable,
    loading: loading || robustLoading,
    isAuthenticated: true, // Siempre autenticado localmente
    setSelectedChatId,
    startChatWithTable,
    sendMessage: sendLocalMessage,
    getOtherTableNumber: (chat: LocalChat) => {
      if (!chat || !chat.tableNumbers || !Array.isArray(chat.tableNumbers)) return 0
      return chat.tableNumbers.find((num: number) => num !== 1) || 0
    },
    // Información de debug
    debugInfo: {
      ...debugInfo,
      robustTables,
      robustLoading,
      availableTablesCount: getAvailableTables().length
    }
  }
}
