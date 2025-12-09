"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InterTableChatWindow } from "@/src/components/InterTableChatWindow"
import { TablePasswordPrompt } from "@/src/components/TablePasswordPrompt"
import { ThemeProvider } from "@/src/components/ThemeProvider"
// Removed Firebase dependencies
import { useAutoMigration } from "@/src/hooks/useAutoMigration"
import { useCachedTableAuth } from "@/src/hooks/useCachedTableAuth"
import { useOptimizedTable } from "@/src/hooks/useOptimizedTable"
import { useRateLimitFallback } from "@/src/hooks/useFallbackSystem"
import { RateLimitError } from "@/src/components/RateLimitError"
import { isRateLimitError } from "@/src/utils/rateLimitHandler"
import { useSimpleTable } from "@/src/hooks/useSimpleTable"
import { useSimpleBar } from "@/src/hooks/useSimpleBar"
import { useAdminTables } from "@/src/hooks/useAdminTables"
import { useRobustTables } from "@/src/hooks/useRobustTables"
import { useAnnouncementDisplay } from "@/src/hooks/useAnnouncementDisplay"
import { AnnouncementModal } from "@/src/components/AnnouncementModal"
import { GeneralChatWindow } from "@/src/components/GeneralChatWindow"
import { useT } from "@/src/hooks/useTranslation"
import { TableTranslationProvider } from "@/src/hooks/useTableTranslation"

