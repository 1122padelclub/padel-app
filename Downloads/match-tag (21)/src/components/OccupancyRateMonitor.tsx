"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOccupancyData } from "@/src/hooks/useOccupancyData"
import { BarChart3, Users, Clock, AlertTriangle, CheckCircle, XCircle, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useT } from "@/src/hooks/useTranslation"

interface OccupancyRateMonitorProps {
  barId: string
}

interface HourlyOccupancy {
  time: string
  totalTables: number
  occupiedTables: number
  availableTables: number
  totalCapacity: number
  occupiedCapacity: number
  availableCapacity: number
  occupancyRate: number
  reservations: any[]
}

export function OccupancyRateMonitor({ barId }: OccupancyRateMonitorProps) {
  const { tables, reservations, loading, error, calculateHourlyOccupancy } = useOccupancyData(barId)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const t = useT()

  // Horarios de operación del restaurante
  const timeSlots = [
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"
  ]


  // Calcular ocupación para todas las horas
  const hourlyOccupancyData = useMemo(() => {
    return timeSlots.map(time => calculateHourlyOccupancy(selectedDate, time))
  }, [selectedDate, calculateHourlyOccupancy, timeSlots])

  // Calcular estadísticas del día
  const dailyStats = useMemo(() => {
    const dateObj = new Date(selectedDate)
    const dayReservations = reservations.filter(res => {
      if (!res?.reservationDate) return false
      try {
        const resDate = new Date(res.reservationDate)
        return resDate.toDateString() === dateObj.toDateString()
      } catch {
        return false
      }
    })

    const totalTables = tables.length
    const totalCapacity = tables.reduce((sum, table) => sum + (table?.capacity || 4), 0)

    // Calcular pico de ocupación
    const maxOccupancy = hourlyOccupancyData.reduce((max, hour) => 
      Math.max(max, hour.occupancyRate), 0
    )

    const peakHour = hourlyOccupancyData.find(hour => hour.occupancyRate === maxOccupancy)

    console.log("Daily stats calculated:", {
      totalTables,
      totalCapacity,
      tablesList: tables.map(t => ({ id: t.id, number: t.number, capacity: t.capacity }))
    })

    return {
      totalTables,
      totalCapacity,
      totalReservations: dayReservations.length,
      totalGuests: dayReservations.reduce((sum, res) => sum + (res?.partySize || 0), 0),
      maxOccupancy: maxOccupancy.toFixed(1),
      peakHour: peakHour?.time || 'N/A'
    }
  }, [selectedDate, reservations, tables, hourlyOccupancyData])

  // Función para obtener color según ocupación
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return "bg-red-500"
    if (rate >= 70) return "bg-orange-500"
    if (rate >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Función para obtener estado de disponibilidad
  const getAvailabilityStatus = (rate: number) => {
    if (rate >= 90) return { text: t("admin.full"), color: "text-red-600", icon: <XCircle className="h-4 w-4" /> }
    if (rate >= 70) return { text: t("admin.almostFull"), color: "text-orange-600", icon: <AlertTriangle className="h-4 w-4" /> }
    if (rate >= 50) return { text: t("admin.moderate"), color: "text-yellow-600", icon: <Clock className="h-4 w-4" /> }
    return { text: t("admin.available"), color: "text-green-600", icon: <CheckCircle className="h-4 w-4" /> }
  }

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">{t("admin.loadingOccupancyData")}</span>
        </CardContent>
      </Card>
    )
  }


  if (error) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-600 font-medium">{t("admin.errorLoadingData")}</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con información del restaurante */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                {t("admin.occupancyControl")}
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                {t("admin.realTimeMonitoring")}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">{t("admin.totalTables")}</div>
              <div className="text-4xl font-bold">{dailyStats.totalTables}</div>
              <div className="text-sm text-blue-100">{t("admin.capacity")}: {dailyStats.totalCapacity} {t("admin.people")}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Selector de Fecha */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                {t("admin.selectDate")}
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
            >
              {t("admin.today")}
            </Button>
            <div className="text-right">
              <div className="text-sm text-gray-600">{t("admin.selectedDate")}</div>
              <div className="text-lg font-semibold text-gray-900">
                {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del Día */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{t("admin.reservationsToday")}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{dailyStats.totalReservations}</p>
                <p className="text-xs text-gray-500 mt-1">{dailyStats.totalGuests} {t("admin.diners")}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{t("admin.totalTables")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dailyStats.totalTables}</p>
                <p className="text-xs text-gray-500 mt-1">{t("admin.capacity")}: {dailyStats.totalCapacity}</p>
              </div>
              <Users className="h-10 w-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{t("admin.peakOccupancy")}</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{dailyStats.maxOccupancy}%</p>
                <p className="text-xs text-gray-500 mt-1">{t("admin.atTime")} {dailyStats.peakHour}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{t("admin.currentStatus")}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {dailyStats.totalReservations > 0 ? t("admin.active") : t("admin.noReservations")}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t("admin.liveMonitoring")}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Ocupación por Horas */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Clock className="h-5 w-5" />
            {t("admin.hourlyOccupancy")}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {t("admin.detailedOccupancyVisualization")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hourlyOccupancyData.map((data) => {
              const status = getAvailabilityStatus(data.occupancyRate)
              
              return (
                <div 
                  key={data.time}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    {/* Hora */}
                    <div className="flex items-center gap-3 min-w-[100px]">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="text-lg font-bold text-gray-900">{data.time}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {status.icon}
                          <span className={`text-xs font-semibold ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Ocupación */}
                    <div className="flex-1 mx-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">{t("admin.occupancy")}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {data.occupancyRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all ${getOccupancyColor(data.occupancyRate)}`}
                          style={{ width: `${Math.min(data.occupancyRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Estadísticas de Mesas */}
                    <div className="grid grid-cols-3 gap-6 text-center min-w-[400px]">
                      <div>
                        <div className="text-xs text-gray-600 font-medium">{t("admin.occupiedTables")}</div>
                        <div className="text-2xl font-bold text-red-600">{data.occupiedTables}</div>
                        <div className="text-xs text-gray-500">{data.occupiedCapacity} {t("admin.people")}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">{t("admin.availableTables")}</div>
                        <div className="text-2xl font-bold text-green-600">{data.availableTables}</div>
                        <div className="text-xs text-gray-500">{data.availableCapacity} {t("admin.spaces")}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">{t("admin.totalTables")}</div>
                        <div className="text-2xl font-bold text-gray-900">{data.totalTables}</div>
                        <div className="text-xs text-gray-500">{data.totalCapacity} {t("admin.capacity")}</div>
                      </div>
                    </div>

                    {/* Badge de reservas */}
                    <div className="ml-4">
                      <Badge 
                        variant={data.reservations.length > 0 ? "default" : "outline"}
                        className={`text-sm ${
                          data.reservations.length > 0 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {data.reservations.length} {data.reservations.length === 1 ? t("admin.reservation") : t("admin.reservations")}
                      </Badge>
                    </div>
                  </div>

                  {/* Mostrar detalles de reservas si las hay */}
                  {data.reservations.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-600 font-medium mb-2">{t("admin.activeReservations")}:</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {data.reservations.map((res, idx) => (
                          <div key={idx} className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded border border-blue-200">
                            <span className="font-medium">{res.customerName}</span> - {t("admin.table")} {res.tableNumber} ({res.partySize} {t("admin.people")})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {hourlyOccupancyData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("admin.noOccupancyDataAvailable")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas y Recomendaciones */}
      {parseFloat(dailyStats.maxOccupancy) >= 80 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900">⚠️ {t("admin.highOccupancyAlert")}</h3>
                <p className="text-sm text-orange-800 mt-1">
                  {t("admin.expectedOccupancy")} {dailyStats.maxOccupancy}% {t("admin.atTime")} {dailyStats.peakHour}. 
                  {t("admin.considerNotAcceptingMoreReservations")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
