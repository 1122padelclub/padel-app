"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function TestResendPage() {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("Test de Email - Match Tag CRM")
  const [message, setMessage] = useState("Este es un email de prueba para verificar la configuración de Resend.")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const sendTestEmail = async () => {
    if (!to) {
      toast.error("Por favor ingresa un email de destino")
      return
    }

    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          message
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({ 
          success: true, 
          message: "Email enviado exitosamente",
          details: data
        })
        toast.success("Email enviado exitosamente")
      } else {
        setResult({ 
          success: false, 
          message: data.error || "Error desconocido",
          details: data
        })
        toast.error(`Error: ${data.error}`)
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: `Error de conexión: ${error.message}`,
        details: { error: error.message }
      })
      toast.error(`Error de conexión: ${error.message}`)
    } finally {
      setIsSending(false)
    }
  }

  const sendRealEmail = async () => {
    if (!to) {
      toast.error("Por favor ingresa un email de destino")
      return
    }

    setIsSending(true)
    setResult(null)

    try {
      // Simular datos de reporte para prueba
      const reportData = {
        reviews: [
          { id: "1", rating: 5, comment: "Excelente servicio", customerName: "Juan Pérez", createdAt: new Date() },
          { id: "2", rating: 4, comment: "Muy bueno", customerName: "María García", createdAt: new Date() }
        ],
        orders: [
          { id: "1", total: 25.50, status: "delivered", createdAt: new Date() },
          { id: "2", total: 18.75, status: "delivered", createdAt: new Date() }
        ],
        reservations: [
          { id: "1", status: "confirmed", partySize: 4, createdAt: new Date() },
          { id: "2", status: "confirmed", partySize: 2, createdAt: new Date() }
        ],
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(),
          label: "Última semana"
        },
        summary: {
          totalReviews: 2,
          averageRating: 4.5,
          totalOrders: 2,
          totalRevenue: 44.25,
          totalReservations: 2,
          confirmationRate: 100
        }
      }

      const response = await fetch("/api/reports/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduleId: "test-schedule",
          barId: "test-bar",
          reportData,
          recipients: [to],
          barName: "Bar de Prueba",
          scheduleName: "Test Manual"
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({ 
          success: true, 
          message: "Reporte enviado exitosamente",
          details: data
        })
        toast.success("Reporte enviado exitosamente")
      } else {
        setResult({ 
          success: false, 
          message: data.error || "Error desconocido",
          details: data
        })
        toast.error(`Error: ${data.error}`)
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: `Error de conexión: ${error.message}`,
        details: { error: error.message }
      })
      toast.error(`Error de conexión: ${error.message}`)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Prueba de Resend</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuración Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>API Key de Resend</span>
                <Badge variant="default">Configurada</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>From Email</span>
                <Badge variant="default">noreply@match-tag.com</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Estado</span>
                <Badge variant="default">Listo para enviar</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prueba de Email Simple</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="to">Email de Destino</Label>
                <Input
                  id="to"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={sendTestEmail}
                disabled={isSending || !to}
                className="w-full"
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prueba de Reporte CRM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Esta prueba enviará un reporte completo del CRM con datos de ejemplo.
              </p>

              <Button 
                onClick={sendRealEmail}
                disabled={isSending || !to}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Enviar Reporte CRM Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
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
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
