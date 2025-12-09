"use client"
import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { TableManager } from "@/src/utils/tableManager"

interface SimpleBar {
  id: string
  name: string
  logoUrl?: string
  generalChatEnabled?: boolean
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    textColor?: string
    bgImage?: string
  }
}

export function useSimpleBar(barId?: string) {
  const [bar, setBar] = useState<SimpleBar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !barId) {
      setLoading(false)
      return
    }

    setLoading(true)
    console.log("[v0] Loading simple bar for barId:", barId)

    // Obtener datos base del localStorage
    let baseBarData: SimpleBar | null = null
    try {
      baseBarData = TableManager.getBar(barId)
    } catch (error) {
      console.error("[v0] Error loading bar from localStorage:", error)
    }

    // Fallback a datos por defecto si no hay datos en localStorage
    if (!baseBarData) {
      baseBarData = {
        id: barId,
        name: "Match Tag Bar",
        logoUrl: null,
        generalChatEnabled: false,
        theme: {
          primaryColor: "#0ea5e9",
          secondaryColor: "#1f2937",
          textColor: "#ffffff",
          bgImage: null,
        }
      }
    }

    // Suscribirse a cambios en Firebase para obtener datos actualizados
    const barRef = doc(db, "bars", barId)
    const unsubscribe = onSnapshot(barRef, (doc) => {
      if (doc.exists()) {
        const firebaseData = doc.data()
        const updatedBar: SimpleBar = {
          ...baseBarData,
          ...firebaseData,
          id: barId,
          generalChatEnabled: firebaseData.generalChatEnabled || false
        }
        setBar(updatedBar)
        console.log("[v0] Bar updated from Firebase:", updatedBar)
      } else {
        setBar(baseBarData)
      }
      setLoading(false)
      setError(null)
    }, (error) => {
      console.error("[v0] Error listening to bar updates:", error)
      setBar(baseBarData)
      setLoading(false)
      setError("Error loading bar data")
    })

    return () => unsubscribe()
  }, [barId])

  return { bar, loading, error }
}
