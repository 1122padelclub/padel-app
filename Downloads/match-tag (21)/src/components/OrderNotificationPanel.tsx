"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, X, CheckCircle, Clock, User, ShoppingCart, DollarSign } from "lucide-react"
import { useOrderNotifications } from "@/src/hooks/useOrderNotifications"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface OrderNotificationPanelProps {
  barId: string
  onOrderClick?: (orderId: string) => void
}

export function OrderNotificationPanel({ barId, onOrderClick }: OrderNotificationPanelProps) {
  const { notifications, loading, error, markAsRead, markAllAsRead, getUnreadCount } = useOrderNotifications(barId)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = getUnreadCount()

  // Mostrar notificación del navegador cuando hay un nuevo pedido
  useEffect(() => {
    if (unreadCount > 0 && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Nuevo Pedido!', {
          body: `Tienes ${unreadCount} pedido${unreadCount > 1 ? 's' : ''} pendiente${unreadCount > 1 ? 's' : ''}`,
          icon: '/favicon.ico',
          tag: 'new-order'
        })
      } else if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [unreadCount])

  const handleOrderClick = (orderId: string) => {
    markAsRead(orderId)
    if (onOrderClick) {
      onOrderClick(orderId)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  if (loading) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary absolute -top-1 -right-1"></div>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="relative rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de notificaciones */}
          <Card className="absolute right-0 top-12 w-80 z-50 rounded-2xl shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Pedidos Pendientes
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="rounded-full">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      Marcar todo
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {error ? (
                <div className="p-4 text-center text-red-500">
                  Error cargando notificaciones: {error}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>No hay pedidos pendientes</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2 p-2">
                    {notifications.map((notification) => (
                      <Card 
                        key={notification.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          notification.isNew 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                            : 'bg-white dark:bg-gray-800'
                        }`}
                        onClick={() => handleOrderClick(notification.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-sm">
                                  {notification.customerName}
                                </span>
                                {notification.isNew && (
                                  <Badge variant="default" className="text-xs px-1 py-0">
                                    Nuevo
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <ShoppingCart className="h-3 w-3" />
                                <span>Mesa {notification.tableNumber}</span>
                                <span>•</span>
                                <span>{notification.itemsCount} items</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>${notification.total.toFixed(2)}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(notification.createdAt), 'HH:mm', { locale: es })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <Badge 
                                variant={notification.status === 'pending' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {notification.status === 'pending' ? 'Pendiente' : notification.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}





