"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Users, MapPin, Phone, Mail } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useReservations } from "@/src/hooks/useReservations"
import { useTableAvailability } from "@/src/hooks/useTableAvailability"

export const dynamic = "force-dynamic"

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [guestCount, setGuestCount] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [barId, setBarId] = useState<string>("")

  // Obtener barId de la URL o usar uno por defecto
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlBarId = urlParams.get("barId")
    setBarId(urlBarId || "default-bar")
  }, [])

  const { createReservation, isLoading } = useReservations(barId)

  // Generar horarios disponibles
  const timeSlots = [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
  ]

  const handleReservation = async () => {
    if (!selectedDate || !selectedTime || !guestCount || !customerName || !customerPhone) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      await createReservation({
        date: selectedDate,
        time: selectedTime,
        guestCount: Number.parseInt(guestCount),
        tableId: "pending", // Se asignará mesa desde el admin
        customerName,
        customerPhone,
        customerEmail,
        status: "pending", // Cambiar a pending para que requiera confirmación
      })

      // Resetear formulario
      setSelectedDate(undefined)
      setSelectedTime("")
      setGuestCount("")
      setCustomerName("")
      setCustomerPhone("")
      setCustomerEmail("")

      alert("¡Solicitud de reserva enviada! Te contactaremos pronto para confirmar la disponibilidad.")
    } catch (error) {
      console.error("Error al crear reserva:", error)
      alert("Error al procesar la solicitud. Inténtalo de nuevo.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-serif text-foreground mb-2">Reserva tu Mesa</h1>
            <p className="text-muted-foreground text-lg">Disfruta de una experiencia gastronómica única</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario de Reserva */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-foreground">Detalles de la Reserva</CardTitle>
              <CardDescription className="text-muted-foreground">
                Completa la información para confirmar tu reserva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-foreground font-medium">
                  Fecha *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-input border-border",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <Label htmlFor="time" className="text-foreground font-medium">
                  Hora *
                </Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
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

              {/* Número de personas */}
              <div className="space-y-2">
                <Label htmlFor="guests" className="text-foreground font-medium">
                  Número de personas *
                </Label>
                <Select value={guestCount} onValueChange={setGuestCount}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="¿Cuántas personas?" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {count} {count === 1 ? "persona" : "personas"}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {/* Información del cliente */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground">Información de contacto</h3>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Nombre completo *
                  </Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    Teléfono *
                  </Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <Button
                onClick={handleReservation}
                disabled={
                  isLoading ||
                  !selectedDate ||
                  !selectedTime ||
                  !guestCount ||
                  !customerName ||
                  !customerPhone
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              >
                {isLoading ? "Enviando..." : "Solicitar Reserva"}
              </Button>
            </CardContent>
          </Card>

          {/* Información del restaurante */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-foreground">Información del Restaurante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Dirección</p>
                    <p className="text-muted-foreground">
                      Calle Principal 123
                      <br />
                      28001 Madrid, España
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Teléfono</p>
                    <p className="text-muted-foreground">+34 91 123 45 67</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-muted-foreground">reservas@restaurante.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Horarios</p>
                    <p className="text-muted-foreground">
                      Lunes a Domingo
                      <br />
                      12:00 - 15:00 | 19:00 - 23:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent text-accent-foreground">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Proceso de Reservas</h3>
                <ul className="space-y-1 text-sm opacity-90">
                  <li>• Envía tu solicitud de reserva</li>
                  <li>• Te contactaremos para confirmar disponibilidad</li>
                  <li>• Asignaremos la mesa más adecuada para tu grupo</li>
                  <li>• Cancelaciones hasta 2 horas antes</li>
                  <li>• Grupos de +8 personas contactar directamente</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
