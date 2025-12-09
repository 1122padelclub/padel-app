"use client"
import { useState, useEffect } from "react"

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

export function useSimpleBranding(barId?: string, tableId?: string) {
  const [data, setData] = useState<Branding>(DEFAULT_BRANDING)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !barId) {
      setData(DEFAULT_BRANDING)
      setLoading(false)
      return
    }

    setLoading(true)
    console.log("[v0] Using simple branding for barId:", barId, "tableId:", tableId)

    // Simular carga para mantener consistencia con la API
    setTimeout(() => {
      setData(DEFAULT_BRANDING)
      setLoading(false)
      setError(null)
    }, 100)
  }, [barId, tableId])

  return { branding: data, loading, error }
}

