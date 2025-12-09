"use client"

import { useSearchParams } from "next/navigation"
import { AdminReservationsPanelSimple } from "@/src/components/AdminReservationsPanelSimple"
import { BarEmailConfig } from "@/src/components/BarEmailConfig"
import { OccupancyRateMonitor } from "@/src/components/OccupancyRateMonitor"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useT } from "@/src/hooks/useTranslation"

export const dynamic = "force-dynamic"

function AdminReservasContent() {
  const t = useT()
  const sp = useSearchParams()
  const barId = sp.get("barId") ?? ""

  if (!barId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">ID de Bar Requerido</h1>
          <p className="text-gray-300">
            Por favor, proporciona un barId válido en la URL.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t("admin.reservationManagement")}</h1>
          <p className="text-gray-300">
            {t("admin.manageRestaurantReservations")}
          </p>
        </div>
        
        <Tabs defaultValue="reservations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reservations">{t("admin.reservations")}</TabsTrigger>
            <TabsTrigger value="occupancy">{t("admin.occupancy")}</TabsTrigger>
            <TabsTrigger value="email-config">{t("admin.emailConfiguration")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reservations">
            <AdminReservationsPanelSimple barId={barId} />
          </TabsContent>
          
          <TabsContent value="occupancy">
            <OccupancyRateMonitor barId={barId} />
          </TabsContent>
          
          <TabsContent value="email-config">
            <BarEmailConfig barId={barId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminReservasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando gestión de reservas...</p>
        </div>
      </div>
    }>
      <AdminReservasContent />
    </Suspense>
  )
}