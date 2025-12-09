"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { BarChart3, Download, TrendingUp, DollarSign, Star, Users, Calendar } from "lucide-react"
import { exportConsolidatedDashboard } from "@/src/utils/crmExports"
import type { Review, Order, Reservation } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface ConsolidatedCRMDashboardProps {
  reviews: Review[]
  orders: Order[]
  reservations: Reservation[]
  loading: boolean
}

export function ConsolidatedCRMDashboard({ reviews, orders, reservations, loading }: ConsolidatedCRMDashboardProps) {
  const t = useT()
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all")

  const filteredData = useMemo(() => {
    let filteredReviews = reviews
    let filteredOrders = orders
    let filteredReservations = reservations

    if (timeFilter !== "all") {
      const now = new Date()
      const cutoff = new Date()
      
      if (timeFilter === "week") {
        cutoff.setDate(now.getDate() - 7)
      } else if (timeFilter === "month") {
        cutoff.setMonth(now.getMonth() - 1)
      }

      filteredReviews = reviews.filter(review => new Date(review.createdAt) >= cutoff)
      filteredOrders = orders.filter(order => new Date(order.createdAt) >= cutoff)
      filteredReservations = reservations.filter(reservation => new Date(reservation.reservationDate) >= cutoff)
    }

    return { reviews: filteredReviews, orders: filteredOrders, reservations: filteredReservations }
  }, [reviews, orders, reservations, timeFilter])

  const consolidatedStats = useMemo(() => {
    const { reviews, orders, reservations } = filteredData

    // KPIs principales
    const totalReviews = reviews.length
    const totalOrders = orders.length
    const totalReservations = reservations.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Métricas de satisfacción
    const promoters = reviews.filter(r => r.rating >= 4).length
    const detractors = reviews.filter(r => r.rating <= 2).length
    const npsScore = totalReviews > 0 ? ((promoters - detractors) / totalReviews) * 100 : 0

    // Métricas de reservas
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length
    const confirmationRate = totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0

    // Métricas de pedidos
    const completedOrders = orders.filter(o => o.status === 'delivered').length
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

    return {
      totalReviews,
      totalOrders,
      totalReservations,
      totalRevenue,
      averageRating,
      averageOrderValue,
      npsScore,
      confirmationRate,
      completionRate,
      promoters,
      detractors
    }
  }, [filteredData])

  const trendData = useMemo(() => {
    const { reviews, orders, reservations } = filteredData
    
    // Agrupar por día
    const dailyMap = new Map<string, { reviews: number; orders: number; reservations: number; revenue: number }>()
    
    const allDates = new Set([
      ...reviews.map(r => new Date(r.createdAt).toISOString().split('T')[0]),
      ...orders.map(o => new Date(o.createdAt).toISOString().split('T')[0]),
      ...reservations.map(r => new Date(r.reservationDate).toISOString().split('T')[0])
    ])

    allDates.forEach(date => {
      dailyMap.set(date, { reviews: 0, orders: 0, reservations: 0, revenue: 0 })
    })

    reviews.forEach(review => {
      const date = new Date(review.createdAt).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { reviews: 0, orders: 0, reservations: 0, revenue: 0 }
      dailyMap.set(date, { ...existing, reviews: existing.reviews + 1 })
    })

    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { reviews: 0, orders: 0, reservations: 0, revenue: 0 }
      dailyMap.set(date, { 
        ...existing, 
        orders: existing.orders + 1, 
        revenue: existing.revenue + order.total 
      })
    })

    reservations.forEach(reservation => {
      const date = new Date(reservation.reservationDate).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { reviews: 0, orders: 0, reservations: 0, revenue: 0 }
      dailyMap.set(date, { ...existing, reservations: existing.reservations + 1 })
    })

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Últimos 30 días
  }, [filteredData])

  const handleExport = () => {
    exportConsolidatedDashboard(filteredData.reviews, filteredData.orders, filteredData.reservations)
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
      {/* Header */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-serif flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("admin.consolidatedKPIDashboard")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("admin.overviewOfReviewsOrdersAndReservations")}
              </p>
            </div>
            <div className="flex gap-2">
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
              <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                {t("admin.exportAll")}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Star className="h-4 w-4" />
              {t("admin.satisfaction")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consolidatedStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {consolidatedStats.totalReviews} {t("admin.reviews")}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {t("admin.revenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${consolidatedStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {consolidatedStats.totalOrders} {t("admin.orders")}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {t("admin.reservations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consolidatedStats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              {consolidatedStats.confirmationRate.toFixed(1)}% {t("admin.confirmed")}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {t("admin.npsScore")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${consolidatedStats.npsScore >= 0 ? "text-green-600" : "text-red-600"}`}>
              {consolidatedStats.npsScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {consolidatedStats.promoters} {t("admin.promoters")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-xl">
          <TabsTrigger value="overview">{t("admin.summary")}</TabsTrigger>
          <TabsTrigger value="trends">{t("admin.trends")}</TabsTrigger>
          <TabsTrigger value="performance">{t("admin.performance")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.dailyActivity")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      value,
                      name === "reviews" ? t("admin.reviews") : 
                      name === "orders" ? t("admin.orders") : 
                      name === "reservations" ? t("admin.reservations") : t("admin.revenue")
                    ]} />
                    <Bar dataKey="reviews" fill="#8884d8" name="reviews" />
                    <Bar dataKey="orders" fill="#82ca9d" name="orders" />
                    <Bar dataKey="reservations" fill="#ffc658" name="reservations" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.dailyRevenue")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, t("admin.revenue")]} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.satisfactionTrends")}</CardTitle>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-green-600">{t("admin.promoters")}</h4>
                  <p className="text-2xl font-bold">{consolidatedStats.promoters}</p>
                  <p className="text-sm text-muted-foreground">
                    {consolidatedStats.totalReviews > 0 
                      ? ((consolidatedStats.promoters / consolidatedStats.totalReviews) * 100).toFixed(1) + '%'
                      : '0%'
                    } {t("admin.ofTotal")}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-red-600">{t("admin.detractors")}</h4>
                  <p className="text-2xl font-bold">{consolidatedStats.detractors}</p>
                  <p className="text-sm text-muted-foreground">
                    {consolidatedStats.totalReviews > 0 
                      ? ((consolidatedStats.detractors / consolidatedStats.totalReviews) * 100).toFixed(1) + '%'
                      : '0%'
                    } {t("admin.ofTotal")}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-600">{t("admin.npsScore")}</h4>
                  <p className="text-2xl font-bold">{consolidatedStats.npsScore.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">
                    {consolidatedStats.npsScore >= 50 ? t("admin.excellent") : 
                     consolidatedStats.npsScore >= 0 ? t("admin.good") : t("admin.needsImprovement")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.performanceMetrics")}</CardTitle>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">{t("admin.orders")}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t("admin.completionRate")}</span>
                      <span className="font-medium">{consolidatedStats.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t("admin.averageValue")}</span>
                      <span className="font-medium">${consolidatedStats.averageOrderValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">{t("admin.reservations")}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t("admin.confirmationRate")}</span>
                      <span className="font-medium">{consolidatedStats.confirmationRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t("admin.totalReservations")}</span>
                      <span className="font-medium">{consolidatedStats.totalReservations}</span>
                    </div>
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