function MesaContent() {
  const t = useT()
  const searchParams = useSearchParams()
  const [barId, setBarId] = useState<string | null>(null)
  const [tableId, setTableId] = useState<string | null>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [barLogo, setBarLogo] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false)
  const [generalChatEnabled, setGeneralChatEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tablePassword, setTablePassword] = useState<string | null>(null)
  const [isPasswordRequired, setIsPasswordRequired] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const migration = useAutoMigration(barId)
  const tableAuth = useCachedTableAuth()
  const { table: optimizedTable, bar: optimizedBar, loading: optimizedLoading, error: optimizedError } = useOptimizedTable(barId, tableId)
  const { fallback, showFallback, handleRateLimit, retryWithFallback } = useRateLimitFallback()
  const { table: simpleTable, loading: tableLoading } = useSimpleTable(barId, tableId)
  const { bar: simpleBar, loading: barLoading } = useSimpleBar(barId)
  
  // Usar mesas robustas que incluyen las del admin
  const { tables: robustTables, loading: robustTablesLoading } = useRobustTables(barId)
  const { tables: adminTables, loading: adminTablesLoading } = useAdminTables(barId)
  
  // Hook para mostrar anuncios en mesa
  const { 
    announcements, 
    showAnnouncement, 
    handleCloseAnnouncement 
  } = useAnnouncementDisplay({ 
    barId: barId || "", 
    showOnTable: true, 
    showOnMenu: false 
  })

  useEffect(() => {
    const barParam = searchParams.get("barId")
    const tableParam = searchParams.get("tableId")

    console.log("[v0] Mesa page - URL params:", { barParam, tableParam })
    console.log("[v0] Mesa page - Admin tables:", adminTables)
    console.log("[v0] Mesa page - Robust tables:", robustTables)

    setBarId(barParam)
    setTableId(tableParam)

    // Usar datos simplificados - no depender de migración
    if (simpleTable && simpleBar && !tableLoading && !barLoading) {
      setTableNumber(simpleTable.number)
      setBarLogo(simpleBar.logoUrl || null)
      setGeneralChatEnabled(simpleBar.generalChatEnabled === true)
      
      // Si la mesa tiene contraseña, requerir autenticación
      if (simpleTable.password) {
        setTablePassword(simpleTable.password)
        setIsPasswordRequired(true)
      } else {
        setIsAuthenticated(true)
      }
      
      setLoading(false)
    }
  }, [searchParams, simpleTable, simpleBar, tableLoading, barLoading, adminTables, robustTables])

  const handlePasswordSubmit = (inputPassword: string) => {
    if (inputPassword === tablePassword) {
      setIsAuthenticated(true)
      setPasswordError("")
    } else {
      setPasswordError(t("auth.invalidCredentials"))
    }
  }

  const handleOrderCreated = (orderId: string, orderSummary: string) => {
    console.log("Order created:", { orderId, orderSummary })
    // Aquí podrías mostrar una notificación o actualizar el estado
  }

  console.log("[v0] Mesa page render state:", {
    barId,
    tableId,
    tableNumber,
    loading,
    isAuthenticated,
    isPasswordRequired,
    tablePassword,
    simpleTable: simpleTable ? {
      id: simpleTable.id,
      number: simpleTable.number,
      password: simpleTable.password ? "***SET***" : "NOT_SET",
      isActive: simpleTable.isActive
    } : null
  })

  if (!barId || !tableId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(135deg, var(--mt-bg), var(--mt-secondary))",
        }}
      >
        <Card
          className="rounded-2xl shadow-2xl border animate-in fade-in-0 zoom-in-95 duration-500"
          style={{
            backgroundColor: "var(--mt-surface)",
            borderColor: "var(--mt-secondary)",
          }}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <CardTitle style={{ color: "var(--mt-text)" }}>Parámetros Faltantes</CardTitle>
            <CardDescription style={{ color: "var(--mt-text)", opacity: 0.7 }}>
              Se requieren barId y tableId para acceder al chat
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (migration.isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(135deg, var(--mt-bg), var(--mt-secondary))",
        }}
      >
        <Card
          className="rounded-2xl shadow-2xl border animate-in fade-in-0 zoom-in-95 duration-500"
          style={{
            backgroundColor: "var(--mt-surface)",
            borderColor: "var(--mt-secondary)",
          }}
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div
                className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
                style={{ borderColor: "var(--mt-primary)" }}
              ></div>
              <div className="font-medium" style={{ color: "var(--mt-text)" }}>
                {migration.isChecking ? t("common.loading") : t("common.loading")}
              </div>
              <div className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                {migration.isChecking ? t("common.loading") : t("common.loading")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (migration.error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(135deg, var(--mt-bg), var(--mt-secondary))",
        }}
      >
        <Card
          className="rounded-2xl shadow-2xl border animate-in fade-in-0 zoom-in-95 duration-500"
          style={{
            backgroundColor: "var(--mt-surface)",
            borderColor: "var(--mt-secondary)",
          }}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <CardTitle style={{ color: "var(--mt-text)" }}>Error de Configuración</CardTitle>
            <CardDescription style={{ color: "var(--mt-text)", opacity: 0.7 }}>
              No se pudo actualizar la configuración del bar: {migration.error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading || tableLoading || barLoading || tableAuth.loading || robustTablesLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(135deg, var(--mt-bg), var(--mt-secondary))",
        }}
      >
        <Card
          className="rounded-2xl shadow-2xl border animate-in fade-in-0 zoom-in-95 duration-500"
          style={{
            backgroundColor: "var(--mt-surface)",
            borderColor: "var(--mt-secondary)",
          }}
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div
                className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
                style={{ borderColor: "var(--mt-primary)" }}
              ></div>
              <div className="font-medium" style={{ color: "var(--mt-text)" }}>
                {tableAuth.loading ? t("common.loading") : t("common.loading")}
              </div>
              <div className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                {tableAuth.loading ? t("common.loading") : t("common.loading")}
              </div>
              {tableAuth.error && isRateLimitError(tableAuth.error) ? (
                <RateLimitError 
                  error={tableAuth.error}
                  onRetry={() => {
                    if (optimizedTable && optimizedBar) {
                      handleRateLimit({
                        tableId: optimizedTable.id,
                        barId: optimizedTable.barId,
                        tableNumber: optimizedTable.number,
                        barName: optimizedBar.name
                      })
                    } else {
                      tableAuth.retryAuth()
                    }
                  }}
                  onGoBack={() => window.location.href = '/'}
                />
              ) : tableAuth.error ? (
                <div className="text-red-500 text-sm mt-2">{tableAuth.error}</div>
              ) : null}
              {/* Skeleton loading animation */}
              <div className="space-y-3 mt-6">
                <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "var(--mt-secondary)" }}></div>
                <div
                  className="h-4 rounded animate-pulse w-3/4 mx-auto"
                  style={{ backgroundColor: "var(--mt-secondary)" }}
                ></div>
                <div
                  className="h-4 rounded animate-pulse w-1/2 mx-auto"
                  style={{ backgroundColor: "var(--mt-secondary)" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isPasswordRequired && !isAuthenticated) {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <TableTranslationProvider>
          <TablePasswordPrompt
            tableNumber={tableNumber || 1}
            onPasswordSubmit={handlePasswordSubmit}
            error={passwordError}
          />
        </TableTranslationProvider>
      </div>
    )
  }

  const safeTableNumber = typeof tableNumber === "number" ? tableNumber : 1
  const safeBarId = barId || ""
  const safeTableId = tableId || ""

  console.log("[v0] About to render InterTableChatWindow with props:", {
    tableId: safeTableId,
    barId: safeBarId,
    tableNumber: safeTableNumber,
    barLogo,
  })

  return (
    <TableTranslationProvider>
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(135deg, var(--mt-bg), var(--mt-secondary))",
        }}
      >
        {barLogo && (
          <div className="flex justify-center pt-1 pb-1 animate-in slide-in-from-top-4 duration-500 delay-200">
            <img
              src={barLogo || "/placeholder.svg"}
              alt="Logo del bar"
              className="h-8 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <InterTableChatWindow 
            tableId={safeTableId} 
            barId={safeBarId} 
            tableNumber={safeTableNumber} 
            barLogo={barLogo}
            generalChatEnabled={generalChatEnabled}
            onOpenGeneralChat={() => setIsGeneralChatOpen(true)}
          />
        </div>
        
        {/* Modal de Anuncios */}
        <AnnouncementModal
          announcements={announcements}
          isOpen={showAnnouncement}
          onClose={handleCloseAnnouncement}
        />
        
        {/* Chat General */}
        {generalChatEnabled && (
          <GeneralChatWindow
            barId={safeBarId}
            tableId={safeTableId}
            tableNumber={safeTableNumber}
            isOpen={isGeneralChatOpen}
            onClose={() => setIsGeneralChatOpen(false)}
          />
        )}
      </div>
    </TableTranslationProvider>
  )
}

export function MesaPageClient() {
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId")

  return (
    <ThemeProvider barId={barId || undefined}>
      <MesaContent />
    </ThemeProvider>
  )
}
