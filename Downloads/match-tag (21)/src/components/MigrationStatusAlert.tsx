"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, X, Loader2 } from "lucide-react"
import { useAuth } from "@/src/hooks/useAuth"

interface MigrationStatus {
  needsMigration: boolean
  hasLegacyData: boolean
  hasNewStructure: boolean
  version?: string
}

export default function MigrationStatusAlert() {
  const { user } = useAuth()
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const checkStatus = async () => {
    if (!user?.barId || isDismissed) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Checking migration status for bar:", user.barId)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`/api/admin/migrate-bar?barId=${encodeURIComponent(user.barId)}`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Migration status response:", data)

      if (data.migrationStatus) {
        setStatus(data.migrationStatus)
        setRetryCount(0) // Reset retry count on success
      } else {
        throw new Error(data.error || "Invalid response format")
      }
    } catch (err) {
      console.error("[v0] Migration status check error:", err)

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Timeout al verificar estado - el servidor tardó demasiado en responder")
        } else if (err.message.includes("fetch")) {
          setError("Error de conexión - verifica tu conexión a internet")
        } else {
          setError(`Error: ${err.message}`)
        }
      } else {
        setError("Error desconocido al verificar estado")
      }

      setRetryCount((prev) => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMigrate = async () => {
    if (!user?.barId) return

    setIsMigrating(true)
    setError(null)

    try {
      console.log("[v0] Starting migration for bar:", user.barId)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for migration

      const response = await fetch("/api/admin/migrate-bar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barId: user.barId, force: false }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Migration response:", data)

      if (data.success) {
        await checkStatus()
        // Recargar página para aplicar cambios
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(data.error || "Migration failed")
      }
    } catch (err) {
      console.error("[v0] Migration error:", err)

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Timeout durante la migración - el proceso tardó demasiado")
        } else {
          setError(`Error durante la migración: ${err.message}`)
        }
      } else {
        setError("Error desconocido durante la migración")
      }
    } finally {
      setIsMigrating(false)
    }
  }

  useEffect(() => {
    if (user?.barId && !isDismissed) {
      checkStatus()
    }
  }, [user?.barId, isDismissed])

  // Auto-dismiss after too many retries
  useEffect(() => {
    if (retryCount >= 3) {
      console.warn("[v0] Too many migration check failures, auto-dismissing")
      setIsDismissed(true)
    }
  }, [retryCount])

  if (isDismissed || !status || (!status.needsMigration && status.hasNewStructure)) {
    return null
  }

  if (isLoading) {
    return (
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <AlertDescription>Verificando estado de configuración...</AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium mb-1">Error de migración</div>
            <div className="text-sm opacity-80">{error}</div>
            {retryCount > 0 && <div className="text-xs opacity-60 mt-1">Intentos fallidos: {retryCount}/3</div>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={checkStatus} disabled={isLoading}>
              <RefreshCw className="w-3 h-3" />
              Reintentar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsDismissed(true)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (status.needsMigration) {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium mb-1">Actualización de configuración disponible</div>
            <div className="text-sm opacity-80">
              Tu bar necesita migrar a la nueva estructura de configuración para acceder a las últimas funciones.
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button size="sm" onClick={handleMigrate} disabled={isMigrating}>
              {isMigrating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Actualizar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsDismissed(true)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
