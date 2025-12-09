"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Phone, Mail, MapPin, CheckCircle, X } from "lucide-react"
import { useReservationConfig } from "@/src/hooks/useReservationConfig"
import { useReservations } from "@/src/hooks/useReservations"
import { useAvailableTables } from "@/src/hooks/useAvailableTables"
import { useThemeConfig } from "@/src/hooks/useThemeConfig"
import { format, addDays, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import type { Reservation } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface ReservationPageClientProps {
  barId: string
}

export function ReservationPageClient({ barId }: ReservationPageClientProps) {
  const t = useT()
  const { themeConfig, isLoading: themeLoading } = useThemeConfig(barId)
  const { config, loading: configLoading, generateTimeSlots, isDateAvailable } = useReservationConfig(barId)
  const { createReservation } = useReservations(barId)
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    partySize: 1,
    specialRequests: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Fecha, 2: Hora, 3: Personas, 4: Datos, 5: Enviar
  const [showCustomPartySize, setShowCustomPartySize] = useState(false)
  const [customPartySize, setCustomPartySize] = useState("")

  const availableTimeSlots = generateTimeSlots(selectedDate)
  
  // Obtener mesas disponibles basadas en fecha y hora seleccionadas
  const durationMinutes = config?.reservationDurationMinutes || 120
  const { 
    availableTables, 
    loading: tablesLoading, 
    error: tablesError,
    totalTables,
    activeTables 
  } = useAvailableTables(barId, selectedDate, selectedTime, durationMinutes)

  // Debug logs para verificar las mesas
  console.log("🪑 Debug - Mesas disponibles:", {
    totalTables,
    activeTables,
    availableTables: availableTables.length,
    selectedDate: selectedDate?.toISOString(),
    selectedTime,
    durationMinutes,
    barId
  })

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime("")
    setCurrentStep(2) // Avanzar al paso de hora
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    setCurrentStep(3) // Avanzar al paso de personas
  }

  const handlePartySizeChange = (size: number) => {
    setFormData({ ...formData, partySize: size })
    setShowCustomPartySize(false)
    setCustomPartySize("")
    setCurrentStep(4) // Avanzar al paso de datos personales
  }

  const handleCustomPartySize = () => {
    const size = parseInt(customPartySize)
    if (size > 0 && size <= 50) { // Límite razonable
      setFormData({ ...formData, partySize: size })
      setShowCustomPartySize(false)
      setCustomPartySize("")
      setCurrentStep(4) // Avanzar al paso de datos personales
    }
  }

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTime || !config) return

    setIsSubmitting(true)
    try {
      const reservationData: any = {
        barId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone || "",
        customerEmail: formData.customerEmail || "",
        partySize: formData.partySize,
        reservationDate: selectedDate,
        reservationTime: selectedTime,
        status: 'pending',
        notes: formData.specialRequests || "",
        assignedTable: "pending"
      }

      await createReservation(reservationData)
      setSubmitted(true)
    } catch (error) {
      console.error("Error creando reserva:", error)
      alert("Error al crear la reserva. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return t("reservation.today")
    if (isTomorrow(date)) return t("reservation.tomorrow")
    return format(date, 'EEEE, dd MMMM', { locale: es })
  }

  if (themeLoading || configLoading || tablesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!config?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("reservation.reservationsNotAvailable")}</h2>
            <p className="text-muted-foreground">
              {t("reservation.reservationSystemNotActive")}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("reservation.reservationRequested")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("reservation.reservationSentAndWillBeConfirmed")}
            </p>
            <Button 
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  customerName: "",
                  customerPhone: "",
                  customerEmail: "",
                  partySize: 1,
                  specialRequests: ""
                })
                setSelectedDate(new Date())
                setSelectedTime("")
                setCurrentStep(1)
              }}
              className="w-full"
            >
              {t("reservation.makeAnotherReservation")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: (themeConfig?.assets as any)?.backgroundImageUrl
          ? `url(${(themeConfig.assets as any).backgroundImageUrl}) center/cover`
          : `linear-gradient(135deg, ${(themeConfig?.branding as any)?.primaryColor || '#0ea5e9'}, ${(themeConfig?.branding as any)?.secondaryColor || '#1f2937'})`,
        fontFamily: (themeConfig?.branding as any)?.fontFamily || "system-ui, sans-serif",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ color: (themeConfig?.branding as any)?.textColor || '#ffffff' }}
            >
              {(themeConfig?.branding as any)?.restaurantName || 'Reservas'}
            </h1>
            <p 
              className="text-lg opacity-90"
              style={{ color: (themeConfig?.branding as any)?.textColor || '#ffffff' }}
            >
              {(themeConfig?.branding as any)?.tagline || 'Reserva tu mesa'}
            </p>
          </div>

          {/* Formulario Paso a Paso */}
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-serif flex items-center justify-center gap-2 text-2xl">
                  <Calendar className="h-6 w-6" />
                  {t("reservation.newReservation")}
                </CardTitle>
                <div className="flex justify-center mt-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          step <= currentStep 
                            ? 'bg-blue-500 scale-110' 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Paso 1: Fecha */}
                  {currentStep === 1 && (
                    <div className="animate-fadeIn">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2">{t("reservation.whenDoYouWantToCome")}</h3>
                        <p className="text-muted-foreground">{t("reservation.selectReservationDate")}</p>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((days) => {
                          const date = addDays(new Date(), days)
                          const isAvailable = isDateAvailable(date)
                          const isSelected = selectedDate.toDateString() === date.toDateString()
                          
                          return (
                            <Button
                              key={days}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              disabled={!isAvailable}
                              onClick={() => handleDateChange(date)}
                              className={`h-16 flex flex-col items-center justify-center transition-all duration-300 ${
                                isSelected ? 'scale-105 shadow-lg' : 'hover:scale-105'
                              }`}
                            >
                              <div className="text-sm font-semibold">{format(date, 'dd')}</div>
                              <div className="text-xs opacity-70">{format(date, 'MMM')}</div>
                            </Button>
                          )
                        })}
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        {getDateLabel(selectedDate)}
                      </p>
                    </div>
                  )}

                  {/* Paso 2: Hora */}
                  {currentStep === 2 && (
                    <div className="animate-fadeIn">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2">{t("reservation.whatTime")}</h3>
                        <p className="text-muted-foreground">{t("reservation.chooseYourPreferredTime")}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => handleTimeChange(time)}
                            className={`h-12 transition-all duration-300 ${
                              selectedTime === time ? 'scale-105 shadow-lg' : 'hover:scale-105'
                            }`}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Paso 3: Número de Personas */}
                  {currentStep === 3 && (
                    <div className="animate-fadeIn">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2">{t("reservation.howManyPeople")}</h3>
                        <p className="text-muted-foreground">{t("reservation.selectNumberOfGuests")}</p>
                      </div>
                      
                      {!showCustomPartySize ? (
                        <>
                          <div className="grid grid-cols-4 gap-3 mb-4">
                            {Array.from({ length: Math.min(config?.maxPartySize || 8, 8) }, (_, i) => i + 1).map((size) => (
                              <Button
                                key={size}
                                type="button"
                                variant={formData.partySize === size ? "default" : "outline"}
                                onClick={() => handlePartySizeChange(size)}
                                className={`h-16 flex flex-col items-center justify-center transition-all duration-300 ${
                                  formData.partySize === size ? 'scale-105 shadow-lg' : 'hover:scale-105'
                                }`}
                              >
                                <Users className="h-5 w-5 mb-1" />
                                <span className="text-sm font-semibold">{size}</span>
                                <span className="text-xs opacity-70">
                                  {size === 1 ? t("reservation.person") : t("reservation.people")}
                                </span>
                              </Button>
                            ))}
                          </div>
                          <div className="text-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowCustomPartySize(true)}
                              className="px-6 py-2"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              {t("reservation.moreThan8People")}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center">
                            <h4 className="text-lg font-medium mb-2">{t("reservation.customNumber")}</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              {t("reservation.enterNumberOfPeople")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              value={customPartySize}
                              onChange={(e) => setCustomPartySize(e.target.value)}
                              placeholder="Ej: 12"
                              className="flex-1 text-center text-lg"
                            />
                            <Button
                              type="button"
                              onClick={handleCustomPartySize}
                              disabled={!customPartySize || parseInt(customPartySize) < 1 || parseInt(customPartySize) > 50}
                              className="px-6"
                            >
                              {t("reservation.accept")}
                            </Button>
                          </div>
                          <div className="text-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCustomPartySize(false)
                                setCustomPartySize("")
                              }}
                              className="px-4 py-2"
                            >
                              ← {t("reservation.backToOptions")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Paso 4: Datos Personales */}
                  {currentStep === 4 && (
                    <div className="animate-fadeIn">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2">{t("reservation.yourData")}</h3>
                        <p className="text-muted-foreground">{t("reservation.weNeedYourContactInfo")}</p>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="customerName">{t("reservation.fullName")} *</Label>
                            <Input
                              id="customerName"
                              value={formData.customerName}
                              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                              required
                              className="rounded-xl h-12"
                              placeholder={t("reservation.yourFullName")}
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerPhone">{t("reservation.phone")} *</Label>
                            <Input
                              id="customerPhone"
                              type="tel"
                              value={formData.customerPhone}
                              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                              required
                              className="rounded-xl h-12"
                              placeholder="+34 600 000 000"
                            />
                          </div>
                        </div>
                        <div>
                            <Label htmlFor="customerEmail">{t("reservation.email")} ({t("reservation.optional")})</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                            className="rounded-xl h-12"
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div>
                            <Label htmlFor="specialRequests">{t("reservation.specialRequests")} ({t("reservation.optional")})</Label>
                          <Textarea
                            id="specialRequests"
                            value={formData.specialRequests}
                            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                            placeholder={t("reservation.allergiesCelebrationsEtc")}
                            className="rounded-xl"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paso 5: Resumen y Envío */}
                  {currentStep === 5 && (
                    <div className="animate-fadeIn">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2">{t("reservation.reservationSummary")}</h3>
                        <p className="text-muted-foreground">{t("reservation.reviewDetailsBeforeSending")}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{t("reservation.date")}:</span>
                            <span className="text-gray-900">{getDateLabel(selectedDate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{t("reservation.time")}:</span>
                            <span className="text-gray-900">{selectedTime}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{t("reservation.people")}:</span>
                            <span className="text-gray-900">{formData.partySize} {formData.partySize === 1 ? t("reservation.person") : t("reservation.people")}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{t("reservation.name")}:</span>
                            <span className="text-gray-900">{formData.customerName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{t("reservation.phone")}:</span>
                            <span className="text-gray-900">{formData.customerPhone}</span>
                          </div>
                          {formData.customerEmail && (
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">{t("reservation.email")}:</span>
                              <span className="text-gray-900">{formData.customerEmail}</span>
                            </div>
                          )}
                        </div>
                        {formData.specialRequests && (
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-gray-700">{t("reservation.specialRequests")}:</span>
                              <span className="text-right text-sm text-gray-900 max-w-xs">{formData.specialRequests}</span>
                            </div>
                          </div>
                        )}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-medium text-blue-900">{t("reservation.reservationStatus")}</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              {t("reservation.requestWillBeReviewed")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones de Navegación */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="px-6 flex items-center gap-2"
                      >
                        ← {t("reservation.previous")}
                      </Button>
                    )}
                    
                    {currentStep < 5 ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        disabled={
                          (currentStep === 1 && !selectedDate) ||
                          (currentStep === 2 && !selectedTime) ||
                          (currentStep === 3 && !formData.partySize) ||
                          (currentStep === 4 && (!formData.customerName || !formData.customerPhone))
                        }
                        className="px-6 ml-auto flex items-center gap-2"
                      >
                        {t("reservation.next")} →
                      </Button>
                    ) : (
                      <div className="flex gap-3 ml-auto">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevStep}
                          className="px-6"
                        >
                          ← {t("reservation.edit")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? t("reservation.sending") : t("reservation.requestReservation")}
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
