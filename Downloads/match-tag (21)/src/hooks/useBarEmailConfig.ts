"use client"

import { useState, useEffect } from "react"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Bar } from "@/src/types"

export function useBarEmailConfig(barId: string) {
  const [bar, setBar] = useState<Bar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const barRef = doc(db, "bars", barId)
    const unsubscribe = onSnapshot(
      barRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setBar({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
          } as Bar)
        } else {
          setBar(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error("Error loading bar:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  const updateEmailConfig = async (emailConfig: Bar['emailConfig']) => {
    if (!barId || !bar) return

    try {
      const barRef = doc(db, "bars", barId)
      await updateDoc(barRef, {
        emailConfig: {
          ...bar.emailConfig,
          ...emailConfig
        }
      })
      console.log("✅ Email config updated successfully")
    } catch (err: any) {
      console.error("Error updating email config:", err)
      throw new Error(err.message)
    }
  }

  return {
    bar,
    loading,
    error,
    updateEmailConfig
  }
}






