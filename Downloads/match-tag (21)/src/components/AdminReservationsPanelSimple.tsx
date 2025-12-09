"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Users, Phone, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useReservations } from "@/src/hooks/useReservations"
import { useReservationNotifications } from "@/src/hooks/useReservationNotifications"
import { useTables } from "@/src/hooks/useTables"
import { ReservationDurationConfig } from "./ReservationDurationConfig"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Reservation } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface AdminReservationsPanelProps {
  barId: string
}

export function AdminReservationsPanelSimple({ barId }: AdminReservationsPanelProps) {
  const t = useT()
  const { reservations, loading, error, updateReservation, deleteReservation, getReservationsByStatus } = useReservations(barId)
  const { sendNotification, isLoading: notificationLoading } = useReservationNotifications()
  const { tables, loading: tablesLoading } = useTables(barId)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [showPastReservations, setShowPastReservations] = useState(false)
  const [tableFilter, setTableFilter] = useState<string>("all")

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = 
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerPhone.includes(searchTerm) ||
      (reservation.customerEmail && reservation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      `mesa ${reservation.tableNumber}`.includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter

    // Filtro por fecha
    const reservationDate = new Date(reservation.reservationDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = reservationDate.toDateString() === today.toDateString()
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      matchesDate = reservationDate.toDateString() === tomorrow.toDateString()
    } else if (dateFilter === "thisWeek") {
      const weekFromNow = new Date(today)
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      matchesDate = reservationDate >= today && reservationDate <= weekFromNow
    } else if (dateFilter === "past") {
      matchesDate = reservationDate < today
    }

    // Filtro de reservas pasadas
    const isPastReservation = reservationDate < today
    const showPast = showPastReservations || !isPastReservation

    // Filtro por mesa
    let matchesTable = true
    if (tableFilter === "assigned") {
      matchesTable = reservation.tableNumber !== "Por asignar"
    } else if (tableFilter === "unassigned") {
      matchesTable = reservation.tableNumber === "Por asignar"
    }

    return matchesSearch && matchesStatus && matchesDate && showPast && matchesTable
  })

  const pendingReservations = getReservationsByStatus('pending')
  const confirmedReservations = getReservationsByStatus('confirmed')

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
        barName: "Nuestro Restaurante"
      })
      
      console.log("✅ Reserva confirmada y notificación enviada")
    } catch (error) {
      console.error("❌ Error confirmando reserva:", error)
    }
  }

  const handleRejectReservation = async (reservation: Reservation) => {
    if (confirm("¿Estás seguro de que quieres rechazar esta reserva?")) {
      try {
        await updateReservation(reservation.id, { status: 'cancelled' })
        
        // Enviar notificación de rechazo
        await sendNotification({
          customerName: reservation.customerName,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone,
          reservationDate: reservation.reservationDate,
          reservationTime: reservation.reservationTime,
          tableNumber: reservation.tableNumber,
          partySize: reservation.partySize,
          barName: "Nuestro Restaurante",
          type: "rejection"
        })
        
        console.log("✅ Reserva rechazada y notificación enviada")
      } catch (error) {
        console.error("❌ Error rechazando reserva:", error)
      }
    }
  }

  const handleUpdateStatus = async (reservation: Reservation, newStatus: Reservation['status']) => {
    try {
      await updateReservation(reservation.id, { status: newStatus })
      
      // Enviar notificación según el estado
      if (newStatus === 'confirmed' || newStatus === 'cancelled' || newStatus === 'completed' || newStatus === 'no_show') {
        await sendNotification({
          customerName: reservation.customerName,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone,
          reservationDate: reservation.reservationDate,
          reservationTime: reservation.reservationTime,
          tableNumber: reservation.tableNumber,
          partySize: reservation.partySize,
          barName: "Nuestro Restaurante",
          type: newStatus
        })
      }
      
      console.log(`✅ Reserva actualizada a ${newStatus} y notificación enviada`)
    } catch (error) {
      console.error(`❌ Error actualizando reserva a ${newStatus}:`, error)
    }
  }

  const handleAssignTable = async (reservation: Reservation, tableId: string) => {
    try {
      if (tableId === "unassigned") {
        // Quitar asignación de mesa
        await updateReservation(reservation.id, { 
          tableId: null,
          tableNumber: "Por asignar"
        })
        console.log("✅ Asignación de mesa removida")
        return
      }

      const selectedTable = tables.find(table => table.id === tableId)
      if (!selectedTable) {
        console.error("❌ Mesa no encontrada")
        return
      }

      await updateReservation(reservation.id, { 
        tableId: tableId,
        tableNumber: selectedTable.number
      })
      
      // Enviar notificación de asignación de mesa
      await sendNotification({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        tableNumber: selectedTable.number,
        partySize: reservation.partySize,
        barName: "Nuestro Restaurante",
        type: 'confirmation'
      })
      
      console.log(`✅ Mesa ${selectedTable.number} asignada a la reserva`)
    } catch (error) {
      console.error(`❌ Error asignando mesa:`, error)
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

  const handleCleanPastReservations = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar todas las reservas pasadas? Esta acción no se puede deshacer.")) {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const pastReservations = reservations.filter(reservation => {
          const reservationDate = new Date(reservation.reservationDate)
          return reservationDate < today
        })

        for (const reservation of pastReservations) {
          await deleteReservation(reservation.id)
        }
        
        console.log(`✅ Se eliminaron ${pastReservations.length} reservas pasadas`)
        alert(`Se eliminaron ${pastReservations.length} reservas pasadas`)
      } catch (error) {
        console.error("Error eliminando reservas pasadas:", error)
        alert("Error al eliminar las reservas pasadas")
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
      default: return t("admin.unknown")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
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

      {/* Estadísticas - Más prominentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="rounded-xl border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("admin.pending")}</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingReservations.length}</p>
                <p className="text-xs text-gray-500 mt-1">{t("admin.requireConfirmation")}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("admin.confirmed")}</p>
                <p className="text-3xl font-bold text-green-600">{confirmedReservations.length}</p>
                <p className="text-xs text-gray-500 mt-1">{t("admin.readyForService")}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("admin.totalReservations")}</p>
                <p className="text-3xl font-bold text-blue-600">{reservations.length}</p>
                <p className="text-xs text-gray-500 mt-1">{t("admin.allReservations")}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros - Más compactos */}
      <Card className="rounded-xl mb-6">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder={t("admin.searchByNamePhoneEmailOrTable")}
                  className="rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
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
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                  <SelectValue placeholder={t("admin.filterByDate")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.allDates")}</SelectItem>
                  <SelectItem value="today">{t("admin.today")}</SelectItem>
                  <SelectItem value="tomorrow">{t("admin.tomorrow")}</SelectItem>
                  <SelectItem value="thisWeek">{t("admin.thisWeek")}</SelectItem>
                  <SelectItem value="past">{t("admin.pastReservations")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                  <SelectValue placeholder={t("admin.filterByTable")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.allTables")}</SelectItem>
                  <SelectItem value="assigned">{t("admin.withTableAssigned")}</SelectItem>
                  <SelectItem value="unassigned">{t("admin.withoutTableAssigned")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Controles adicionales */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPastReservations}
                    onChange={(e) => setShowPastReservations(e.target.checked)}
                    className="rounded"
                  />
{t("admin.showPastReservations")}
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTableFilter(tableFilter === "unassigned" ? "all" : "unassigned")}
                  className={tableFilter === "unassigned" ? "bg-orange-100 text-orange-700 border-orange-300" : "text-orange-600 border-orange-300 hover:bg-orange-50"}
                >
{tableFilter === "unassigned" ? `✓ ${t("admin.withoutTableAssigned")}` : `🔍 ${t("admin.viewWithoutTable")}`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCleanPastReservations}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
{t("admin.cleanPastReservations")}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reservas */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>{t("admin.reservations")}</CardTitle>
          <CardDescription>
            {filteredReservations.length} {filteredReservations.length === 1 ? t("admin.reservationsFound") : t("admin.reservationsFoundPlural")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("admin.noReservationsMatchFilters")}</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <Card key={reservation.id} className="rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold text-lg">{reservation.customerName}</h3>
                            <Badge className={`${getStatusColor(reservation.status)} rounded-full`}>
                              {getStatusText(reservation.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(reservation.reservationDate, 'PPP', { locale: es })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{reservation.reservationTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{reservation.partySize} {reservation.partySize === 1 ? t("admin.person") : t("admin.people")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {reservation.tableNumber === "Por asignar" ? (
                                    <span className="text-orange-600">{t("admin.tableToAssign")}</span>
                                  ) : (
                                    <span className="text-green-600">{t("admin.table")} {reservation.tableNumber}</span>
                                  )}
                                </span>
                                {reservation.tableNumber !== "Por asignar" && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
✓ {t("admin.tableAssigned")}
                                  </span>
                                )}
                              </div>
                              {reservation.status === 'confirmed' && (
                                <Select 
                                  value={reservation.tableId || "unassigned"} 
                                  onValueChange={(value) => handleAssignTable(reservation, value)}
                                >
                                  <SelectTrigger className="w-36 h-8 text-xs">
                                    <SelectValue placeholder={t("admin.changeTable")} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">{t("admin.withoutAssign")}</SelectItem>
                                    {tables.map((table) => (
                                      <SelectItem key={table.id} value={table.id}>
                                        {t("admin.table")} {table.number}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
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
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <strong>{t("admin.specialRequests")}:</strong> {reservation.specialRequests}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4 flex-wrap">
                          {/* Botones según el estado actual */}
                          {reservation.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleConfirmReservation(reservation)}
                                disabled={notificationLoading}
                                className="bg-green-600 hover:bg-green-700"
                              >
{notificationLoading ? t("admin.sending") : t("admin.confirm")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectReservation(reservation)}
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
{t("admin.reject")}
                              </Button>
                            </>
                          )}
                          
                          {reservation.status === 'confirmed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(reservation, 'completed')}
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
{t("admin.complete")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(reservation, 'no_show')}
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              >
{t("admin.noShow")}
                              </Button>
                            </>
                          )}
                          
                          {reservation.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(reservation, 'confirmed')}
                              className="border-green-500 text-green-600 hover:bg-green-50"
                            >
{t("admin.reopen")}
                            </Button>
                          )}
                          
                          {reservation.status === 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(reservation, 'confirmed')}
                              className="border-green-500 text-green-600 hover:bg-green-50"
                            >
{t("admin.reactivate")}
                            </Button>
                          )}
                          
                          {reservation.status === 'no_show' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(reservation, 'confirmed')}
                              className="border-green-500 text-green-600 hover:bg-green-50"
                            >
{t("admin.reopen")}
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

      {/* Configuración de Duración - Movida al final */}
      <ReservationDurationConfig barId={barId} />
    </div>
  )
}
