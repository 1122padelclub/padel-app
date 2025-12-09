"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function TestSimplePage() {
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const sendTestEmail = async () => {
    setIsSending(true)
    setResult(null)

    try {
      console.log("🚀 Enviando email de prueba...")

      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "gibra.company@gmail.com",
          subject: "Hello World - Match Tag CRM",
          message: "¡Congrats on sending your first email with Match Tag CRM! 🎉\n\nEste es un email de prueba para verificar que Resend está funcionando correctamente.\n\nSaludos,\nEl equipo de Match Tag"
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({ 
          success: true, 
          message: "Email enviado exitosamente a gibra.company@gmail.com",
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
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Prueba Simple de Resend</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>API Key</span>
                <Badge variant="default">re_QByXgbB7_BeRY5oaQcwyWADFT8UtV5eW6</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>From Email</span>
                <Badge variant="default">onboarding@resend.dev</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>To Email</span>
                <Badge variant="default">gibra.company@gmail.com</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Librería</span>
                <Badge variant="default">Resend Oficial</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prueba de Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Este botón enviará un email de prueba usando exactamente el mismo código que me mostraste:
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm">
{`import { Resend } from 'resend';

const resend = new Resend('re_QByXgbB7_BeRY5oaQcwyWADFT8UtV5eW6');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'gibra.company@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});`}
                </pre>
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Haz clic en "Enviar Email de Prueba"</li>
              <li>Revisa la consola del navegador para ver los logs</li>
              <li>Revisa tu bandeja de entrada en gibra.company@gmail.com</li>
              <li>Si no llega, revisa la carpeta de spam</li>
              <li>El email debería llegar desde "onboarding@resend.dev"</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
