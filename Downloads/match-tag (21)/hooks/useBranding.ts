"use client"
import { useEffect, useState } from "react"
import { doc, onSnapshot, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type Branding = Record<string, any>

// Valores por defecto para el branding
const DEFAULT_BRANDING = {
  primaryColor: "#0ea5e9",
  secondaryColor: "#1f2937",
  textColor: "#ffffff",
  bgImage: null,
  logoUrl: null,
  name: "Mesa",
  tableName: "Mesa",
}

export function useBranding(barId?: string, tableId?: string) {
  const [data, setData] = useState<Branding | null>(DEFAULT_BRANDING)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !barId) {
      setData(DEFAULT_BRANDING)
      setLoading(false)
      return
    }

    setLoading(true)
    console.log("[v0] Loading branding for barId:", barId, "tableId:", tableId)

    // Intentar cargar el branding, pero usar valores por defecto si falla
    const unsubBar = onSnapshot(
      doc(db, "bars", barId),
      async (barSnap) => {
        try {
          console.log("[v0] Bar snapshot exists:", barSnap.exists())
          const bar = barSnap.exists() ? barSnap.data() : {}
          let table: Branding = {}

          if (tableId) {
            try {
              const tSnap = await getDoc(doc(db, "bars", barId, "tables", tableId))
              console.log("[v0] Table snapshot exists:", tSnap.exists())
              table = tSnap.exists() ? tSnap.data() : {}
            } catch (tableError) {
              console.warn("[v0] Table data not accessible, using defaults:", tableError)
              table = {}
            }
          }

          // El override de mesa gana sobre el de bar
          const mergedBranding = { 
            ...DEFAULT_BRANDING, 
            ...bar?.theme, 
            ...bar, 
            ...table 
          }
          console.log("[v0] Merged branding:", mergedBranding)
          setData(mergedBranding)
          setLoading(false)
        } catch (e: any) {
          console.warn("[v0] Branding load error, using defaults:", e)
          setData(DEFAULT_BRANDING)
          setError(null) // No mostrar error al usuario, usar defaults
          setLoading(false)
        }
      },
      (e) => {
        console.warn("[v0] Branding snapshot error, using defaults:", e)
        setData(DEFAULT_BRANDING)
        setError(null) // No mostrar error al usuario, usar defaults
        setLoading(false)
      },
    )

    return () => unsubBar()
  }, [barId, tableId])

  return { branding: data, loading, error }
}
