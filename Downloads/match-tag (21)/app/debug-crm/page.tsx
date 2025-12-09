"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCRMDashboard } from "@/src/hooks/useCRMDashboard"
import { ReviewsDashboard } from "@/src/components/ReviewsDashboard"
import { OrdersDashboard } from "@/src/components/OrdersDashboard"
import { ReservationsDashboard } from "@/src/components/ReservationsDashboard"
import { ConsolidatedCRMDashboard } from "@/src/components/ConsolidatedCRMDashboard"
import { Loader2, BarChart3, Star, ShoppingCart, Calendar, ArrowLeft } from "lucide-react"

function DebugCRMContent() {
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId") || ""

  const crmData = useCRMDashboard(barId)
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "orders" | "reservations">("overview")

  useEffect(() => {
    console.log("--- Debug CRM State Update ---")
    console.log("Bar ID:", barId)
    console.log("CRM Data:", crmData)
    console.log("Reviews Count:", crmData.reviews.length)
    console.log("Orders Count:", crmData.orders.length)
    console.log("Reservations Count:", crmData.reservations.length)
    console.log("Loading:", crmData.loading)
    console.log("Error:", crmData.error)
    console.log("-------------------------------")
  }, [barId, crmData])

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
          <h1 className="text-4xl font-bold mb-2">Debug KPIs Dashboard</h1>
          <p className="text-gray-600">
            Prueba los dashboards de KPIs con datos reales de Firebase
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bar ID: <span className="font-mono text-blue-600">{barId}</span>
          </p>
        </div>

        {/* Estado de los datos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado de los Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{crmData.reviews.length}</div>
                <p className="text-sm text-gray-600">Reseñas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{crmData.orders.length}</div>
                <p className="text-sm text-gray-600">Pedidos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{crmData.reservations.length}</div>
                <p className="text-sm text-gray-600">Reservas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {crmData.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    "✓"
                  )}
                </div>
                <p className="text-sm text-gray-600">Estado</p>
              </div>
            </div>
            {crmData.error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">
                  <strong>Error:</strong> {crmData.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegación de pestañas */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard General
          </Button>
          <Button
            variant={activeTab === "reviews" ? "default" : "outline"}
            onClick={() => setActiveTab("reviews")}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Reseñas
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Pedidos
          </Button>
          <Button
            variant={activeTab === "reservations" ? "default" : "outline"}
            onClick={() => setActiveTab("reservations")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Reservas
          </Button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <ConsolidatedCRMDashboard
              reviews={crmData.reviews}
              orders={crmData.orders}
              reservations={crmData.reservations}
              loading={crmData.loading}
            />
          )}

          {activeTab === "reviews" && (
            <ReviewsDashboard
              reviews={crmData.reviews}
              loading={crmData.loading}
            />
          )}

          {activeTab === "orders" && (
            <OrdersDashboard
              orders={crmData.orders}
              loading={crmData.loading}
            />
          )}

          {activeTab === "reservations" && (
            <ReservationsDashboard
              reservations={crmData.reservations}
              loading={crmData.loading}
            />
          )}
        </div>

        {/* Instrucciones */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Verifica la conexión:</strong> Asegúrate de que el Bar ID sea correcto y que tengas datos en Firebase.
              </li>
              <li>
                <strong>Prueba los filtros:</strong> Usa los filtros de período y estado en cada dashboard.
              </li>
              <li>
                <strong>Exporta datos:</strong> Prueba los botones de exportación a Excel en cada dashboard.
              </li>
              <li>
                <strong>Verifica métricas:</strong> Revisa que los KPIs se calculen correctamente con los datos reales.
              </li>
              <li>
                <strong>Prueba en tiempo real:</strong> Agrega datos en Firebase y verifica que se actualicen automáticamente.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DebugCRMPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando CRM debug...</p>
        </div>
      </div>
    }>
      <DebugCRMContent />
    </Suspense>
  )
}
