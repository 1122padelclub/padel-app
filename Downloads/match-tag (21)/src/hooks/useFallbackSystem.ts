"use client"

import { useState, useEffect } from "react"

interface FallbackData {
  tableId: string
  barId: string
  tableNumber: number
  barName: string
  timestamp: number
}

interface FallbackSystem {
  isActive: boolean
  data: FallbackData | null
  activate: (data: FallbackData) => void
  deactivate: () => void
  isDataValid: () => boolean
}

const FALLBACK_TTL = 30 * 60 * 1000 // 30 minutos

export function useFallbackSystem(): FallbackSystem {
  const [isActive, setIsActive] = useState(false)
  const [data, setData] = useState<FallbackData | null>(null)

  useEffect(() => {
    // Verificar si hay datos de fallback válidos al cargar
    const stored = localStorage.getItem('fallback_table_data')
    if (stored) {
      try {
        const fallbackData = JSON.parse(stored)
        if (isDataValid(fallbackData)) {
          setData(fallbackData)
          setIsActive(true)
        } else {
          localStorage.removeItem('fallback_table_data')
        }
      } catch (error) {
        console.error("[FallbackSystem] Error parsing stored data:", error)
        localStorage.removeItem('fallback_table_data')
      }
    }
  }, [])

  const isDataValid = (fallbackData?: FallbackData): boolean => {
    const dataToCheck = fallbackData || data
    if (!dataToCheck) return false
    
    const now = Date.now()
    return (now - dataToCheck.timestamp) < FALLBACK_TTL
  }

  const activate = (fallbackData: FallbackData) => {
    const dataWithTimestamp = {
      ...fallbackData,
      timestamp: Date.now()
    }
    
    setData(dataWithTimestamp)
    setIsActive(true)
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('fallback_table_data', JSON.stringify(dataWithTimestamp))
    
    console.log("[FallbackSystem] Fallback activated for table:", fallbackData.tableNumber)
  }

  const deactivate = () => {
    setData(null)
    setIsActive(false)
    localStorage.removeItem('fallback_table_data')
    
    console.log("[FallbackSystem] Fallback deactivated")
  }

  return {
    isActive,
    data,
    activate,
    deactivate,
    isDataValid
  }
}

// Hook para manejar fallback en caso de rate limits
export function useRateLimitFallback() {
  const fallback = useFallbackSystem()
  const [showFallback, setShowFallback] = useState(false)

  const handleRateLimit = (tableData: {
    tableId: string
    barId: string
    tableNumber: number
    barName: string
  }) => {
    console.log("[RateLimitFallback] Handling rate limit, activating fallback")
    
    fallback.activate({
      ...tableData,
      timestamp: Date.now()
    })
    
    setShowFallback(true)
  }

  const retryWithFallback = () => {
    setShowFallback(false)
    // El componente padre debería intentar recargar los datos
  }

  return {
    fallback,
    showFallback,
    handleRateLimit,
    retryWithFallback
  }
}
