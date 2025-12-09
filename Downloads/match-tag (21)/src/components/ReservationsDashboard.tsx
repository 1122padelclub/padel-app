"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, Download, Users, Clock, CheckCircle, XCircle } from "lucide-react"
import { exportReservationsToExcel } from "@/src/utils/crmExports"
import type { Reservation } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface ReservationsDashboardProps {
  reservations: Reservation[]
  loading: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function ReservationsDashboard({ reservations, loading }: ReservationsDashboardProps) {
  const t = useT()
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "cancelled" | "no_show">("all")

  const filteredReservations = useMemo(() => {
    let filtered = reservations

    // Filtrar por tiempo
    if (timeFilter !== "all") {
      const now = new Date()
      const cutoff = new Date()
      
      if (timeFilter === "week") {
        cutoff.setDate(now.getDate() - 7)
      } else if (timeFilter === "month") {
        cutoff.setMonth(now.getMonth() - 1)
      }
      
      filtered = filtered.filter(reservation => reservation.reservationDate && new Date(reservation.reservationDate) >= cutoff)
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(reservation => reservation.status === statusFilter)
    }

    return filtered
  }, [reservations, timeFilter, statusFilter])

  const stats = useMemo(() => {
    if (filteredReservations.length === 0) {
      return {
        totalReservations: 0,
        confirmedReservations: 0,
        cancelledReservations: 0,
        noShowReservations: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowRate: 0,
        averagePartySize: 0,
        statusBreakdown: [],
        hourlyDistribution: [],
        dailyDistribution: []
      }
    }

    const totalReservations = filteredReservations.length
    const confirmedReservations = filteredReservations.filter(r => r.status === 'confirmed').length
    const cancelledReservations = filteredReservations.filter(r => r.status === 'cancelled').length
    const noShowReservations = filteredReservations.filter(r => r.status === 'no_show').length

    const confirmationRate = (confirmedReservations / totalReservations) * 100
    const cancellationRate = (cancelledReservations / totalReservations) * 100
    const noShowRate = (noShowReservations / totalReservations) * 100

    const averagePartySize = filteredReservations.reduce((sum, r) => sum + r.partySize, 0) / totalReservations

    // Distribución por estado
    const statusMap = new Map<string, number>()
    filteredReservations.forEach(reservation => {
      statusMap.set(reservation.status, (statusMap.get(reservation.status) || 0) + 1)
    })

    const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : "Unknown",
      count,
      percentage: ((count / totalReservations) * 100).toFixed(1)
    }))

    // Distribución por hora
    const hourlyMap = new Map<string, number>()
    filteredReservations.forEach(reservation => {
      if (reservation.time) {
        const hour = reservation.time.split(':')[0] + ':00'
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      }
    })

    const hourlyDistribution = Array.from(hourlyMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour))

    // Distribución por día de la semana
    const dailyMap = new Map<string, number>()
    filteredReservations.forEach(reservation => {
      if (reservation.reservationDate) {
        const dayOfWeek = new Date(reservation.reservationDate).getDay()
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const dayName = dayNames[dayOfWeek]
        dailyMap.set(dayName, (dailyMap.get(dayName) || 0) + 1)
      }
    })

    const dayNamesEs = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    const dailyDistribution = Array.from(dailyMap.entries()).map(([day, count]) => ({
      day: dayNamesEs[dayNames.indexOf(day)] || day,
      count
    }))

    return {
      totalReservations,
      confirmedReservations,
      cancelledReservations,
      noShowReservations,
      confirmationRate,
      cancellationRate,
      noShowRate,
      averagePartySize,
      statusBreakdown,
      hourlyDistribution,
      dailyDistribution
    }
  }, [filteredReservations])

  const handleExport = () => {
    exportReservationsToExcel(filteredReservations, `reservations_${timeFilter}_${statusFilter}`)
  }

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros y exportación */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-serif flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("admin.reservationsDashboard")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("admin.reservationsOccupancyAndBookingPatternsAnalysis")}
              </p>
            </div>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
{t("admin.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin.period")}</label>
              <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.all")}</SelectItem>
                  <SelectItem value="week">{t("admin.lastWeek")}</SelectItem>
                  <SelectItem value="month">{t("admin.lastMonth")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin.status")}</label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.all")}</SelectItem>
                  <SelectItem value="confirmed">{t("admin.confirmed")}</SelectItem>
                  <SelectItem value="pending">{t("admin.pending")}</SelectItem>
                  <SelectItem value="cancelled">{t("admin.cancelled")}</SelectItem>
                  <SelectItem value="no_show">{t("admin.noShow")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.totalReservations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">{t("admin.inSelectedPeriod")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
{t("admin.confirmationRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.confirmedReservations} {t("admin.confirmed")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <XCircle className="h-4 w-4" />
{t("admin.cancellationRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancellationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.cancelledReservations} {t("admin.cancelled")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
{t("admin.averagePerTable")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePartySize.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{t("admin.peoplePerReservation")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 rounded-xl">
          <TabsTrigger value="overview">{t("admin.summary")}</TabsTrigger>
          <TabsTrigger value="timing">{t("admin.schedules")}</TabsTrigger>
          <TabsTrigger value="patterns">{t("admin.patterns")}</TabsTrigger>
          <TabsTrigger value="issues">{t("admin.issues")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.distributionByStatus")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.statusBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, percentage }) => `${status}: ${percentage}%`}
                    >
                      {stats.statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} ${t("admin.reservations")}`, t("admin.quantity")]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.reservationsByDayOfWeek")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.dailyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} ${t("admin.reservations")}`, t("admin.quantity")]} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">Distribución por Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} reservas`, "Cantidad"]} />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">Análisis de Patrones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Hora Pico</h4>
                    <p className="text-2xl font-bold">
                      {stats.hourlyDistribution.length > 0 
                        ? stats.hourlyDistribution.reduce((max, item) => 
                            item.count > max.count ? item : max
                          ).hour
                        : 'N/A'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">mayor número de reservas</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Día Más Popular</h4>
                    <p className="text-2xl font-bold">
                      {stats.dailyDistribution.length > 0 
                        ? stats.dailyDistribution.reduce((max, item) => 
                            item.count > max.count ? item : max
                          ).day
                        : 'N/A'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">mayor número de reservas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">Análisis de Problemas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 text-red-600">No Shows</h4>
                    <p className="text-2xl font-bold">{stats.noShowReservations}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.noShowRate.toFixed(1)}% del total
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 text-orange-600">Cancelaciones</h4>
                    <p className="text-2xl font-bold">{stats.cancelledReservations}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.cancellationRate.toFixed(1)}% del total
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 text-green-600">Confirmadas</h4>
                    <p className="text-2xl font-bold">{stats.confirmedReservations}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.confirmationRate.toFixed(1)}% del total
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
