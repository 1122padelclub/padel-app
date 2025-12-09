"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function DebugPersonalizacionContent() {
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId")
  const url = typeof window !== 'undefined' ? window.location.href : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Debug de Personalización</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">URL Completa</h4>
                <p className="text-sm text-gray-600 break-all">{url}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">barId Extraído</h4>
                <p className="text-sm text-gray-600">{barId || "No encontrado"}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Parámetros de URL</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enlaces de Prueba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Con barId Hardcodeado</h4>
                <Link href="/admin/personalizacion-mesas?barId=0ArbQBMQTLVAM4WT6xfA">
                  <Button className="w-full mb-2">
                    Personalización (barId fijo)
                  </Button>
                </Link>
              </div>
              <div>
                <h4 className="font-medium mb-2">Con barId de URL</h4>
                <Link href={`/admin/personalizacion-mesas?barId=${barId || '0ArbQBMQTLVAM4WT6xfA'}`}>
                  <Button className="w-full mb-2">
                    Personalización (barId dinámico)
                  </Button>
                </Link>
              </div>
              <div>
                <h4 className="font-medium mb-2">Admin Principal</h4>
                <Link href="/admin">
                  <Button variant="outline" className="w-full">
                    Ir al Admin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Debug de Consola</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Abre la consola del navegador (F12) para ver los logs detallados.
              </p>
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-medium mb-2">Logs Esperados:</h4>
                <ul className="text-sm space-y-1">
                  <li>• "Navegando a personalización con barId: [ID]"</li>
                  <li>• "Personalización - barId recibido: [ID]"</li>
                  <li>• "✅ Personalización cargada desde Firestore"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DebugPersonalizacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando debug...</p>
        </div>
      </div>
    }>
      <DebugPersonalizacionContent />
    </Suspense>
  )
}









