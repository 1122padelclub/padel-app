"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { ShoppingCart, Download, TrendingUp, DollarSign, Package } from "lucide-react"
import { exportOrdersToExcel } from "@/src/utils/crmExports"
import type { Order } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface OrdersDashboardProps {
  orders: Order[]
  loading: boolean
}

export function OrdersDashboard({ orders, loading }: OrdersDashboardProps) {
  const t = useT()
  const [timeFilter, setTimeFilter] = useState<"all" | "day" | "week" | "month">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled">("all")

  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Filtrar por tiempo
    if (timeFilter !== "all") {
      const now = new Date()
      const cutoff = new Date()
      
      if (timeFilter === "day") {
        cutoff.setDate(now.getDate() - 1)
      } else if (timeFilter === "week") {
        cutoff.setDate(now.getDate() - 7)
      } else if (timeFilter === "month") {
        cutoff.setMonth(now.getMonth() - 1)
      }
      
      filtered = filtered.filter(order => order.createdAt && new Date(order.createdAt) >= cutoff)
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    return filtered
  }, [orders, timeFilter, statusFilter])

  const stats = useMemo(() => {
    if (filteredOrders.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        statusBreakdown: [],
        hourlyDistribution: [],
        topProducts: [],
        revenueByStatus: []
      }
    }

    const totalOrders = filteredOrders.length
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = totalRevenue / totalOrders

    // Distribución por estado
    const statusMap = new Map<string, { count: number; revenue: number }>()
    filteredOrders.forEach(order => {
      const existing = statusMap.get(order.status) || { count: 0, revenue: 0 }
      statusMap.set(order.status, {
        count: existing.count + 1,
        revenue: existing.revenue + order.total
      })
    })

    const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
      count: data.count,
      revenue: data.revenue,
      percentage: ((data.count / totalOrders) * 100).toFixed(1)
    }))

    // Distribución por hora
    const hourlyMap = new Map<string, { orders: number; revenue: number }>()
    filteredOrders.forEach(order => {
      if (order.createdAt) {
        const hour = new Date(order.createdAt).getHours().toString().padStart(2, '0') + ':00'
        const existing = hourlyMap.get(hour) || { orders: 0, revenue: 0 }
        hourlyMap.set(hour, {
          orders: existing.orders + 1,
          revenue: existing.revenue + order.total
        })
      }
    })

    const hourlyDistribution = Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour.localeCompare(b.hour))

    // Productos más vendidos
    const productMap = new Map<string, { quantity: number; revenue: number }>()
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productMap.get(item.name) || { quantity: 0, revenue: 0 }
        productMap.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.promotionPrice || item.price) * item.quantity
        })
      })
    })

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        averagePrice: data.revenue / data.quantity
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusBreakdown,
      hourlyDistribution,
      topProducts
    }
  }, [filteredOrders])

  const handleExport = () => {
    exportOrdersToExcel(filteredOrders, `orders_${timeFilter}_${statusFilter}`)
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
                <ShoppingCart className="h-5 w-5" />
                {t("admin.ordersDashboard")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("admin.ordersRevenueAndBestSellingProductsAnalysis")}
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
                  <SelectItem value="day">{t("admin.today")}</SelectItem>
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
                  <SelectItem value="pending">{t("admin.pending")}</SelectItem>
                  <SelectItem value="confirmed">{t("admin.confirmed")}</SelectItem>
                  <SelectItem value="preparing">{t("admin.preparing")}</SelectItem>
                  <SelectItem value="ready">{t("admin.ready")}</SelectItem>
                  <SelectItem value="delivered">{t("admin.delivered")}</SelectItem>
                  <SelectItem value="cancelled">{t("admin.cancelled")}</SelectItem>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.totalOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">{t("admin.inSelectedPeriod")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
{t("admin.totalRevenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("admin.revenueGenerated")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
{t("admin.averageValue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("admin.perOrder")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Package className="h-4 w-4" />
{t("admin.uniqueProducts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topProducts.length}</div>
            <p className="text-xs text-muted-foreground">{t("admin.productsSold")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 rounded-xl">
          <TabsTrigger value="overview">{t("admin.summary")}</TabsTrigger>
          <TabsTrigger value="products">{t("admin.products")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("admin.timeline")}</TabsTrigger>
          <TabsTrigger value="status">{t("admin.statuses")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.ordersByHour")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === "orders" ? `${value} ${t("admin.orders")}` : `$${value}`,
                      name === "orders" ? t("admin.orders") : t("admin.revenue")
                    ]} />
                    <Bar dataKey="orders" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.revenueByHour")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, t("admin.revenue")]} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">{t("admin.bestSellingProducts")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={product.name} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} {t("admin.unitsSold")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
${product.averagePrice.toFixed(2)} {t("admin.average")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">{t("admin.ordersTimeline")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{t("admin.order")} #{order.id.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.table")} {order.tableNumber} • {order.items.length} {t("admin.items")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">{t("admin.distributionByStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.statusBreakdown.map((status) => (
                  <div key={status.status} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{status.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {status.count} {t("admin.orders")} ({status.percentage}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${status.revenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{t("admin.revenue")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
