"use client"
import { useState, useEffect, useCallback } from "react"
import { useInterTableChat } from "./useInterTableChat"
import { useLocalChat } from "./useLocalChat"
import { normalizeTableData } from "@/src/utils/tableNormalizer"

export function useHybridChat(tableId: string, barId: string) {
  const [useLocal, setUseLocal] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)

  // Hook de Firebase
  const firebaseChat = useInterTableChat(tableId, barId)
  
  // Hook local
  const localChat = useLocalChat(tableId, barId)

  // Detectar si Firebase está funcionando
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Verificar si Firebase está disponible
        if (firebaseChat.loading) {
          console.log("Firebase cargando, esperando...")
          return
        }
        
        // Si Firebase tiene error, usar local inmediatamente
        if (firebaseChat.error || !firebaseChat.isAuthenticated) {
          console.log("Firebase no disponible, usando chat local")
          setUseLocal(true)
          setFirebaseError("Firebase no disponible")
          return
        }
        
        // Si Firebase está listo, usarlo
        if (firebaseChat.isAuthenticated && !firebaseChat.loading) {
          console.log("Firebase disponible, usando Firebase")
          setUseLocal(false)
          setFirebaseError(null)
        }
      } catch (error) {
        console.log("Error verificando Firebase, usando chat local:", error)
        setUseLocal(true)
        setFirebaseError("Error en Firebase")
      }
    }

    checkFirebase()
  }, [firebaseChat.loading, firebaseChat.error, firebaseChat.isAuthenticated])

  // Función híbrida para enviar mensajes
  const sendMessage = useCallback(async (content: string, type: "text" | "gif" = "text") => {
    if (useLocal || firebaseError) {
      console.log("Enviando mensaje localmente")
      return localChat.sendMessage(content, type)
    } else {
      try {
        console.log("Enviando mensaje a Firebase")
        const result = await firebaseChat.sendMessage(content, type)
        if (!result) {
          // Si Firebase falla, cambiar a local
          console.log("Firebase falló, cambiando a modo local")
          setUseLocal(true)
          setFirebaseError("Firebase falló")
          return localChat.sendMessage(content, type)
        }
        return result
      } catch (error) {
        console.log("Error en Firebase, usando chat local:", error)
        setUseLocal(true)
        setFirebaseError("Error en Firebase")
        return localChat.sendMessage(content, type)
      }
    }
  }, [useLocal, firebaseError, firebaseChat, localChat])

  // Función híbrida para iniciar chat
  const startChatWithTable = useCallback(async (targetTable: any) => {
    console.log("🔍 Iniciando chat con mesa:", targetTable)
    console.log("🔍 Estado actual:", { useLocal, firebaseError, barId, tableId })
    
    // Validar datos de la mesa
    if (!targetTable) {
      console.error("❌ No se proporcionó mesa objetivo")
      return null
    }
    
    // Normalizar datos de la mesa usando el normalizador
    const normalizedTable = normalizeTableData(targetTable, barId)
    console.log("✅ Mesa normalizada:", normalizedTable)
    
    // Validar que la mesa normalizada tiene datos válidos
    if (!normalizedTable.id || typeof normalizedTable.id !== 'string') {
      console.error("❌ Mesa normalizada inválida:", normalizedTable)
      return null
    }
    
    if (useLocal || firebaseError) {
      console.log("🏠 Iniciando chat local con mesa normalizada:", normalizedTable)
      try {
        const result = localChat.startChatWithTable(normalizedTable)
        console.log("🏠 Resultado chat local:", result)
        return result
      } catch (error) {
        console.error("❌ Error en chat local:", error)
        return null
      }
    } else {
      try {
        console.log("🔥 Iniciando chat en Firebase con mesa normalizada:", normalizedTable)
        const result = await firebaseChat.startChatWithTable(normalizedTable.id, normalizedTable.number)
        console.log("🔥 Resultado chat Firebase:", result)
        return result
      } catch (error) {
        console.log("❌ Error en Firebase, usando chat local:", error)
        setUseLocal(true)
        setFirebaseError("Error en Firebase")
        try {
          const result = localChat.startChatWithTable(normalizedTable)
          console.log("🏠 Resultado chat local (fallback):", result)
          return result
        } catch (localError) {
          console.error("❌ Error en chat local (fallback):", localError)
          return null
        }
      }
    }
  }, [useLocal, firebaseError, firebaseChat, localChat, barId, tableId])

  // Usar datos del chat activo (Firebase o local)
  const activeChat = useLocal ? localChat : firebaseChat

  return {
    ...activeChat,
    sendMessage,
    startChatWithTable,
    isUsingLocal: useLocal,
    firebaseError,
    // Métodos específicos con validación
    setSelectedChatId: activeChat?.setSelectedChatId || (() => {}),
    getOtherTableNumber: activeChat?.getOtherTableNumber || (() => null),
    // Asegurar que las propiedades críticas no sean undefined
    messages: activeChat?.messages || [],
    availableTables: activeChat?.availableTables || [],
    activeChats: activeChat?.activeChats || [],
    selectedChatId: activeChat?.selectedChatId || null,
    currentTable: activeChat?.currentTable || null,
    loading: activeChat?.loading || false,
    error: activeChat?.error || null,
    isAuthenticated: activeChat?.isAuthenticated || false
  }
}
