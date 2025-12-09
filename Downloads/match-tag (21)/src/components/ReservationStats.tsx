"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, TrendingUp } from "lucide-react"
import { useReservations } from "@/src/hooks/useReservations"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { useT } from "@/src/hooks/useTranslation"

interface ReservationStatsProps {
  barId: string
}

export function ReservationStats({ barId }: ReservationStatsProps) {
  const { reservations, loading } = useReservations(barId)
  const t = useT()
  
  // Función para obtener el día de la semana traducido
  const getDayName = (dayDate: Date) => {
    const dayOfWeek = dayDate.getDay()
    const days = [
      t("admin.sunday"),    // 0 - Domingo
      t("admin.monday"),    // 1 - Lunes
      t("admin.tuesday"),   // 2 - Martes
      t("admin.wednesday"), // 3 - Miércoles
      t("admin.thursday"),  // 4 - Jueves
      t("admin.friday"),    // 5 - Viernes
      t("admin.saturday")   // 6 - Sábado
    ]
    return days[dayOfWeek]
  }
  const [stats, setStats] = useState({
    today: 0,
    tomorrow: 0,
    thisWeek: 0,
    total: 0,
    dailyBreakdown: [] as Array<{ date: string; count: number }>
  })

  useEffect(() => {
    if (!reservations || reservations.length === 0) {
      setStats({
        today: 0,
        tomorrow: 0,
        thisWeek: 0,
        total: 0,
        dailyBreakdown: []
      })
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Lunes
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }) // Domingo
    
    // Calcular estadísticas
    const todayReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate)
      return reservationDate.toDateString() === today.toDateString()
    }).length

    const tomorrowReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate)
      return reservationDate.toDateString() === tomorrow.toDateString()
    }).length

    const thisWeekReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate)
      return reservationDate >= weekStart && reservationDate <= weekEnd
    }).length

    // Desglose diario de la semana actual
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const dailyBreakdown = weekDays.map(day => {
      const dayReservations = reservations.filter(reservation => {
        const reservationDate = new Date(reservation.reservationDate)
        return reservationDate.toDateString() === day.toDateString()
      }).length

      return {
        date: format(day, 'yyyy-MM-dd'),
        count: dayReservations
      }
    })

    setStats({
      today: todayReservations,
      tomorrow: tomorrowReservations,
      thisWeek: thisWeekReservations,
      total: reservations.length,
      dailyBreakdown
    })
  }, [reservations])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t("admin.today")}</p>
                <p className="text-3xl font-bold">{stats.today}</p>
                <p className="text-blue-100 text-xs">{t("admin.reservationsPlural")}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{t("admin.tomorrow")}</p>
                <p className="text-3xl font-bold">{stats.tomorrow}</p>
                <p className="text-green-100 text-xs">{t("admin.reservationsPlural")}</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{t("admin.thisWeek")}</p>
                <p className="text-3xl font-bold">{stats.thisWeek}</p>
                <p className="text-purple-100 text-xs">{t("admin.reservationsPlural")}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">{t("admin.total")}</p>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-orange-100 text-xs">{t("admin.reservationsPlural")}</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose diario de la semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("admin.reservationsByDay")} - {t("admin.thisWeekLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {stats.dailyBreakdown.map((day, index) => {
              const dayDate = new Date(day.date)
              const isCurrentDay = isToday(dayDate)
              const isTomorrowDay = isTomorrow(dayDate)
              
              return (
                <div
                  key={day.date}
                  className={`p-3 rounded-lg text-center ${
                    isCurrentDay 
                      ? 'bg-blue-100 border-2 border-blue-500' 
                      : isTomorrowDay
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {getDayName(dayDate)}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {format(dayDate, 'dd/MM')}
                  </div>
                  <div className={`text-2xl font-bold ${
                    isCurrentDay 
                      ? 'text-blue-600' 
                      : isTomorrowDay
                      ? 'text-green-600'
                      : 'text-gray-700'
                  }`}>
                    {day.count}
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.count === 1 ? t("admin.reservation") : t("admin.reservationsPlural")}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

