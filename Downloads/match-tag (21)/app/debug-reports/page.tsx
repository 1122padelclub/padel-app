"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useReportSchedules } from "@/src/hooks/useReportSchedules"
import { ReportScheduler } from "@/src/components/ReportScheduler"
import { Loader2, Mail, Clock, CheckCircle, XCircle, ArrowLeft, Play, Send } from "lucide-react"
import { toast } from "sonner"

function DebugReportsContent() {
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId") || ""

  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule, toggleSchedule } = useReportSchedules(barId)
  const [isTestingEmail, setIsTestingEmail] = useState(false)

  useEffect(() => {
    console.log("--- Debug Reports State Update ---")
    console.log("Bar ID:", barId)
    console.log("Schedules:", schedules)
    console.log("Loading:", loading)
    console.log("-------------------------------")
  }, [barId, schedules, loading])

  const testEmailService = async () => {
    setIsTestingEmail(true)
    try {
      const response = await fetch("/api/reports/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduleId: schedules[0]?.id || "test",
          barId: barId
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success("Email de prueba enviado exitosamente")
        console.log("Email test result:", result)
      } else {
        toast.error(`Error: ${result.error}`)
        console.error("Email test error:", result)
      }
    } catch (error: any) {
      toast.error(`Error de conexión: ${error.message}`)
      console.error("Email test connection error:", error)
    } finally {
      setIsTestingEmail(false)
    }
  }

  const createTestSchedule = async () => {
    try {
      const testSchedule = {
        name: "Reporte de Prueba",
        description: "Reporte de prueba para verificar el sistema",
        frequency: "daily" as const,
        time: "09:00",
        recipients: ["test@ejemplo.com"],
        reportTypes: [
          { type: "consolidated" as const, includeCharts: true, includeRawData: true }
        ],
        isActive: true
      }

      await createSchedule(testSchedule)
      toast.success("Reporte de prueba creado exitosamente")
    } catch (error: any) {
      toast.error(`Error creando reporte de prueba: ${error.message}`)
    }
  }

  if (!barId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-600 mb-4">No se proporcionó barId</p>
            <Link href="/admin">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="container mx-auto">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Admin
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Debug de Reportes Programados</h1>
          <p className="text-gray-600">
            Prueba el sistema de reportes programados por email
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bar ID: <span className="font-mono text-blue-600">{barId}</span>
          </p>
        </div>

        {/* Estado del sistema */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{schedules.length}</div>
                <p className="text-sm text-gray-600">Reportes Programados</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {schedules.filter(s => s.isActive).length}
                </div>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {schedules.filter(s => !s.isActive).length}
                </div>
                <p className="text-sm text-gray-600">Inactivos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    "✓"
                  )}
                </div>
                <p className="text-sm text-gray-600">Estado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de prueba */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pruebas del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={createTestSchedule} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Crear Reporte de Prueba
              </Button>
              
              {schedules.length > 0 && (
                <Button 
                  onClick={testEmailService} 
                  disabled={isTestingEmail}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isTestingEmail ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Probar Envío de Email
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de reportes programados */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reportes Programados</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay reportes programados</h3>
                <p className="text-muted-foreground mb-4">
                  Crea un reporte de prueba para comenzar
                </p>
                <Button onClick={createTestSchedule}>
                  <Play className="h-4 w-4 mr-2" />
                  Crear Reporte de Prueba
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{schedule.name}</h3>
                          <Badge variant={schedule.isActive ? "default" : "secondary"}>
                            {schedule.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        
                        {schedule.description && (
                          <p className="text-sm text-muted-foreground mb-3">{schedule.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {schedule.frequency === "daily" ? "Diario" :
                               schedule.frequency === "weekly" ? "Semanal" : "Mensual"} a las {schedule.time}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{schedule.recipients.length} destinatario(s)</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {schedule.nextScheduled 
                                ? `Próximo: ${new Date(schedule.nextScheduled).toLocaleDateString('es-ES')}`
                                : 'No programado'
                              }
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {schedule.reportTypes.map((rt, index) => (
                              <Badge key={index} variant="outline">
                                {rt.type === 'reviews' ? 'Reseñas' :
                                 rt.type === 'orders' ? 'Pedidos' :
                                 rt.type === 'reservations' ? 'Reservas' :
                                 'Consolidado'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSchedule(schedule.id, !schedule.isActive)}
                        >
                          {schedule.isActive ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurador de reportes */}
        <Card>
          <CardHeader>
            <CardTitle>Configurador de Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportScheduler barId={barId} />
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Configurar Email Service:</strong> Asegúrate de tener configuradas las variables de entorno para Resend.
              </li>
              <li>
                <strong>Crear Reporte de Prueba:</strong> Haz clic en "Crear Reporte de Prueba" para generar un reporte de ejemplo.
              </li>
              <li>
                <strong>Probar Envío:</strong> Usa "Probar Envío de Email" para enviar un reporte inmediatamente.
              </li>
              <li>
                <strong>Configurar Reportes:</strong> Usa el configurador para crear reportes personalizados.
              </li>
              <li>
                <strong>Verificar Logs:</strong> Revisa la consola del navegador para ver los logs de debugging.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DebugReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando debug de reportes...</p>
        </div>
      </div>
    }>
      <DebugReportsContent />
    </Suspense>
  )
}
