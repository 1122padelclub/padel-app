"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/src/hooks/useAuth"
import { useWaiterCalls } from "@/src/hooks/useWaiterCalls"
import { useOrders } from "@/src/hooks/useOrders"
import { useAdminTables } from "@/src/hooks/useAdminTables"

function DebugFlowContent() {
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId")
  
  const { user, loading: authLoading } = useAuth()
  const { calls: waiterCalls, loading: waiterLoading, getPendingCallsCount } = useWaiterCalls(barId || "")
  const { orders, loading: ordersLoading } = useOrders(barId || "")
  const { tables: adminTables, loading: tablesLoading } = useAdminTables(barId || "")

  const testBarId = barId || user?.barId || user?.uid || "test-bar"

  const checks = [
    {
      name: "Autenticación",
      status: authLoading ? "loading" : user ? "success" : "error",
      details: user ? `Usuario: ${user.email}, BarId: ${user.barId || user.uid}` : "No autenticado"
    },
    {
      name: "Bar ID",
      status: testBarId ? "success" : "error",
      details: testBarId || "No disponible"
    },
    {
      name: "Llamadas al Mesero",
      status: waiterLoading ? "loading" : "success",
      details: `${waiterCalls.length} llamadas, ${getPendingCallsCount()} pendientes`
    },
    {
      name: "Órdenes",
      status: ordersLoading ? "loading" : "success",
      details: `${orders.length} órdenes encontradas`
    },
    {
      name: "Mesas del Admin",
      status: tablesLoading ? "loading" : "success",
      details: `${adminTables.length} mesas del admin`
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "loading":
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Debug del Flujo Completo</h1>
          <p className="text-gray-600 mt-2">
            Verifica que todos los componentes del sistema funcionen correctamente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-sm text-gray-600">{check.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enlaces de Prueba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Admin</h4>
                <Link href="/admin">
                  <Button className="w-full mb-2">Panel de Admin</Button>
                </Link>
              </div>
              <div>
                <h4 className="font-medium mb-2">Personalización</h4>
                <Link href={`/admin/personalizacion-mesas?barId=${testBarId}`}>
                  <Button className="w-full mb-2">Personalizar Mesas</Button>
                </Link>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mesa de Prueba</h4>
                <Link href={`/mesa?barId=${testBarId}&tableId=test-table-1`}>
                  <Button className="w-full mb-2">Ir a Mesa</Button>
                </Link>
              </div>
              <div>
                <h4 className="font-medium mb-2">Debug de Chat</h4>
                <Link href={`/debug-chat?barId=${testBarId}&tableId=test-table-1`}>
                  <Button variant="outline" className="w-full mb-2">Debug Chat</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información Detallada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Usuario</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Llamadas al Mesero</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(waiterCalls.slice(0, 3), null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Órdenes</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(orders.slice(0, 3), null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DebugFlowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando debug del flujo...</p>
        </div>
      </div>
    }>
      <DebugFlowContent />
    </Suspense>
  )
}






