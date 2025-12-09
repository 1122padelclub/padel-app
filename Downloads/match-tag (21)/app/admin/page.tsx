"use client"

import { RoleGate } from "@/src/components/RoleGate"
import { useAuth } from "@/src/hooks/useAuth"
import { AdminTableList } from "@/src/components/AdminTableList"
import { AdminMenuList } from "@/src/components/AdminMenuList"
import { AdminOrdersBoard } from "@/src/components/AdminOrdersBoard"
import { AdminChatMonitor } from "@/src/components/AdminChatMonitor"
import { AdminGeneralChatPanel } from "@/src/components/AdminGeneralChatPanel"
import { AdminDashboardComponent } from "@/src/components/AdminDashboard"
import { WaiterCallsPanel } from "@/src/components/WaiterCallsPanel"
import { DisplayMenuAdminPanel } from "@/src/components/DisplayMenuAdminPanel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatToggleControl } from "@/src/components/ChatToggleControl"
import { GeneralChatToggleControl } from "@/src/components/GeneralChatToggleControl"
import { ButtonConfigurationPanel } from "@/src/components/ButtonConfigurationPanel"
import { BusinessHoursConfig } from "@/src/components/BusinessHoursConfig"
import { ReviewsDashboard } from "@/src/components/ReviewsDashboard"
import { OrdersDashboard } from "@/src/components/OrdersDashboard"
import { ReservationsDashboard } from "@/src/components/ReservationsDashboard"
import { ConsolidatedCRMDashboard } from "@/src/components/ConsolidatedCRMDashboard"
import { ReportScheduler } from "@/src/components/ReportScheduler"
import { InventoryPanel } from "@/src/components/InventoryPanel"
import { useCRMDashboard } from "@/src/hooks/useCRMDashboard"
import { useOrders } from "@/src/hooks/useOrders"
import { useWaiterCalls } from "@/src/hooks/useWaiterCalls"
import { useReservationConfig } from "@/src/hooks/useReservationConfig"
import { Bell, Palette, Link as LinkIcon, Clock, BarChart3, Star, ShoppingCart, Calendar, Mail, Package } from "lucide-react"
import { LanguageSelector } from "@/src/components/LanguageSelector"
import { useT } from "@/src/hooks/useTranslation"
import Link from "next/link"

export const dynamic = "force-dynamic"

