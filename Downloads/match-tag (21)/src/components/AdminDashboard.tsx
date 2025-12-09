"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useOrders } from "@/src/hooks/useOrders"
import { useCRM } from "@/src/hooks/useCRM"
import { RBACProvider } from "@/src/hooks/useRBAC"
import { Star } from "lucide-react"
import { AdminCRMPanelNew as AdminCRMPanel } from "./AdminCRMPanelNew"
import { AdminReviewsPanel } from "./AdminReviewsPanel"
import { OrderNotificationPanel } from "./OrderNotificationPanel"
import { ReservationStats } from "./ReservationStats"
import { useReviews } from "@/src/hooks/useReviews"
import Link from "next/link"
import { Calendar } from "lucide-react"
import { useT } from "@/src/hooks/useTranslation"
import { LanguageSelector } from "./LanguageSelector"

interface AdminDashboardProps {
  barId: string
}

type TimeFilter = "day" | "week" | "month"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function AdminDashboard({ barId }: AdminDashboardProps) {
  const tempUserId = "admin-user-temp"

  return (
    <RBACProvider userId={tempUserId} barId={barId}>
      <AdminDashboardContent barId={barId} />
    </RBACProvider>
  )
}

function AdminDashboardContent({ barId }: AdminDashboardProps) {
  const { orders, loading } = useOrders(barId)
  const { stats: crmStats } = useCRM(barId)
  const { reviews: allReviews, loading: reviewsLoading } = useReviews(barId)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("day")
  const [selectedProduct, setSelectedProduct] = useState<string>("all")
  const t = useT()

  console.log("[v0] AdminDashboard - Pedidos cargados:", orders.length)
  console.log("[v0] AdminDashboard - Datos de pedidos:", orders)
  console.log("[v0] AdminDashboard - Reseñas cargadas:", allReviews.length)

  // Calcular estadísticas de reseñas
  const reviewsStats = useMemo(() => {
    if (!allReviews.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [
          { rating: 5, count: 0, percentage: 0 },
          { rating: 4, count: 0, percentage: 0 },
          { rating: 3, count: 0, percentage: 0 },
          { rating: 2, count: 0, percentage: 0 },
          { rating: 1, count: 0, percentage: 0 },
        ]
      }
    }

    const totalReviews = allReviews.length
    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    
    // Calcular distribución de calificaciones
    const ratingCounts = [0, 0, 0, 0, 0] // [1-star, 2-star, 3-star, 4-star, 5-star]
    allReviews.forEach(review => {
      ratingCounts[review.rating - 1]++
    })

    const ratingDistribution = ratingCounts.map((count, index) => ({
      rating: index + 1,
      count,
      percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    })).reverse() // Mostrar de 5 estrellas a 1 estrella

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
      totalReviews,
      ratingDistribution
    }
  }, [allReviews])

  const filteredStats = useMemo(() => {
    if (!orders.length)
      return {
        totalOrders: 0,
        totalRevenue: 0,
        productStats: [],
        dailyStats: [],
        statusStats: [],
      }

    const now = new Date()
    let startDate: Date

    switch (timeFilter) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      const isInTimeRange = orderDate >= startDate
      const isProductMatch =
        selectedProduct === "all" ||
        order.items.some((item) => item.name.toLowerCase().includes(selectedProduct.toLowerCase()))

      return isInTimeRange && isProductMatch && order.status !== "cancelled"
    })

    const productMap = new Map<
      string,
      {
        count: number
        revenue: number
        originalRevenue: number
        discountedSales: number
        totalSavings: number
      }
    >()

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = productMap.get(item.name) || {
          count: 0,
          revenue: 0,
          originalRevenue: 0,
          discountedSales: 0,
          totalSavings: 0,
        }

        const hasPromotion = item.promotionPrice && item.promotionPrice < item.price
        const salePrice = hasPromotion ? (item.promotionPrice || item.price) : item.price
        const originalPrice = item.price

        productMap.set(item.name, {
          count: current.count + item.quantity,
          revenue: current.revenue + (salePrice || 0) * item.quantity,
          originalRevenue: current.originalRevenue + originalPrice * item.quantity,
          discountedSales: current.discountedSales + (hasPromotion ? item.quantity : 0),
          totalSavings: current.totalSavings + (hasPromotion ? (originalPrice - (salePrice || 0)) * item.quantity : 0),
        })
      })
    })

    const productStats = Array.from(productMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        revenue: stats.revenue,
        originalRevenue: stats.originalRevenue,
        discountedSales: stats.discountedSales,
        totalSavings: stats.totalSavings,
        hasDiscounts: stats.discountedSales > 0,
        discountPercentage: stats.discountedSales > 0 ? Math.round((stats.discountedSales / stats.count) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const statusMap = new Map<string, number>()
    filteredOrders.forEach((order) => {
      const current = statusMap.get(order.status) || 0
      statusMap.set(order.status, current + 1)
    })

    const statusStats = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / filteredOrders.length) * 100),
    }))

    const dailyMap = new Map<string, { orders: number; revenue: number }>()

    if (timeFilter === "day") {
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
        const key = hour.getHours().toString().padStart(2, "0") + ":00"
        dailyMap.set(key, { orders: 0, revenue: 0 })
      }

      filteredOrders.forEach((order) => {
        const hour = new Date(order.createdAt).getHours().toString().padStart(2, "0") + ":00"
        const current = dailyMap.get(hour) || { orders: 0, revenue: 0 }
        dailyMap.set(hour, {
          orders: current.orders + 1,
          revenue: current.revenue + order.total,
        })
      })
    } else {
      const days = timeFilter === "week" ? 7 : 30
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const key = date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
        dailyMap.set(key, { orders: 0, revenue: 0 })
      }

      filteredOrders.forEach((order) => {
        const key = new Date(order.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
        const current = dailyMap.get(key) || { orders: 0, revenue: 0 }
        dailyMap.set(key, {
          orders: current.orders + 1,
          revenue: current.revenue + order.total,
        })
      })
    }

    const dailyStats = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      orders: stats.orders,
      revenue: stats.revenue,
    }))

    return {
      totalOrders: filteredOrders.length,
      totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
      productStats,
      dailyStats,
      statusStats,
    }
  }, [orders, timeFilter, selectedProduct])

  const availableProducts = useMemo(() => {
    const products = new Set<string>()
    orders.forEach((order) => {
      order.items.forEach((item) => products.add(item.name))
    })
    return Array.from(products).sort()
  }, [orders])

  if (loading || reviewsLoading) {
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
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif">{t("admin.adminPanel")}</CardTitle>
              <CardDescription>{t("admin.completeRestaurantManagement")}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link 
                href={`/admin/reservas?barId=${barId}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                {t("admin.reservationManagement")}
              </Link>
              <OrderNotificationPanel barId={barId} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas de Reservas */}
      <ReservationStats barId={barId} />


      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-xl mb-6 bg-white/10 border-white/20">
          <TabsTrigger value="analytics">{t("admin.analytics")}</TabsTrigger>
          <TabsTrigger value="crm">{t("admin.crm")}</TabsTrigger>
          <TabsTrigger value="reviews">{t("admin.reviews")}</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">{t("admin.dashboard")}</CardTitle>
              <CardDescription>{t("admin.orderAndSalesAnalysis")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("admin.period")}</label>
                  <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">{t("admin.today")}</SelectItem>
                      <SelectItem value="week">{t("admin.week")}</SelectItem>
                      <SelectItem value="month">{t("admin.month")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("admin.product")}</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("admin.allProducts")}</SelectItem>
                      {availableProducts.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardDescription>{t("admin.totalOrders")}</CardDescription>
                <CardTitle className="text-3xl font-serif">{filteredStats.totalOrders}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardDescription>{t("admin.totalRevenue")}</CardDescription>
                <CardTitle className="text-3xl font-serif">${(filteredStats.totalRevenue || 0).toFixed(2)}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardDescription>{t("admin.averagePerOrder")}</CardDescription>
                <CardTitle className="text-3xl font-serif">
                  $
                  {filteredStats.totalOrders > 0 && filteredStats.totalRevenue
                    ? ((filteredStats.totalRevenue || 0) / filteredStats.totalOrders).toFixed(2)
                    : "0.00"}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Calificación Promedio
                </CardDescription>
                <CardTitle className="text-3xl font-serif flex items-center gap-2">
                  {reviewsStats.averageRating.toFixed(1)}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= reviewsStats.averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </CardTitle>
                <CardDescription className="text-xs">{reviewsStats.totalReviews} {t("admin.totalReviews")}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{timeFilter === "day" ? t("admin.ordersByHour") : t("admin.ordersByDay")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={filteredStats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "orders" ? `${value} pedidos` : `$${value}`,
                        name === "orders" ? "Pedidos" : "Ingresos",
                      ]}
                    />
                    <Bar dataKey="orders" fill="#8884d8" name="orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.orderStatus")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={filteredStats.statusStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, percentage }) => `${status}: ${percentage}%`}
                    >
                      {filteredStats.statusStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} pedidos`, "Cantidad"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {t("admin.ratingDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviewsStats.ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  ))}
                </div>
                {reviewsStats.totalReviews === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">{t("admin.noReviewsYet")}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">{t("admin.mostSoldProducts")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStats.productStats.slice(0, 5).map((product, index) => (
                  <div key={product.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{product.name}</p>
                          {product.hasDiscounts && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              {product.discountPercentage}{t("admin.discountPercentage")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.count} {t("admin.units")}
                          {product.discountedSales > 0 && (
                            <span className="text-green-600 ml-1">({product.discountedSales} {t("admin.withDiscount")})</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {product.hasDiscounts ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground line-through">
                            ${(product.originalRevenue || 0).toFixed(2)}
                          </p>
                          <p className="font-medium text-green-600">${(product.revenue || 0).toFixed(2)}</p>
                          <p className="text-xs text-green-600">{t("admin.savings")}: ${(product.totalSavings || 0).toFixed(2)}</p>
                        </div>
                      ) : (
                        <p className="font-medium">${(product.revenue || 0).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm">
          <AdminCRMPanel barId={barId} />
        </TabsContent>
        
        <TabsContent value="reviews">
          <AdminReviewsPanel barId={barId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { AdminDashboard as AdminDashboardComponent }
