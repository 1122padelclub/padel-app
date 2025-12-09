"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAvailableTimeSlots, getDayOccupancyStats } from "@/lib/availability"
import type { TimeSlot } from "@/lib/availability"
import { CalendarIcon, Clock, Users, TrendingUp, AlertCircle } from "lucide-react"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"

interface AvailabilityCalendarProps {
  barId: string
  onTimeSlotSelect?: (date: Date, time: string) => void
}

export function AvailabilityCalendar({ barId, onTimeSlotSelect }: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [partySize, setPartySize] = useState<number>(2)
  const [duration, setDuration] = useState<number>(120)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [dayStats, setDayStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      loadAvailability()
    }
  }, [selectedDate, partySize, duration, barId])

  const loadAvailability = async () => {
    setIsLoading(true)
    try {
      const [slots, stats] = await Promise.all([
        getAvailableTimeSlots(barId, selectedDate, partySize, duration),
        getDayOccupancyStats(barId, selectedDate),
      ])

      setTimeSlots(slots)
      setDayStats(stats)
    } catch (error) {
      console.error("Error loading availability:", error)
      setTimeSlots([])
      setDayStats(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeSlotClick = (time: string) => {
    if (onTimeSlotSelect) {
      const [hours, minutes] = time.split(":").map(Number)
      const dateTime = new Date(selectedDate)
      dateTime.setHours(hours, minutes, 0, 0)
      onTimeSlotSelect(dateTime, time)
    }
  }

  const getAvailabilityColor = (slot: TimeSlot) => {
    if (!slot.available) return "bg-destructive/20 text-destructive border-destructive/30"
    if (slot.availableTables <= 2) return "bg-warning/20 text-warning border-warning/30"
    return "bg-success/20 text-success border-success/30"
  }

  const getAvailabilityText = (slot: TimeSlot) => {
    if (!slot.available) return "No disponible"
    if (slot.availableTables === 1) return "1 mesa"
    return `${slot.availableTables} mesas`
  }

  const minDate = new Date()
  const maxDate = addDays(new Date(), 30)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Consultar Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Número de Personas</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Duración</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Seleccionada</label>
              <div className="p-2 border rounded-lg bg-muted/50">{format(selectedDate, "PPP", { locale: es })}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < minDate || date > maxDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Day Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Estadísticas del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{dayStats.totalReservations}</div>
                    <div className="text-sm text-muted-foreground">Total Reservas</div>
                  </div>

                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-success">{dayStats.confirmedReservations}</div>
                    <div className="text-sm text-muted-foreground">Confirmadas</div>
                  </div>

                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-warning">{dayStats.pendingReservations}</div>
                    <div className="text-sm text-muted-foreground">Pendientes</div>
                  </div>

                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{dayStats.totalGuests}</div>
                    <div className="text-sm text-muted-foreground">Comensales</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ocupación de Mesas</span>
                    <span>{dayStats.occupancyRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(dayStats.occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilización de Capacidad</span>
                    <span>{dayStats.capacityUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(dayStats.capacityUtilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {isLoading ? "Cargando estadísticas..." : "No hay datos disponibles"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horarios Disponibles - {format(selectedDate, "PPP", { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando disponibilidad...</div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant="outline"
                  onClick={() => handleTimeSlotClick(slot.time)}
                  disabled={!slot.available}
                  className={`h-auto p-3 flex flex-col items-center gap-1 ${
                    slot.available ? "hover:bg-primary/10" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="font-medium">{slot.time}</div>
                  <Badge className={`text-xs ${getAvailabilityColor(slot)}`}>{getAvailabilityText(slot)}</Badge>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              No hay horarios disponibles para los criterios seleccionados
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-success/20 text-success border-success/30">Disponible</Badge>
              <span className="text-muted-foreground">3+ mesas libres</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-warning/20 text-warning border-warning/30">Limitado</Badge>
              <span className="text-muted-foreground">1-2 mesas libres</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-destructive/20 text-destructive border-destructive/30">Completo</Badge>
              <span className="text-muted-foreground">Sin mesas disponibles</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
