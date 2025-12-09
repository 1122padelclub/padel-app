"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, CheckCircle, AlertCircle, Phone } from "lucide-react"
import { useWaiterCalls } from "@/src/hooks/useWaiterCalls"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useT } from "@/src/hooks/useTranslation"

interface WaiterCallsPanelProps {
  barId: string
}

export function WaiterCallsPanel({ barId }: WaiterCallsPanelProps) {
  const t = useT()
  const { calls, loading, updateCallStatus, getPendingCallsCount, getAttendingCallsCount } = useWaiterCalls(barId)
  const [updatingCall, setUpdatingCall] = useState<string | null>(null)

  const handleStatusUpdate = async (callId: string, status: "pending" | "attending" | "resolved") => {
    setUpdatingCall(callId)
    try {
      await updateCallStatus(callId, status)
    } catch (error) {
      console.error("Error updating call status:", error)
    } finally {
      setUpdatingCall(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-500"
      case "attending":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "attending":
        return <Clock className="w-4 h-4" />
      case "resolved":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return t("admin.pending")
      case "attending":
        return t("admin.attending")
      case "resolved":
        return t("admin.resolved")
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen de llamadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{getPendingCallsCount()}</p>
                <p className="text-sm text-muted-foreground">{t("admin.pending")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{getAttendingCallsCount()}</p>
                <p className="text-sm text-muted-foreground">{t("admin.attending")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{calls.length}</p>
                <p className="text-sm text-muted-foreground">{t("admin.totalToday")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de llamadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
{t("admin.waiterCalls")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">{t("admin.noWaiterCalls")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)}`} />
                      {getStatusIcon(call.status)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{t("admin.table")} {call.tableNumber}</span>
                        <Badge variant="outline">{getStatusText(call.status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{call.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          try {
                            // Asegurar que timestamp sea un número válido
                            let timestamp = call.timestamp || call.createdAt || Date.now()
                            if (typeof timestamp === 'object' && timestamp !== null) {
                              timestamp = Date.now()
                            }
                            return formatDistanceToNow(new Date(timestamp), {
                              addSuffix: true,
                              locale: es,
                            })
                          } catch (error) {
                            console.error("Error formatting date:", error)
                            return "Hace un momento"
                          }
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {call.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(call.id, "attending")}
                        disabled={updatingCall === call.id}
                      >
{t("admin.attend")}
                      </Button>
                    )}

                    {call.status === "attending" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(call.id, "resolved")}
                        disabled={updatingCall === call.id}
                      >
{t("admin.complete")}
                      </Button>
                    )}

                    {call.status === "resolved" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusUpdate(call.id, "pending")}
                        disabled={updatingCall === call.id}
                      >
{t("admin.reopen")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
