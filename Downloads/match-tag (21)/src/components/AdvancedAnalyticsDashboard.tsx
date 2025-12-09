"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAdvancedAnalytics } from "@/src/hooks/useAdvancedAnalytics"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  Zap,
  Download,
  AlertCircle,
} from "lucide-react"

interface AdvancedAnalyticsDashboardProps {
  barId: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function AdvancedAnalyticsDashboard({ barId }: AdvancedAnalyticsDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("day")
  const { analytics, realtimeMetrics, error } = useAdvancedAnalytics(barId, timeFilter)

  const weeklyVisits = [
    { day: "Lunes", visits: 45, avgHour: 14 },
    { day: "Martes", visits: 52, avgHour: 13 },
    { day: "Miércoles", visits: 38, avgHour: 15 },
    { day: "Jueves", visits: 67, avgHour: 19 },
    { day: "Viernes", visits: 89, avgHour: 20 },
    { day: "Sábado", visits: 95, avgHour: 21 },
    { day: "Domingo", visits: 73, avgHour: 16 },
  ]

  const hourlyVisits = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    visits: hour >= 12 && hour <= 22 ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 5) + 1,
  }))

  const topCategories = [
    { name: "Hamburguesas", orders: 156, percentage: 32 },
    { name: "Pizzas", orders: 134, percentage: 28 },
    { name: "Bebidas", orders: 98, percentage: 20 },
    { name: "Ensaladas", orders: 67, percentage: 14 },
    { name: "Postres", orders: 29, percentage: 6 },
  ]

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-center">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Error al cargar analytics avanzados</p>
              <p className="text-sm text-orange-600 mt-1">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Verifica que tengas los permisos necesarios para acceder a los datos del CRM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics || !realtimeMetrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando analytics avanzados...</div>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-serif">Analytics Avanzados</CardTitle>
              <CardDescription>Métricas detalladas y predicciones</CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hoy</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mes</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas en tiempo real */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Activos</p>
                <p className="text-2xl font-bold text-orange-600">{realtimeMetrics.activeOrders}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Espera</p>
                <p className="text-2xl font-bold text-blue-600">{realtimeMetrics.waitingTime}min</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Hoy</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(realtimeMetrics.currentRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mesas Ocupadas</p>
                <p className="text-2xl font-bold text-purple-600">{realtimeMetrics.tablesOccupied}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Personal</p>
                <p className="text-2xl font-bold text-indigo-600">{realtimeMetrics.staffOnDuty}</p>
              </div>
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparativa de períodos */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Comparativa de Períodos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ingresos</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.periodComparison.currentPeriod.revenue)}</p>
              <div className="flex items-center gap-2">
                {analytics.periodComparison.growthPercentage >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm ${analytics.periodComparison.growthPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatPercentage(analytics.periodComparison.growthPercentage)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pedidos</p>
              <p className="text-2xl font-bold">{analytics.periodComparison.currentPeriod.orders}</p>
              <p className="text-sm text-muted-foreground">
                vs {analytics.periodComparison.previousPeriod.orders} anterior
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ticket Promedio</p>
              <p className="text-2xl font-bold">
                {formatCurrency(analytics.periodComparison.currentPeriod.averageOrderValue)}
              </p>
              <p className="text-sm text-muted-foreground">
                vs {formatCurrency(analytics.periodComparison.previousPeriod.averageOrderValue)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Clientes</p>
              <p className="text-2xl font-bold">{analytics.periodComparison.currentPeriod.customerCount}</p>
              <p className="text-sm text-muted-foreground">
                vs {analytics.periodComparison.previousPeriod.customerCount} anterior
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="operations">Operaciones</TabsTrigger>
          <TabsTrigger value="forecasting">Predicciones</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Visitas por Día de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyVisits}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} visitas`, "Visitas"]} />
                    <Bar dataKey="visits" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Visitas por Hora del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyVisits}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} visitas`, "Visitas"]} />
                    <Bar dataKey="visits" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Categorías Más Pedidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={category.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.orders} pedidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{category.percentage}%</p>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Nuevos Clientes</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.customerMetrics.newCustomers}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Clientes Recurrentes</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.customerMetrics.returningCustomers}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor de Vida</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(analytics.customerMetrics.customerLifetimeValue)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Retención</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatPercentage(analytics.customerMetrics.retentionRate * 100)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Métricas Operacionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Tiempo Preparación Promedio</span>
                  <Badge variant="outline">{analytics.operationalMetrics.averagePreparationTime} min</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tasa de Cumplimiento</span>
                  <Badge variant="outline">
                    {formatPercentage(analytics.operationalMetrics.orderFulfillmentRate * 100)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Utilización de Mesas</span>
                  <Badge variant="outline">
                    {formatPercentage(analytics.operationalMetrics.tableUtilization * 100)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Eficiencia del Personal</span>
                  <Badge variant="outline">
                    {formatPercentage(analytics.operationalMetrics.staffEfficiency * 100)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Predicciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Ingresos Predichos</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(analytics.forecasting.predictedRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pedidos Predichos</span>
                  <span className="font-bold text-blue-600">{analytics.forecasting.predictedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Personal Recomendado</span>
                  <span className="font-bold text-purple-600">{analytics.forecasting.recommendedStaffing}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Alertas de Inventario
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.forecasting.inventoryAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.forecasting.inventoryAlerts.map((alert, index) => (
                      <div key={index} className="p-2 bg-orange-50 border-l-4 border-orange-200 rounded-r">
                        <p className="text-sm text-orange-800">{alert}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay alertas de inventario</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
