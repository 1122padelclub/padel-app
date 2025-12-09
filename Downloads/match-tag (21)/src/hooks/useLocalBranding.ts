"use client"
import { useState, useEffect } from "react"
import { TableManager } from "@/src/utils/tableManager"

type Branding = Record<string, any>

const DEFAULT_BRANDING = {
  primaryColor: "#0ea5e9",
  secondaryColor: "#1f2937",
  textColor: "#ffffff",
  bgImage: null,
  logoUrl: null,
  name: "Match Tag",
  tableName: "Mesa",
}

export function useLocalBranding(barId?: string, tableId?: string) {
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
    console.log("[v0] Loading local branding for barId:", barId, "tableId:", tableId)

    try {
      // Inicializar datos por defecto si no existen
      TableManager.initializeDefaults(barId, tableId || "")
      
      // Obtener datos de la barra
      const barData = TableManager.getBar(barId)
      let tableData = null
      
      if (tableId) {
        tableData = TableManager.getTable(tableId)
      }

      // Combinar datos de barra y mesa
      const mergedBranding = { 
        ...DEFAULT_BRANDING, 
        ...barData?.theme, 
        ...barData, 
        ...tableData 
      }
      
      console.log("[v0] Local branding loaded:", mergedBranding)
      setData(mergedBranding)
      setLoading(false)
      setError(null)
    } catch (e: any) {
      console.warn("[v0] Local branding error, using defaults:", e)
      setData(DEFAULT_BRANDING)
      setError(null)
      setLoading(false)
    }
  }, [barId, tableId])

  return { branding: data, loading, error }
}











