"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useReservations } from "@/src/hooks/useReservations"
import type { ReservationCustomer, TimeSlot, ReservationSettings } from "@/src/types/reservation"
import { CalendarIcon, Clock, Users, Phone, Mail, MessageSquare } from "lucide-react"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { useT } from "@/src/hooks/useTranslation"

interface ReservationFormProps {
  barId: string
  onSuccess?: (reservationId: string) => void
  onCancel?: () => void
}

export function ReservationForm({ barId, onSuccess, onCancel }: ReservationFormProps) {
  const t = useT()
  const { createReservation, loading } = useReservations(barId)
  
  // Configuración por defecto para reservaciones
  const settings: ReservationSettings = {
    barId,
    openingHours: {
      monday: { open: "12:00", close: "23:00" },
      tuesday: { open: "12:00", close: "23:00" },
      wednesday: { open: "12:00", close: "23:00" },
      thursday: { open: "12:00", close: "23:00" },
      friday: { open: "12:00", close: "24:00" },
      saturday: { open: "12:00", close: "24:00" },
      sunday: { open: "12:00", close: "23:00" },
    },
    slotDuration: 30,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 2,
    maxPartySize: 12,
    requireConfirmation: false,
    allowOnlineBooking: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // Función para generar horarios disponibles
  const getAvailableTimeSlots = (date: string, partySize: number): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const selectedDate = new Date(date)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = dayNames[selectedDate.getDay()] as keyof typeof settings.openingHours
    
    const dayHours = settings.openingHours[dayOfWeek]
    if (!dayHours) return slots
    
    const [openHour, openMinute] = dayHours.open.split(':').map(Number)
    const [closeHour, closeMinute] = dayHours.close.split(':').map(Number)
    
    const openTime = new Date(selectedDate)
    openTime.setHours(openHour, openMinute, 0, 0)
    
    const closeTime = new Date(selectedDate)
    closeTime.setHours(closeHour, closeMinute, 0, 0)
    
    const currentTime = new Date(openTime)
    while (currentTime < closeTime) {
      const timeString = format(currentTime, 'HH:mm')
      slots.push({
        time: timeString,
        datetime: new Date(currentTime),
        available: true,
        availableTablesCount: 5, // Valor por defecto
        suggestedTable: null
      })
      currentTime.setMinutes(currentTime.getMinutes() + settings.slotDuration)
    }
    
    return slots
  }

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [partySize, setPartySize] = useState<number>(2)
  const [customer, setCustomer] = useState<ReservationCustomer>({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const minDate = addDays(new Date(), 0) // Today
  const maxDate = addDays(new Date(), settings?.maxAdvanceBooking || 30)

  const availableSlots = selectedDate ? getAvailableTimeSlots(format(selectedDate, "yyyy-MM-dd"), partySize) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime || !customer.name || !customer.phone) {
      setError(t("errors.validationError"))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const reservationId = await createReservation({
        barId,
        tableId: null, // Se asignará automáticamente
        tableNumber: "Por asignar",
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        partySize,
        reservationDate: new Date(format(selectedDate, "yyyy-MM-dd")),
        reservationTime: selectedTime,
        status: settings?.requireConfirmation ? "pending" : "confirmed",
        notes: customer.notes,
        updatedAt: new Date()
      })

      onSuccess?.(reservationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.networkError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Hacer una Reserva
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : t("reservations.date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isBefore(date, startOfDay(minDate)) || isBefore(maxDate, date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Hora</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder={t("reservations.time")} />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot: TimeSlot) => (
                    <SelectItem key={slot.time} value={slot.time} disabled={!slot.available}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {slot.time}
                        {!slot.available && <span className="text-muted-foreground">(Ocupado)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <Label>Número de Personas</Label>
            <Select value={partySize.toString()} onValueChange={(value: string) => setPartySize(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: settings?.maxPartySize || 12 }, (_, i) => i + 1).map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {size} {size === 1 ? "persona" : "personas"}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Contacto</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder={t("reservations.customerName")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+34 600 000 000"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Especiales (opcional)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder={t("reservations.specialRequests")}
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || !selectedDate || !selectedTime} className="flex-1">
              {isSubmitting ? t("common.loading") : t("reservations.confirmReservation")}
            </Button>
          </div>

          {settings?.requireConfirmation && (
            <p className="text-sm text-muted-foreground text-center">
              Tu reserva estará pendiente de confirmación. Te contactaremos pronto.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
