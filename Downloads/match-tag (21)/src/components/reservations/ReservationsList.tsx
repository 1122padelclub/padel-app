"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReservations } from "@/src/hooks/useReservations"
import type { Reservation, ReservationStatus } from "@/src/types/reservation"
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Check,
  X,
  MoreHorizontal,
  Filter,
  Search,
  Plus,
} from "lucide-react"
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns"
import { es } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ReservationFormModal } from "./ReservationFormModal"

interface ReservationsListProps {
  barId: string
}

export function ReservationsList({ barId }: ReservationsListProps) {
  const { reservations, updateReservationStatus, deleteReservation, isLoading } = useReservations(barId)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "upcoming">("all")
  const [showNewReservationModal, setShowNewReservationModal] = useState(false)

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerPhone?.includes(searchTerm) ||
      reservation.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer?.phone?.includes(searchTerm) ||
      reservation.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter

    // Manejar tanto el formato nuevo (startAt) como el legacy (date)
    let reservationDate: Date
    if (reservation.startAt) {
      reservationDate = reservation.startAt.toDate ? reservation.startAt.toDate() : new Date(reservation.startAt)
    } else if (reservation.date) {
      reservationDate = typeof reservation.date === "string" ? parseISO(reservation.date) : reservation.date
    } else {
      return false
    }

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && isToday(reservationDate)) ||
      (dateFilter === "tomorrow" && isTomorrow(reservationDate)) ||
      (dateFilter === "upcoming" && !isPast(reservationDate))

    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: ReservationStatus) => {
    const variants = {
      pending: "bg-warning/20 text-warning border-warning/30",
      confirmed: "bg-success/20 text-success border-success/30",
      cancelled: "bg-danger/20 text-danger border-danger/30",
      completed: "bg-primary/20 text-primary border-primary/30",
      "no-show": "bg-muted text-muted-foreground border-muted",
    }

    const labels = {
      pending: "Pendiente",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
      completed: "Completada",
      "no-show": "No se presentó",
    }

    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      await updateReservationStatus(reservationId, newStatus)
    } catch (error) {
      console.error("Error updating reservation status:", error)
    }
  }

  const handleDeleteReservation = async (reservationId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      try {
        await deleteReservation(reservationId)
      } catch (error) {
        console.error("Error deleting reservation:", error)
      }
    }
  }

  const getReservationsByStatus = () => {
    return {
      pending: reservations.filter((r) => r.status === "pending").length,
      confirmed: reservations.filter((r) => r.status === "confirmed").length,
      today: reservations.filter((r) => {
        let date: Date
        if (r.startAt) {
          date = r.startAt.toDate ? r.startAt.toDate() : new Date(r.startAt)
        } else if (r.date) {
          date = typeof r.date === "string" ? parseISO(r.date) : r.date
        } else {
          return false
        }
        return isToday(date)
      }).length,
    }
  }

  const stats = getReservationsByStatus()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando reservas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
              </div>
              <Check className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold text-primary">{stats.today}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Gestión de Reservas
            </CardTitle>
            <Button onClick={() => setShowNewReservationModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nueva Reserva
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: ReservationStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="no-show">No se presentó</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={dateFilter}
              onValueChange={(value: "all" | "today" | "tomorrow" | "upcoming") => setDateFilter(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="tomorrow">Mañana</SelectItem>
                <SelectItem value="upcoming">Próximas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reservations List */}
          <div className="space-y-4">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron reservas con los filtros aplicados
              </div>
            ) : (
              filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteReservation}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Reservation Modal */}
      {showNewReservationModal && (
        <ReservationFormModal
          barId={barId}
          onClose={() => setShowNewReservationModal(false)}
          onSuccess={() => {
            setShowNewReservationModal(false)
          }}
        />
      )}
    </div>
  )
}

function ReservationCard({
  reservation,
  onStatusChange,
  onDelete,
}: {
  reservation: Reservation
  onStatusChange: (id: string, status: ReservationStatus) => void
  onDelete: (id: string) => void
}) {
  // Manejar tanto formato nuevo como legacy
  let reservationDate: Date
  let reservationTime: string

  if (reservation.startAt) {
    const startDate = reservation.startAt.toDate ? reservation.startAt.toDate() : new Date(reservation.startAt)
    reservationDate = startDate
    reservationTime = format(startDate, "HH:mm")
  } else if (reservation.date && reservation.time) {
    reservationDate = typeof reservation.date === "string" ? parseISO(reservation.date) : reservation.date
    reservationTime = reservation.time
  } else {
    return null // No se puede mostrar sin fecha/hora
  }

  const isOverdue = isPast(reservationDate) && reservation.status === "pending"
  const customerName = reservation.customerName || reservation.customer?.name || "Sin nombre"
  const customerPhone = reservation.customerPhone || reservation.customer?.phone || ""
  const customerEmail = reservation.customerEmail || reservation.customer?.email || ""
  const partySize = reservation.partySize || reservation.guestCount || 0
  const notes = reservation.notes || reservation.customer?.notes || ""

  return (
    <Card className={`${isOverdue ? "border-danger/50 bg-danger/5" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header with date, time and status */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{format(reservationDate, "PPP", { locale: es })}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{reservationTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{partySize} personas</span>
              </div>

              {reservation.tableNumber && <Badge variant="outline">Mesa {reservation.tableNumber}</Badge>}

              {getStatusBadge(reservation.status)}
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{customerName}</span>
                </div>

                {customerPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{customerPhone}</span>
                  </div>
                )}

                {customerEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{customerEmail}</span>
                  </div>
                )}
              </div>

              {notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Notas:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{notes}</p>
                </div>
              )}
            </div>

            {/* Quick actions for pending reservations */}
            {reservation.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onStatusChange(reservation.id!, "confirmed")}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(reservation.id!, "cancelled")}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {/* More actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {reservation.status === "confirmed" && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(reservation.id!, "completed")}>
                    Marcar como completada
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(reservation.id!, "no-show")}>
                    Marcar como no se presentó
                  </DropdownMenuItem>
                </>
              )}
              {reservation.status !== "cancelled" && (
                <DropdownMenuItem onClick={() => onStatusChange(reservation.id!, "cancelled")}>
                  Cancelar reserva
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(reservation.id!)} className="text-danger focus:text-danger">
                Eliminar reserva
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusBadge(status: ReservationStatus) {
  const variants = {
    pending: "bg-warning/20 text-warning border-warning/30",
    confirmed: "bg-success/20 text-success border-success/30",
    cancelled: "bg-danger/20 text-danger border-danger/30",
    completed: "bg-primary/20 text-primary border-primary/30",
    "no-show": "bg-muted text-muted-foreground border-muted",
  }

  const labels = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
    "no-show": "No se presentó",
  }

  return <Badge className={variants[status]}>{labels[status]}</Badge>
}
