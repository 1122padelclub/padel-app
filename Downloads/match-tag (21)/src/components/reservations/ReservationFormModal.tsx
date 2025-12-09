"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createReservationWithTableAssignment } from "@/lib/reservations"
import { CalendarIcon, Clock, Users, Phone, Mail, MessageSquare } from "lucide-react"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ReservationFormModalProps {
  barId: string
  onClose: () => void
  onSuccess: (reservationId: string) => void
}

export function ReservationFormModal({ barId, onClose, onSuccess }: ReservationFormModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [duration, setDuration] = useState<number>(120)
  const [partySize, setPartySize] = useState<number>(2)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const minDate = addDays(new Date(), 0) // Today
  const maxDate = addDays(new Date(), 30) // 30 days ahead

  // Generate time slots
  const timeSlots = []
  for (let hour = 12; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      timeSlots.push(time)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime || !customerName || !customerPhone) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Crear fecha y hora combinadas
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const startAt = new Date(selectedDate)
      startAt.setHours(hours, minutes, 0, 0)

      const result = await createReservationWithTableAssignment(barId, {
        startAt,
        durationMins: duration,
        partySize,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        notes: notes || undefined,
        source: "admin",
      })

      onSuccess(result.reservationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la reserva")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Nueva Reserva
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
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
              <Label>Hora *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duración</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1.5 horas</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="150">2.5 horas</SelectItem>
                  <SelectItem value="180">3 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <Label>Número de Personas *</Label>
            <Select value={partySize.toString()} onValueChange={(value) => setPartySize(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((size) => (
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
            <h3 className="text-lg font-semibold">Información del Cliente</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre completo"
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
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
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
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alergias, preferencias, celebraciones..."
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedDate || !selectedTime || !customerName || !customerPhone}
              className="flex-1"
            >
              {isSubmitting ? "Creando Reserva..." : "Crear Reserva"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
