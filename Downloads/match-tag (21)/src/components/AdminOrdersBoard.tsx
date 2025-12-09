"use client"

import { useAdminOrders } from "@/src/hooks/useAdminOrders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Order, OrderItemSpecification } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"
import { OrderHistoryPanel } from "@/src/components/OrderHistoryPanel"
import { Clock, Activity } from "lucide-react"

interface AdminOrdersBoardProps {
  barId: string
}

const formatDateTime = (date: Date | any) => {
  const d = date instanceof Date ? date : new Date(date)
  const time = d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const dateStr = d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
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

const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered"],
  delivered: [],
  cancelled: [],
}

export function AdminOrdersBoard({ barId }: AdminOrdersBoardProps) {
  const { orders, loading, updateOrderStatus } = useAdminOrders(barId)
  const t = useT()

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    await updateOrderStatus(orderId, newStatus)
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

  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status))

  const orderStatusConfig = getOrderStatusConfig(t)

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-serif">{t("admin.ordersPanel")}</CardTitle>
        <CardDescription>{t("admin.manageOrderStatus")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t("admin.activeOrders")}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("admin.orderHistory")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeOrders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>{t("admin.noActiveOrders")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
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
                            {formatDateTime(order.createdAt)}
                            {order.senderTableNumber && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {t("admin.orderSent")}
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
                    <CardContent className="space-y-4">
                      {(order.customerName || order.accountType) && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">👤 {order.customerName || "Cliente"}</p>
                              {order.customerPhone && <p className="text-xs text-slate-600">📞 {order.customerPhone}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {order.accountType && (
                                <Badge
                                  variant={order.accountType === "individual" ? "default" : "secondary"}
                                  className={`rounded-lg text-xs ${
                                    order.accountType === "individual"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "bg-blue-100 text-blue-800 border-blue-200"
                                  }`}
                                >
                                  {order.accountType === "individual" ? "🧾 Cuenta Individual" : "👥 Cuenta Compartida"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                            </div>
                            {(item.specifications || item.notes) && (
                              <div className="ml-4 p-2 bg-amber-50 border-l-4 border-amber-200 rounded-r-lg">
                                <p className="text-xs font-medium text-amber-800 mb-1">📝 Especificaciones:</p>
                                <div className="text-xs text-amber-700">
                                  {Array.isArray(item.specifications) ? (
                                    <div className="space-y-1">
                                      {item.specifications.map((spec, specIndex) => (
                                        <div key={specIndex}>
                                          <span className="font-medium">{spec.specificationName}:</span>
                                          <span className="ml-1">
                                            {spec.selectedOptions.map(opt => opt.optionName).join(', ')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p>{item.specifications || item.notes}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {STATUS_TRANSITIONS[order.status].map((nextStatus) => (
                          <Button
                            key={nextStatus}
                            size="sm"
                            variant={nextStatus === "cancelled" ? "destructive" : "default"}
                            onClick={() => handleStatusChange(order.id, nextStatus as Order["status"])}
                            className="rounded-lg"
                          >
                            {orderStatusConfig[nextStatus as Order["status"]].label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <OrderHistoryPanel barId={barId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
