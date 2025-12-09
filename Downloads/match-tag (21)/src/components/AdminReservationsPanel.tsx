"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Users, Phone, Mail, MapPin, Settings, Plus, Search, Filter, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useReservations } from "@/src/hooks/useReservations"
import { useReservationConfig } from "@/src/hooks/useReservationConfig"
import { useTables } from "@/src/hooks/useTables"
import { useReservationNotifications } from "@/src/hooks/useReservationNotifications"
import { BusinessHoursConfig } from "@/src/components/BusinessHoursConfig"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Reservation } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface AdminReservationsPanelProps {
  barId: string
}

export function AdminReservationsPanel({ barId }: AdminReservationsPanelProps) {
  const t = useT()
  const { reservations, loading, error, updateReservation, deleteReservation, getReservationsByStatus } = useReservations(barId)
  const { config, loading: configLoading, updateConfig } = useReservationConfig(barId)
  const { tables } = useTables(barId)
  const { sendNotification, isLoading: notificationLoading } = useReservationNotifications()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerPhone.includes(searchTerm) ||
      reservation.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `mesa ${reservation.tableNumber}`.includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const pendingReservations = getReservationsByStatus('pending')
  const confirmedReservations = getReservationsByStatus('confirmed')
  const todayReservations = reservations.filter(r => {
    const today = new Date()
    const reservationDate = new Date(r.reservationDate)
    return reservationDate.toDateString() === today.toDateString()
  })

  const handleStatusChange = async (reservationId: string, newStatus: Reservation['status']) => {
    try {
      await updateReservation(reservationId, { status: newStatus })
    } catch (error) {
      console.error("Error actualizando estado de reserva:", error)
    }
  }

  const handleConfirmReservation = async (reservation: Reservation) => {
    try {
      // Actualizar estado a confirmada
      await updateReservation(reservation.id, { status: 'confirmed' })
      
      // Enviar notificación
      await sendNotification({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        tableNumber: reservation.tableNumber,
        partySize: reservation.partySize,
        barName: "Nuestro Restaurante" // TODO: Obtener nombre real del bar
      })
      
      console.log("✅ Reserva confirmada y notificación enviada")
    } catch (error) {
      console.error("❌ Error confirmando reserva:", error)
    }
  }

  const handleDeleteReservation = async (reservationId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      try {
        await deleteReservation(reservationId)
      } catch (error) {
        console.error("Error eliminando reserva:", error)
      }
    }
  }

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return t("admin.pending")
      case 'confirmed': return t("admin.confirmed")
      case 'cancelled': return t("admin.cancelled")
      case 'completed': return t("admin.completed")
      case 'no_show': return t("admin.noShow")
      default: return status
    }
  }

  if (loading || configLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6 text-center text-red-500">
          Error cargando reservas: {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("admin.reservationManagement")}</h1>
          <p className="text-gray-600 mt-1">{t("admin.manageRestaurantReservations")}</p>
        </div>
        <Link 
          href={`/reservar/${barId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
{t("admin.viewReservationPage")}
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.totalReservations")}</p>
                <p className="text-2xl font-bold">{reservations.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.pending")}</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingReservations.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.confirmed")}</p>
                <p className="text-2xl font-bold text-green-600">{confirmedReservations.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.today")}</p>
                <p className="text-2xl font-bold text-blue-600">{todayReservations.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Botón de Configuración de Horarios */}
        <Card className="rounded-2xl border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">{t("admin.operatingHours")}</p>
                <p className="text-xs text-orange-600">{t("admin.setBarOperatingHours")}</p>
              </div>
              <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    {t("admin.configure")}
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración y Filtros */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif">{t("admin.reservationManagement")}</CardTitle>
              <CardDescription>{t("admin.manageReservationsAndSystemConfiguration")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/reservar/${barId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
{t("admin.viewPublicPage")}
              </Link>
              <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500">
                    <Settings className="h-4 w-4 mr-2" />
{t("admin.configureHours")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("admin.reservationConfiguration")}</DialogTitle>
                  </DialogHeader>
                  <ReservationConfigForm 
                    config={config} 
                    onSave={updateConfig} 
                    onClose={() => setShowConfigModal(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.searchByNamePhoneEmailOrTable")}
                className="pl-9 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("admin.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
                <SelectItem value="pending">{t("admin.pending")}</SelectItem>
                <SelectItem value="confirmed">{t("admin.confirmed")}</SelectItem>
                <SelectItem value="cancelled">{t("admin.cancelled")}</SelectItem>
                <SelectItem value="completed">{t("admin.completed")}</SelectItem>
                <SelectItem value="no_show">{t("admin.noShow")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Reservas */}
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>{t("admin.noReservationsMatchFilters")}</p>
              </div>
            ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <Card key={reservation.id} className="rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{reservation.customerName}</h3>
                            <Badge className={`rounded-full ${getStatusColor(reservation.status)}`}>
                              {getStatusText(reservation.status)}
                            </Badge>
              </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{t("admin.table")} {reservation.tableNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                <span>{reservation.partySize} {t("admin.people")}</span>
              </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(reservation.reservationDate), 'dd/MM/yyyy', { locale: es })}</span>
            </div>
                <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{reservation.reservationTime}</span>
                            </div>
                </div>

                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            {reservation.customerPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{reservation.customerPhone}</span>
                </div>
                            )}
                            {reservation.customerEmail && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{reservation.customerEmail}</span>
                  </div>
                )}
              </div>

                          {reservation.specialRequests && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                <strong>{t("admin.specialRequests")}:</strong> {reservation.specialRequests}
                  </p>
                </div>
              )}
            </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Select
                            value={reservation.status}
                            onValueChange={(value: Reservation['status']) => handleStatusChange(reservation.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t("admin.pending")}</SelectItem>
                              <SelectItem value="confirmed">{t("admin.confirmed")}</SelectItem>
                              <SelectItem value="cancelled">{t("admin.cancelled")}</SelectItem>
                              <SelectItem value="completed">{t("admin.completed")}</SelectItem>
                              <SelectItem value="no_show">{t("admin.noShow")}</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {reservation.status === 'pending' && (
                <Button
                              variant="default"
                  size="sm"
                              onClick={() => handleConfirmReservation(reservation)}
                              disabled={notificationLoading}
                              className="bg-green-600 hover:bg-green-700"
                >
{notificationLoading ? t("admin.sending") : t("admin.confirm")}
                </Button>
                          )}
                          
                <Button
                            variant="destructive"
                  size="sm"
                            onClick={() => handleDeleteReservation(reservation.id)}
                >
{t("admin.delete")}
                </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
      </CardContent>
    </Card>
    </div>
  )
}

// Componente para el formulario de configuración
function ReservationConfigForm({ 
  config, 
  onSave, 
  onClose 
}: { 
  config: any, 
  onSave: (updates: any) => void, 
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    openingTime: config?.openingTime || "09:00",
    closingTime: config?.closingTime || "23:00",
    slotDuration: config?.slotDuration || 30,
    maxPartySize: config?.maxPartySize || 8,
    minPartySize: config?.minPartySize || 1,
    advanceBookingDays: config?.advanceBookingDays || 30,
    advanceBookingHours: config?.advanceBookingHours || 2,
    isActive: config?.isActive ?? true,
    businessHours: config?.businessHours || {
      monday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
      tuesday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
      wednesday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
      thursday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
      friday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
      saturday: { isOpen: true, openingTime: "09:00", closingTime: "23:00" },
      sunday: { isOpen: false, openingTime: "09:00", closingTime: "23:00" }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleBusinessHoursChange = (updates: any) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        ...updates.businessHours
      }
    }))
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted rounded-lg">
          <TabsTrigger value="general" className="text-sm font-medium">{t("admin.generalConfiguration")}</TabsTrigger>
          <TabsTrigger value="hours" className="text-sm font-medium">{t("admin.operatingHours")}</TabsTrigger>
        </TabsList>
      
      <TabsContent value="general" className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="openingTime">{t("admin.openingTime")}</Label>
          <Input
            id="openingTime"
            type="time"
            value={formData.openingTime}
            onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="closingTime">{t("admin.closingTime")}</Label>
          <Input
            id="closingTime"
            type="time"
            value={formData.closingTime}
            onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="slotDuration">{t("admin.slotDuration")}</Label>
          <Input
            id="slotDuration"
            type="number"
            min="15"
            max="120"
            step="15"
            value={formData.slotDuration}
            onChange={(e) => setFormData({ ...formData, slotDuration: parseInt(e.target.value) })}
            className="rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="maxPartySize">{t("admin.maxPartySize")}</Label>
          <Input
            id="maxPartySize"
            type="number"
            min="1"
            max="20"
            value={formData.maxPartySize}
            onChange={(e) => setFormData({ ...formData, maxPartySize: parseInt(e.target.value) })}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="advanceBookingDays">{t("admin.advanceBookingDays")}</Label>
          <Input
            id="advanceBookingDays"
            type="number"
            min="1"
            max="365"
            value={formData.advanceBookingDays}
            onChange={(e) => setFormData({ ...formData, advanceBookingDays: parseInt(e.target.value) })}
            className="rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="advanceBookingHours">{t("admin.advanceBookingHours")}</Label>
          <Input
            id="advanceBookingHours"
            type="number"
            min="0"
            max="24"
            value={formData.advanceBookingHours}
            onChange={(e) => setFormData({ ...formData, advanceBookingHours: parseInt(e.target.value) })}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isActive">{t("admin.reservationSystemActive")}</Label>
      </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
{t("admin.cancel")}
            </Button>
            <Button type="submit" className="rounded-xl">
{t("admin.saveConfiguration")}
            </Button>
          </div>
        </form>
      </TabsContent>
      
      <TabsContent value="hours" className="space-y-6">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">{t("admin.operatingHoursConfiguration")}</h3>
          <p className="text-sm text-blue-700">
            {t("admin.configureOperatingHoursDescription")}
          </p>
        </div>
        
        <BusinessHoursConfig 
          config={{
            ...formData,
            barId: config?.barId || "",
            reservationDurationMinutes: config?.reservationDurationMinutes || 120,
            createdAt: config?.createdAt || new Date(),
            updatedAt: config?.updatedAt || new Date()
          }} 
          onConfigChange={handleBusinessHoursChange} 
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
{t("admin.cancel")}
          </Button>
          <Button onClick={handleSubmit} className="rounded-xl">
{t("admin.saveConfiguration")}
          </Button>
        </div>
      </TabsContent>
      </Tabs>
    </div>
  )
}