function AdminDashboard() {
  const { user, logout, loading } = useAuth()
  const t = useT()
  
  // Debug: Log current language and translations
  console.log('AdminDashboard: Current translations:', {
    dashboard: t("navigation.dashboard"),
    orders: t("navigation.orders"),
    tables: t("navigation.tables"),
    menu: t("navigation.menu"),
    chats: t("table.chats"),
    generalChat: t("navigation.generalChat"),
    waiter: t("navigation.waiter"),
    publicMenu: t("navigation.publicMenu"),
    kpis: t("navigation.kpis"),
    reports: t("navigation.reports"),
    settings: t("navigation.settings")
  })

  // Usar el barId del usuario autenticado
  const barId = user?.barId || user?.uid

  const { getPendingCallsCount } = useWaiterCalls(barId || "")
  const pendingCalls = getPendingCallsCount()
  
  // Hook para configuración de reservas (incluye horarios)
  const { config: reservationConfig, updateConfig: updateReservationConfig, loading: configLoading } = useReservationConfig(barId || "")

  // Hook para datos del CRM
  const crmData = useCRMDashboard(barId || "")
  
  // Hook para pedidos (para notificaciones)
  const { pendingOrdersCount } = useOrders(barId || "")

  console.log("Admin - barId obtenido:", barId)
  console.log("Admin - user data:", user)
  console.log("Admin - loading:", loading)
  console.log("Admin - CRM data:", crmData)

  // Mostrar loading mientras se carga la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando administración...</p>
        </div>
      </div>
    )
  }

  // Verificar que el usuario esté autenticado y tenga barId
  if (!user || !barId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Denegado</h1>
          <p className="text-gray-300 mb-4">No tienes permisos para acceder al panel de administración</p>
          <Link href="/admin/login">
            <Button>Ir al Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 text-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white">{t("navigation.dashboard")}</h1>
            <p className="text-gray-300">{t("common.welcome")}, {user?.email}</p>
            <p className="text-xs text-gray-400">Bar ID: {barId}</p>
          </div>
          <LanguageSelector />
          <Button
            onClick={logout}
            variant="outline"
            className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {t("navigation.logout")}
          </Button>
        </div>

        {!barId || barId === "default-bar" ? (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-100">
              ⚠️ No se pudo obtener el ID del bar. Contacta al administrador del sistema.
            </p>
          </div>
        ) : null}

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-12 rounded-xl mb-6 bg-white/10 border-white/20">
            <TabsTrigger
              value="dashboard"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("navigation.dashboard")}
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white relative"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                {t("navigation.orders")}
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {pendingOrdersCount}
                  </span>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="tables"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("navigation.tables")}
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("navigation.menu")}
            </TabsTrigger>
            <TabsTrigger
              value="chats"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("table.chats")}
            </TabsTrigger>
            <TabsTrigger
              value="general-chat"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("navigation.generalChat")}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-lg relative text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {t("navigation.waiter")}
                {pendingCalls > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pendingCalls}
                  </span>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="display-menu"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("navigation.publicMenu")}
            </TabsTrigger>
            <TabsTrigger
              value="crm"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t("navigation.kpis")}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t("navigation.reports")}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                {t("navigation.inventory")}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("navigation.settings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboardComponent barId={barId} />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersBoard barId={barId} />
          </TabsContent>

          <TabsContent value="tables">
            <AdminTableList barId={barId} />
          </TabsContent>

          <TabsContent value="menu">
            <AdminMenuList barId={barId} />
          </TabsContent>

          <TabsContent value="chats">
            <AdminChatMonitor barId={barId} />
          </TabsContent>

          <TabsContent value="general-chat">
            <AdminGeneralChatPanel barId={barId} />
          </TabsContent>

          <TabsContent value="notifications">
            <WaiterCallsPanel barId={barId} />
          </TabsContent>

          <TabsContent value="display-menu">
            <DisplayMenuAdminPanel barId={barId} />
          </TabsContent>

          <TabsContent value="crm">
            <div className="space-y-6">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-xl mb-6 bg-white/10 border-white/20">
                  <TabsTrigger
                    value="dashboard"
                    className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      {t("navigation.dashboard")}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      {t("admin.reviews")}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      {t("navigation.orders")}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reservations"
                    className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t("admin.reservations")}
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <ConsolidatedCRMDashboard 
                    reviews={crmData.reviews} 
                    orders={crmData.orders} 
                    reservations={crmData.reservations} 
                    loading={crmData.loading} 
                  />
                </TabsContent>

                <TabsContent value="reviews">
                  <ReviewsDashboard reviews={crmData.reviews} loading={crmData.loading} />
                </TabsContent>

                <TabsContent value="orders">
                  <OrdersDashboard orders={crmData.orders} loading={crmData.loading} />
                </TabsContent>

                <TabsContent value="reservations">
                  <ReservationsDashboard reservations={crmData.reservations} loading={crmData.loading} />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ReportScheduler barId={barId} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryPanel barId={barId} />
          </TabsContent>

          <TabsContent value="config">
            <div className="space-y-6">
              <ChatToggleControl barId={barId} />
              <GeneralChatToggleControl barId={barId} />
              
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold mb-4 text-white">{t("admin.tableCustomization")}</h3>
                <p className="text-gray-300 mb-4">
                  {t("admin.tableCustomizationDescription")}
                </p>
                <Link href={`/admin/personalizacion-mesas?barId=${barId}`}>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => console.log("Navegando a personalización con barId:", barId)}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    {t("admin.customizeTables")}
                  </Button>
                </Link>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold mb-4 text-white">{t("admin.customizableButtons")}</h3>
                <p className="text-gray-300 mb-4">
                  {t("admin.customizableButtonsDescription")}
                </p>
                <ButtonConfigurationPanel barId={barId} />
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-orange-500" />
                  <h3 className="text-xl font-semibold text-white">{t("admin.businessHours")}</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  {t("admin.businessHoursDescription")}
                </p>
                {configLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-3 text-gray-300">{t("admin.loadingConfiguration")}</span>
                  </div>
                ) : (
                  <BusinessHoursConfig 
                    config={reservationConfig} 
                    onConfigChange={updateReservationConfig} 
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <RoleGate allowedRoles={["bar_admin"]} redirectTo="/admin/login">
      <AdminDashboard />
    </RoleGate>
  )
}
