"use client"

import { useParams } from "next/navigation"
import { useThemeConfig } from "@/src/hooks/useThemeConfig"
import { useMenu } from "@/src/hooks/useMenu"
import { useTables } from "@/src/hooks/useTables"
import { InterTableChatWindow } from "@/src/components/InterTableChatWindow"
import { TableTranslationProvider } from "@/src/hooks/useTableTranslation"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function TablePreviewPage() {
  const params = useParams()
  const barId = params.barId as string
  const [testTableId, setTestTableId] = useState<string | null>(null)

  const { themeConfig, loading: themeLoading } = useThemeConfig(barId)
  const { menuItems, loading: menuLoading } = useMenu(barId)
  const { tables, loading: tablesLoading } = useTables(barId)

  // Buscar la mesa de prueba
  useEffect(() => {
    if (tables && tables.length > 0) {
      const testTable = tables.find(table => table.isTestTable === true)
      
      if (testTable) {
        setTestTableId(testTable.id)
      } else {
        // Buscar por número "PRUEBA" como fallback
        const pruebaTable = tables.find(table => table.number === "PRUEBA")
        if (pruebaTable) {
          setTestTableId(pruebaTable.id)
        } else {
          // Usar la primera mesa disponible como fallback
          setTestTableId(tables[0].id)
        }
      }
    }
  }, [tables])

  if (themeLoading || menuLoading || tablesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Cargando vista previa...</p>
        </div>
      </div>
    )
  }

  if (!testTableId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Mesa de Prueba No Encontrada</h1>
          <p className="text-gray-300">No se encontró la mesa de prueba para este bar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <TableTranslationProvider>
        <InterTableChatWindow
          tableId={testTableId}
          barId={barId}
          tableNumber="PRUEBA"
          barLogo={themeConfig?.assets?.logoUrl}
        />
      </TableTranslationProvider>
    </div>
  )
}
