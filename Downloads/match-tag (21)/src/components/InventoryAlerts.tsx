"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, XCircle, Clock } from "lucide-react"
import { useInventory } from "@/src/hooks/useInventory"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface InventoryAlertsProps {
  barId: string
}

export function InventoryAlerts({ barId }: InventoryAlertsProps) {
  const { alerts, loading } = useInventory(barId)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return <XCircle className="h-5 w-5" />
      case 'low_stock':
        return <AlertTriangle className="h-5 w-5" />
      case 'expired':
        return <XCircle className="h-5 w-5" />
      case 'near_expiry':
        return <Clock className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-green-600" />
            Alertas de Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-green-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
            <p className="font-medium">No hay alertas</p>
            <p className="text-sm text-gray-600">Todo el inventario está en niveles óptimos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Agrupar alertas por severidad
  const criticalAlerts = alerts.filter(a => a.severity === 'critical')
  const highAlerts = alerts.filter(a => a.severity === 'high')
  const mediumAlerts = alerts.filter(a => a.severity === 'medium')
  const lowAlerts = alerts.filter(a => a.severity === 'low')

  return (
    <div className="space-y-4">
      {/* Resumen de alertas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-sm text-red-800 font-medium">Críticas</div>
            <div className="text-3xl font-bold text-red-600">{criticalAlerts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="text-sm text-orange-800 font-medium">Altas</div>
            <div className="text-3xl font-bold text-orange-600">{highAlerts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="text-sm text-yellow-800 font-medium">Medias</div>
            <div className="text-3xl font-bold text-yellow-600">{mediumAlerts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800 font-medium">Bajas</div>
            <div className="text-3xl font-bold text-blue-600">{lowAlerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.alertType)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{alert.itemName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {alert.itemSku}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                    {alert.currentStock !== undefined && (
                      <div className="text-xs mt-2 opacity-75">
                        Stock actual: {alert.currentStock.toFixed(2)}
                        {alert.minStock && ` / Mínimo: ${alert.minStock.toFixed(2)}`}
                      </div>
                    )}
                    {alert.expiryDate && (
                      <div className="text-xs mt-1 opacity-75">
                        Vencimiento: {format(alert.expiryDate, "dd/MM/yyyy", { locale: es })}
                      </div>
                    )}
                  </div>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity === 'critical' && '🔴 CRÍTICO'}
                    {alert.severity === 'high' && '🟠 ALTO'}
                    {alert.severity === 'medium' && '🟡 MEDIO'}
                    {alert.severity === 'low' && '🔵 BAJO'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

