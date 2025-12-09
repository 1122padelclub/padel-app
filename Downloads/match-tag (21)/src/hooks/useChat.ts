"use client"

import { useEffect, useState } from "react"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { Message } from "@/src/types"

export function useChat(tableId: string, barId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tableId || !barId) return

    const messagesRef = collection(db, "chats", tableId, "messages")
    const q = query(messagesRef, orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        newMessages.push({
          id: doc.id,
          tableId,
          barId,
          type: data.type,
          content: data.content,
          orderId: data.orderId,
          senderType: data.senderType,
          senderName: data.senderName,
          createdAt: data.createdAt?.toDate() || new Date(),
        })
      })
      setMessages(newMessages)
      setLoading(false)
    })

    return unsubscribe
  }, [tableId, barId])

  const sendMessage = async (content: string, type: "text" | "gif" = "text") => {
    if (!content.trim() || !tableId || !barId) return

    try {
      const messagesRef = collection(db, "chats", tableId, "messages")
      await addDoc(messagesRef, {
        tableId,
        barId,
        type,
        content: content.trim(),
        senderType: "guest",
        senderName: "Cliente",
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return {
    messages,
    loading,
    sendMessage,
  }
}
