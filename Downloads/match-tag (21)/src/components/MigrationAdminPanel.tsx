"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Database, RefreshCw, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface MigrationResult {
  success: boolean
  message: string
  error?: string
  details?: any
}

interface MigrationStatus {
  barId: string
  migrationStatus: {
    needsMigration: boolean
    hasLegacyData: boolean
    hasNewStructure: boolean
    version?: string
  }
}

export default function MigrationAdminPanel() {
  const [barId, setBarId] = useState("")
  const [force, setForce] = useState(false)
  const [batchSize, setBatchSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [isMassLoading, setIsMassLoading] = useState(false)
  const [isStatusLoading, setIsStatusLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null)

  const handleSingleMigration = async () => {
    if (!barId.trim()) {
      setResult({
        success: false,
        message: "Por favor ingresa un ID de bar válido",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/migrate-bar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barId: barId.trim(), force }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Error de conexión al servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMassMigration = async () => {
    setIsMassLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/migrate-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force, batchSize }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Error de conexión al servidor durante migración masiva",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsMassLoading(false)
    }
  }

  const checkMigrationStatus = async () => {
    if (!barId.trim()) {
      setResult({
        success: false,
        message: "Por favor ingresa un ID de bar válido para verificar el estado",
      })
      return
    }

    setIsStatusLoading(true)
    setMigrationStatus(null)

    try {
      const response = await fetch(`/api/admin/migrate-bar?barId=${encodeURIComponent(barId.trim())}`)
      const data = await response.json()

      if (response.ok) {
        setMigrationStatus(data)
      } else {
        setResult({
          success: false,
          message: "Error al verificar estado de migración",
          error: data.error,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Error de conexión al verificar estado",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsStatusLoading(false)
    }
  }

  const getStatusBadge = (status: MigrationStatus["migrationStatus"]) => {
    if (!status.needsMigration && status.hasNewStructure) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Migrado</Badge>
    }
    if (status.needsMigration && status.hasLegacyData) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendiente</Badge>
    }
    if (!status.hasLegacyData && !status.hasNewStructure) {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Sin datos</Badge>
    }
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Desconocido</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Panel de Migración de Bares
          </CardTitle>
          <CardDescription>
            Herramientas para migrar bares individuales o en lote a la nueva estructura de configuración
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Migración Individual */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Migración Individual</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barId">ID del Bar</Label>
                <Input
                  id="barId"
                  value={barId}
                  onChange={(e) => setBarId(e.target.value)}
                  placeholder="Ej: bar123, restaurant-abc"
                  disabled={isLoading || isStatusLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Opciones</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="force" checked={force} onCheckedChange={(checked) => setForce(checked === true)} />
                  <Label htmlFor="force" className="text-sm">
                    Forzar migración (sobrescribir datos existentes)
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={checkMigrationStatus} disabled={isStatusLoading || !barId.trim()} variant="outline">
                {isStatusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar Estado"}
              </Button>
              <Button onClick={handleSingleMigration} disabled={isLoading || !barId.trim()}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Migrar Bar"}
              </Button>
            </div>

            {/* Estado de Migración */}
            {migrationStatus && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Estado de {migrationStatus.barId}:</span>
                    {getStatusBadge(migrationStatus.migrationStatus)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Necesita migración: {migrationStatus.migrationStatus.needsMigration ? "Sí" : "No"}</div>
                    <div>Tiene datos legacy: {migrationStatus.migrationStatus.hasLegacyData ? "Sí" : "No"}</div>
                    <div>Tiene nueva estructura: {migrationStatus.migrationStatus.hasNewStructure ? "Sí" : "No"}</div>
                    {migrationStatus.migrationStatus.version && (
                      <div>Versión: {migrationStatus.migrationStatus.version}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Migración Masiva */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Migración Masiva</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchSize">Tamaño de lote</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min="1"
                  max="50"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number.parseInt(e.target.value) || 10)}
                  disabled={isMassLoading}
                />
                <p className="text-xs text-muted-foreground">Número de bares a procesar simultáneamente</p>
              </div>

              <div className="space-y-2">
                <Label>Opciones Masivas</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="massForce" checked={force} onCheckedChange={(checked) => setForce(checked === true)} />
                  <Label htmlFor="massForce" className="text-sm">
                    Forzar migración en todos los bares
                  </Label>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                La migración masiva procesará todos los bares en la base de datos. Esta operación puede tomar varios
                minutos dependiendo del número de bares.
              </AlertDescription>
            </Alert>

            <Button onClick={handleMassMigration} disabled={isMassLoading} variant="destructive">
              {isMassLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar Migración Masiva"}
            </Button>
          </div>

          {/* Resultado */}
          {result && (
            <Alert
              className={result.success ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                <div className="font-medium mb-1">{result.message}</div>
                {result.error && <div className="text-sm opacity-80">Error: {result.error}</div>}
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">Ver detalles</summary>
                    <pre className="mt-1 text-xs bg-black/20 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
