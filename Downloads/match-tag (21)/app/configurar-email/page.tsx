"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, Send, Loader2, Settings, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function ConfigurarEmailPage() {
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)
  const [adminEmail, setAdminEmail] = useState("gibra.company@gmail.com")

  const sendTestEmail = async () => {
    setIsSending(true)
    setResult(null)

    try {
      console.log("🚀 Enviando email de prueba desde noreply@match-tag.com...")

      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: adminEmail,
          subject: "📊 Reporte CRM - Match Tag",
          message: `¡Hola! Este es un reporte de prueba desde Match Tag CRM.

📈 Resumen del Reporte:
• Fecha: ${new Date().toLocaleDateString('es-ES')}
• Bar: Bar de Prueba
• Tipo: Reporte de Prueba

Este email se envió desde noreply@match-tag.com hacia ${adminEmail} para verificar la configuración del sistema de reportes.

Saludos,
El equipo de Match Tag CRM`
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Email enviado exitosamente desde noreply@match-tag.com hacia ${adminEmail}`,
          details: data
        })
        toast.success("Email enviado exitosamente")
        console.log("✅ Email enviado:", data)
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
        <h1 className="text-4xl font-bold mb-8 text-center">Configuración de Email Personalizado</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Configuración Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email de Origen:</span>
                  <Badge variant="default">noreply@match-tag.com</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email de Destino:</span>
                  <Badge variant="secondary">{adminEmail}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Servicio:</span>
                  <Badge variant="outline">Resend</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">API Key:</span>
                  <Badge variant="outline">re_QByXgbB7_BeRY5oaQcwyWADFT8UtV5eW6</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Destino */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email de Destino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminEmail">Email del Administrador</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@ejemplo.com"
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Este es el email que recibirá los reportes CRM automáticamente.
                </p>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona?</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Los reportes se envían desde <strong>noreply@match-tag.com</strong></li>
                  <li>Hacia el email del administrador: <strong>{adminEmail}</strong></li>
                  <li>Se programan automáticamente (diario, semanal, mensual)</li>
                  <li>Incluyen datos reales del CRM (reservas, pedidos, reseñas)</li>
                </ol>
              </div>

              <Button 
                onClick={sendTestEmail}
                disabled={isSending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Email de Prueba
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
                    <h4 className="font-medium mb-2">Detalles:</h4>
                    <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información Importante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Información Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">⚠️ Configuración de Dominio</h4>
                <p className="text-amber-800">
                  Para usar <strong>noreply@match-tag.com</strong>, necesitas configurar tu dominio en Resend:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-amber-800">
                  <li>Ve a <a href="https://resend.com/domains" target="_blank" className="underline">resend.com/domains</a></li>
                  <li>Agrega tu dominio "match-tag.com"</li>
                  <li>Configura los registros DNS requeridos</li>
                  <li>Verifica el dominio</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Mientras tanto</h4>
                <p className="text-green-800">
                  El sistema usará <strong>onboarding@resend.dev</strong> para las pruebas, 
                  pero una vez configurado tu dominio, automáticamente cambiará a <strong>noreply@match-tag.com</strong>.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📧 Flujo de Reportes</h4>
                <p className="text-blue-800">
                  Los reportes se envían automáticamente según la programación configurada en el panel de administración.
                  Cada reporte incluye datos reales de reservas, pedidos y reseñas del bar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
