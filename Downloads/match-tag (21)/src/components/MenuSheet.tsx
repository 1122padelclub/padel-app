"use client"

import type React from "react"

import { useState } from "react"
import { useMenu } from "@/src/hooks/useMenu"
import { useCart } from "@/src/hooks/useCart"
import { OrderCard } from "./OrderCard"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { MenuItem } from "@/src/types"

interface MenuSheetProps {
  barId: string
  tableId: string
  onOrderCreated: (orderId: string, orderSummary: string) => void
  children: React.ReactNode
}

export function MenuSheet({ barId, tableId, onOrderCreated, children }: MenuSheetProps) {
  const { categories, loading, getItemsByCategory } = useMenu(barId)
  const { cartItems, addToCart, removeFromCart, updateQuantity, getTotal, createOrder } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddToCart = (item: MenuItem, quantity: number, notes?: string) => {
    addToCart(item, quantity, notes)
  }

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) return

    setIsProcessing(true)
    try {
      const orderId = await createOrder(barId, tableId)
      if (orderId) {
        const orderSummary = cartItems.map((item) => `${item.quantity}x ${item.name}`).join(", ")

        onOrderCreated(orderId, `Pedido: ${orderSummary} - Total: $${(getTotal() || 0).toFixed(2)}`)
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-serif">Menú</SheetTitle>
          <SheetDescription>Selecciona los items que deseas pedir</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full mt-4">
          <Tabs defaultValue={categories[0]?.id} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 rounded-xl">
              {categories.slice(0, 3).map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="rounded-lg">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="flex-1 overflow-y-auto mt-4">
                <div className="space-y-4 pb-32">
                  {getItemsByCategory(category.id).map((item) => (
                    <OrderCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif flex items-center justify-between">
                    Carrito
                    <Badge variant="secondary" className="rounded-xl">
                      {cartItems.length} items
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.menuItemId)}
                            className="h-6 w-6 p-0 rounded-lg text-destructive hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span>${(getTotal() || 0).toFixed(2)}</span>
                  </div>
                  <Button onClick={handleCreateOrder} disabled={isProcessing} className="w-full rounded-xl">
                    {isProcessing ? "Procesando..." : "Realizar Pedido"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
