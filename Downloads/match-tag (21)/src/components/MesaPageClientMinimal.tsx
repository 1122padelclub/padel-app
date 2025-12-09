"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle } from "@/src/components/icons/Icons"
import { useT } from "@/src/hooks/useTranslation"

function MesaContentMinimal() {
  const t = useT()
  const searchParams = useSearchParams()
  const [barId, setBarId] = useState<string | null>(null)
  const [tableId, setTableId] = useState<string | null>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[MINIMAL] Inicializando MesaPageClientMinimal...")
    
    // Obtener parámetros de la URL
    const barIdParam = searchParams.get("barId")
    const tableIdParam = searchParams.get("tableId")
    const tableNumberParam = searchParams.get("tableNumber")

    console.log("[MINIMAL] Parámetros de URL:", {
      barIdParam,
      tableIdParam,
      tableNumberParam
    })

    // Validar y establecer valores
    if (barIdParam && tableIdParam && tableNumberParam) {
      setBarId(barIdParam)
      setTableId(tableIdParam)
      setTableNumber(parseInt(tableNumberParam))
      setLoading(false)
      console.log("[MINIMAL] Valores establecidos:", {
        barId: barIdParam,
        tableId: tableIdParam,
        tableNumber: parseInt(tableNumberParam)
      })
    } else {
      console.error("[MINIMAL] Parámetros faltantes")
      setLoading(false)
    }
  }, [searchParams])

  // Validar props críticas
  const safeBarId = barId || ""
  const safeTableId = tableId || ""
  const safeTableNumber = tableNumber || 1

  console.log("[MINIMAL] Props finales:", {
    barId: safeBarId,
    tableId: safeTableId,
    tableNumber: safeTableNumber
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          Mesa {safeTableNumber}
        </h1>
        <p className="text-white opacity-70">
          Bar ID: {safeBarId} | Table ID: {safeTableId}
        </p>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            ¿Qué te gustaría hacer?
          </h2>
          
          {/* Botón de Calificar Servicio */}
          <Button
            className="w-full text-white py-4 text-lg font-medium"
            style={{
              background: `linear-gradient(135deg, #f59e0b, #d97706)`,
              borderRadius: `12px`,
            }}
            onClick={() => {
              console.log("[MINIMAL] Botón de calificación clickeado")
              alert("Botón de calificación funciona!")
            }}
          >
            <Star className="h-5 w-5 mr-2" />
            {t("table.rateService")}
          </Button>

          {/* Botón de Ver Chats */}
          <Button
            className="w-full text-white py-4 text-lg font-medium"
            style={{
              background: `linear-gradient(135deg, #3b82f6, #1d4ed8)`,
              borderRadius: `12px`,
            }}
            onClick={() => {
              console.log("[MINIMAL] Botón de chats clickeado")
              alert("Botón de chats funciona!")
            }}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {t("table.viewChats")}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-sm text-white opacity-50">
          Powered by Gibra Company
        </p>
      </div>
    </div>
  )
}

export default function MesaPageClientMinimal() {
  return (
    <div className="min-h-screen">
      <MesaContentMinimal />
    </div>
  )
}





