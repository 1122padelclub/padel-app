"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, Download, Clock, Users, DollarSign } from "lucide-react"
import { format, startOfDay, endOfDay, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useOrders } from "@/src/hooks/useOrders"
import { useT } from "@/src/hooks/useTranslation"
import type { Order } from "@/src/types"

interface OrderHistoryPanelProps {
  barId: string
}

const formatDateTime = (date: Date) => {
  const time = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
  const dateStr = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
  return `${time} - ${dateStr}`
}

const getOrderStatusConfig = (t: any) => ({
  pending: { label: t("admin.pending"), variant: "secondary" as const, color: "bg-yellow-500" },
  confirmed: { label: t("admin.confirmed"), variant: "default" as const, color: "bg-blue-500" },
  preparing: { label: t("admin.preparing"), variant: "default" as const, color: "bg-orange-500" },
  ready: { label: t("admin.ready"), variant: "default" as const, color: "bg-green-500" },
  delivered: { label: t("admin.delivered"), variant: "outline" as const, color: "bg-gray-500" },
  cancelled: { label: t("admin.cancelled"), variant: "destructive" as const, color: "bg-red-500" },
})

export function OrderHistoryPanel({ barId }: OrderHistoryPanelProps) {
  const { orders, loading } = useOrders(barId)
  const t = useT()
  
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const orderStatusConfig = getOrderStatusConfig(t)

  // Filtrar pedidos según los filtros aplicados
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Filtrar por fecha
    if (selectedDate) {
      filtered = filtered.filter(order => 
        isSameDay(new Date(order.createdAt), selectedDate)
      )
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filtrar por término de búsqueda (nombre de mesa o cliente)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(order => 
        order.tableNumber?.toString().toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.senderTableNumber?.toString().toLowerCase().includes(searchLower)
      )
    }

    // Ordenar por fecha de creación (más reciente primero)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [orders, selectedDate, statusFilter, searchTerm])

  // Estadísticas del historial filtrado
  const stats = useMemo(() => {
    const total = filteredOrders.length
    const totalValue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const byStatus = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, totalValue, byStatus }
  }, [filteredOrders])

  const clearFilters = () => {
    setSelectedDate(undefined)
    setStatusFilter("all")
    setSearchTerm("")
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
      {/* Header con estadísticas */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t("admin.orderHistory")}
          </CardTitle>
          <CardDescription>{t("admin.viewAndFilterOrderHistory")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">{t("admin.totalOrders")}</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600">{t("admin.totalValue")}</p>
                <p className="text-2xl font-bold text-green-800">${stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Badge variant="default" className="bg-orange-500">
                {stats.byStatus.delivered || 0}
              </Badge>
              <div>
                <p className="text-sm text-orange-600">{t("admin.delivered")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <Badge variant="destructive">
                {stats.byStatus.cancelled || 0}
              </Badge>
              <div>
                <p className="text-sm text-red-600">{t("admin.cancelled")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t("admin.filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro por fecha */}
            <div className="space-y-2">
              <Label>{t("admin.selectDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : t("admin.allDates")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <Label>{t("admin.status")}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
                  <SelectItem value="pending">{t("admin.pending")}</SelectItem>
                  <SelectItem value="confirmed">{t("admin.confirmed")}</SelectItem>
                  <SelectItem value="preparing">{t("admin.preparing")}</SelectItem>
                  <SelectItem value="ready">{t("admin.ready")}</SelectItem>
                  <SelectItem value="delivered">{t("admin.delivered")}</SelectItem>
                  <SelectItem value="cancelled">{t("admin.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div className="space-y-2">
              <Label>{t("admin.search")}</Label>
              <Input
                placeholder={t("admin.searchByTableOrCustomer")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent"
              />
            </div>

            {/* Botón limpiar filtros */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full bg-transparent"
              >
                {t("admin.clearFilters")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pedidos */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("admin.ordersList")}</CardTitle>
            <Badge variant="outline">
              {filteredOrders.length} {t("admin.orders")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t("admin.noOrdersFound")}</p>
              <p className="text-sm mt-2">{t("admin.tryAdjustingFilters")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="rounded-xl">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        {order.senderTableNumber ? (
                          <>
                            {t("admin.table")} {order.senderTableNumber} → {t("admin.table")} {order.tableNumber}
                          </>
                        ) : (
                          <>{t("admin.table")} {order.tableNumber}</>
                        )}
                        <CardDescription>
                          {formatDateTime(new Date(order.createdAt))}
                          {order.senderTableNumber && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {t("admin.orderSent")}
                            </span>
                          )}
                          {order.customerName && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {order.customerName}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={orderStatusConfig[order.status].variant} className="rounded-lg">
                          {orderStatusConfig[order.status].label}
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">
                          ${(order.total || 0).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {t("admin.items")}: {order.items?.length || 0}
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="space-y-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-sm flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{order.items.length - 3} {t("admin.moreItems")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




