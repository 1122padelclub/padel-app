"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, Send, Loader2, Calendar, Users, Clock } from "lucide-react"
import { toast } from "sonner"

export default function TestReservationEmailPage() {
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)
  const [customerEmail, setCustomerEmail] = useState("gibra.company@gmail.com")
  const [barName, setBarName] = useState("Match Tag Bar")

  const sendTestReservationEmail = async () => {
    setIsSending(true)
    setResult(null)

    try {
      console.log("🚀 Enviando email de confirmación de reserva...")

      const response = await fetch("/api/test-reservation-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: customerEmail,
          barName: barName
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Email de confirmación de reserva enviado exitosamente a ${customerEmail}`,
          details: data
        })
        toast.success("Email de confirmación enviado")
        console.log("✅ Email de confirmación enviado:", data)
      } else {
        setResult({ 
          success: false, 
          message: data.error || "Error desconocido",
          details: data
        })
        toast.error(`Error: ${data.error}`)
        console.error("❌ Error:", data)
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: `Error de conexión: ${error.message}`,
        details: { error: error.message }
      })
      toast.error(`Error de conexión: ${error.message}`)
      console.error("❌ Error de conexión:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Prueba de Emails de Reservas</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerEmail">Email del Cliente</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="barName">Nombre del Bar</Label>
                  <Input
                    id="barName"
                    type="text"
                    value={barName}
                    onChange={(e) => setBarName(e.target.value)}
                    placeholder="Mi Bar"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Reserva de Prueba */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reserva de Prueba
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Cliente:</span>
                  <Badge variant="default">Cliente de Prueba</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Fecha:</span>
                  <Badge variant="secondary">Mañana</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Hora:</span>
                  <Badge variant="outline">19:30</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Personas:</span>
                  <Badge variant="outline">4</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Mesa:</span>
                  <Badge variant="outline">Mesa 5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estado:</span>
                  <Badge variant="default" className="bg-green-600">Confirmada</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prueba de Envío */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Prueba de Envío
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ ¿Qué se enviará?</h4>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Email de confirmación de reserva</li>
                  <li>Diseño profesional con branding de {barName}</li>
                  <li>Detalles completos de la reserva</li>
                  <li>Información importante y políticas</li>
                  <li>ID de reserva para seguimiento</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📧 Flujo Automático</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Cliente hace una reserva en el sistema</li>
                  <li>Se crea la reserva en Firebase</li>
                  <li>Se envía automáticamente el email de confirmación</li>
                  <li>Cliente recibe confirmación en su email</li>
                  <li>Si el admin modifica la reserva, se envía actualización</li>
                </ol>
              </div>

              <Button 
                onClick={sendTestReservationEmail}
                disabled={isSending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Email de Confirmación de Reserva
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Resultado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${
                result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <p className="font-semibold mb-2">{result.message}</p>
                {result.details && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Detalles de la Reserva:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>ID de Reserva:</strong> {result.details.reservationId}
                      </div>
                      <div>
                        <strong>Cliente:</strong> {result.details.customerName}
                      </div>
                      <div>
                        <strong>Email:</strong> {result.details.to}
                      </div>
                      <div>
                        <strong>Bar:</strong> {result.details.barName}
                      </div>
                      <div>
                        <strong>Fecha:</strong> {new Date(result.details.reservationDate).toLocaleDateString('es-ES')}
                      </div>
                      <div>
                        <strong>Hora:</strong> {result.details.reservationTime}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Respuesta del Servidor:</h4>
                      <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sistema de Emails de Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">🔄 Tipos de Emails Automáticos</h4>
                <ul className="text-amber-800 space-y-1 list-disc list-inside">
                  <li><strong>Confirmación:</strong> Cuando se crea una nueva reserva</li>
                  <li><strong>Actualización:</strong> Cuando se modifica una reserva existente</li>
                  <li><strong>Confirmación Admin:</strong> Cuando el admin confirma una reserva</li>
                  <li><strong>Cancelación:</strong> Cuando se cancela una reserva</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Características del Email</h4>
                <ul className="text-green-800 space-y-1 list-disc list-inside">
                  <li>Diseño responsive y profesional</li>
                  <li>Información completa de la reserva</li>
                  <li>Políticas de cancelación claras</li>
                  <li>ID de reserva para seguimiento</li>
                  <li>Branding personalizado del bar</li>
                  <li>Formato HTML y texto plano</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📧 Configuración</h4>
                <p className="text-blue-800">
                  Los emails se envían desde <strong>noreply@match-tag.com</strong> hacia el email 
                  que el cliente proporciona al hacer la reserva. El sistema es completamente automático 
                  y no requiere intervención manual.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
