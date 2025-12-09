"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"

export default function SetupEmailPage() {
  const [apiKey, setApiKey] = useState("")
  const [fromEmail, setFromEmail] = useState("")
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const testEmailService = async () => {
    if (!apiKey || !fromEmail) {
      toast.error("Por favor completa todos los campos")
      return
    }

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: fromEmail,
          subject: "Test de Email - Match Tag CRM",
          message: "Este es un email de prueba para verificar la configuración del servicio de email."
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setTestResult({ success: true, message: "Email de prueba enviado exitosamente" })
        toast.success("Email de prueba enviado")
      } else {
        setTestResult({ success: false, message: result.error })
        toast.error(`Error: ${result.error}`)
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message })
      toast.error(`Error de conexión: ${error.message}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Configuración de Email Service</h1>
        
        <div className="space-y-8">
          {/* Información sobre Resend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración de Resend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Para usar el sistema de reportes programados, necesitas configurar un servicio de email. 
                  Recomendamos usar <strong>Resend</strong> que ofrece 3,000 emails gratuitos por mes.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Pasos para configurar Resend:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Ve a <a href="https://resend.com" target="_blank" className="text-blue-600 hover:underline">resend.com</a> y crea una cuenta</li>
                    <li>Verifica tu dominio o usa el dominio de prueba</li>
                    <li>Obtén tu API key desde el dashboard</li>
                    <li>Configura las variables de entorno en Vercel</li>
                  </ol>
                </div>

                <Button 
                  onClick={() => window.open("https://resend.com", "_blank")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir a Resend
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de configuración */}
          <Card>
            <CardHeader>
              <CardTitle>Variables de Entorno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="apiKey">RESEND_API_KEY</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(apiKey)}
                      disabled={!apiKey}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Tu API key de Resend (comienza con "re_")
                  </p>
                </div>

                <div>
                  <Label htmlFor="fromEmail">FROM_EMAIL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fromEmail"
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="noreply@tudominio.com"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(fromEmail)}
                      disabled={!fromEmail}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Email desde el cual se enviarán los reportes
                  </p>
                </div>

                <Button 
                  onClick={testEmailService}
                  disabled={!apiKey || !fromEmail}
                  className="w-full"
                >
                  Probar Configuración
                </Button>

                {testResult && (
                  <div className={`p-4 rounded-lg flex items-center gap-2 ${
                    testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Código para Vercel */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración en Vercel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Para configurar las variables de entorno en Vercel:
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Variables de Entorno:</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between items-center">
                      <span>NEXT_PUBLIC_RESEND_API_KEY</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard("NEXT_PUBLIC_RESEND_API_KEY")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>NEXT_PUBLIC_FROM_EMAIL</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard("NEXT_PUBLIC_FROM_EMAIL")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>NEXT_PUBLIC_APP_URL</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard("NEXT_PUBLIC_APP_URL")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>CRON_SECRET</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard("CRON_SECRET")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-yellow-800">Pasos en Vercel:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                    <li>Ve a tu proyecto en Vercel Dashboard</li>
                    <li>Ve a Settings → Environment Variables</li>
                    <li>Agrega cada variable con su valor correspondiente</li>
                    <li>Redeploy tu aplicación</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado actual */}
          <Card>
            <CardHeader>
              <CardTitle>Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email Service</span>
                  <Badge variant={apiKey ? "default" : "secondary"}>
                    {apiKey ? "Configurado" : "No configurado"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>From Email</span>
                  <Badge variant={fromEmail ? "default" : "secondary"}>
                    {fromEmail ? "Configurado" : "No configurado"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Modo de Prueba</span>
                  <Badge variant="outline">
                    {!apiKey ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
