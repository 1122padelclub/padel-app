"use client"

import { useState } from "react"
import { useMenu } from "@/src/hooks/useMenu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Plus } from "lucide-react"
import { ref, push, set } from "@/src/services/firebaseExtras"
import { realtimeDb } from "@/src/services/firebaseExtras"
import { useCRMContacts } from "@/src/hooks/useCRMContacts"
import type { MenuItem, OrderItem, OrderItemSpecification } from "@/src/types"
import { CustomerInfoModal, type CustomerInfo } from "@/src/components/CustomerInfoModal"
import { ItemSpecificationsSelector } from "@/src/components/ItemSpecificationsSelector"
import { useTableT } from "@/src/hooks/useTableTranslation"

interface ChatMenuModalProps {
  isOpen: boolean
  onClose: () => void
  barId: string
  tableId: string
  tableNumber: number | string
  senderTableId: string
  senderTableNumber: number | string
  onSendMenuItem: (item: MenuItem) => void
}

export function ChatMenuModal({
  isOpen,
  onClose,
  barId,
  tableId,
  tableNumber,
  senderTableId,
  senderTableNumber,
  onSendMenuItem,
}: ChatMenuModalProps) {
  const tableT = useTableT()
  const { categories, items, loading, getItemsByCategory } = useMenu(barId)
  const [selectedItems, setSelectedItems] = useState<{ item: MenuItem; quantity: number; specifications?: OrderItemSpecification[] }[]>([])
  const [itemSpecifications, setItemSpecifications] = useState<{ [key: string]: OrderItemSpecification[] }>({})
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  // Hook para CRM
  const { addContact } = useCRMContacts(barId)

  const availableItems = items.filter((item) => item.isAvailable)
  // Mostrar todas las categorías en el chat, no solo las que tienen items disponibles
  const availableCategories = categories

  const handleAddItem = (item: MenuItem) => {
    const existingItem = selectedItems.find((selected) => selected.item.id === item.id)
    if (existingItem) {
      setSelectedItems((prev) =>
        prev.map((selected) =>
          selected.item.id === item.id ? { ...selected, quantity: selected.quantity + 1, specifications: itemSpecifications[item.id] || [] } : selected,
        ),
      )
    } else {
      setSelectedItems((prev) => [...prev, { item, quantity: 1, specifications: itemSpecifications[item.id] || [] }])
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const existingItem = prev.find((selected) => selected.item.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((selected) =>
          selected.item.id === itemId ? { ...selected, quantity: selected.quantity - 1 } : selected,
        )
      } else {
        return prev.filter((selected) => selected.item.id !== itemId)
      }
    })
  }

  const updateItemSpecifications = (itemId: string, specifications: OrderItemSpecification[]) => {
    setItemSpecifications((prev) => ({
      ...prev,
      [itemId]: specifications,
    }))
  }

  const handleSendOrder = async () => {
    if (selectedItems.length === 0) return
    setShowCustomerModal(true)
  }

  const handleCustomerInfoConfirm = async (customerInfo: CustomerInfo) => {
    setShowCustomerModal(false)
    setIsCreatingOrder(true)
    
    // Pequeño delay para asegurar que el modal se cierre completamente
    await new Promise(resolve => setTimeout(resolve, 50))

    try {
      console.log("[v0] Iniciando creación de pedido con información del cliente...")
      console.log("[v0] customerInfo:", customerInfo)
      console.log("[v0] barId:", barId)
      console.log("[v0] tableId (destino):", tableId)
      console.log("[v0] tableNumber (destino):", tableNumber)
      console.log("[v0] senderTableId (origen):", senderTableId)
      console.log("[v0] senderTableNumber (origen):", senderTableNumber)
      console.log("[v0] selectedItems:", selectedItems)

      if (!barId || !tableId || !tableNumber || !senderTableId || !senderTableNumber) {
        throw new Error(
          `Datos faltantes: barId=${barId}, tableId=${tableId}, tableNumber=${tableNumber}, senderTableId=${senderTableId}, senderTableNumber=${senderTableNumber}`,
        )
      }

      const orderItems: OrderItem[] = selectedItems.map(({ item, quantity, specifications }) => ({
        menuItemId: item.id,
        name: item.name,
        price: item.promotionPrice || item.price,
        quantity,
        specifications: specifications || [],
      }))

      const total = orderItems.reduce((sum, item) => {
        const basePrice = item.price * item.quantity
        const specificationsPrice = item.specifications?.reduce((specTotal, spec) => {
          return specTotal + spec.selectedOptions.reduce((optionTotal, option) => {
            return optionTotal + (option.priceModifier || 0)
          }, 0)
        }, 0) || 0
        
        return sum + basePrice + (specificationsPrice * item.quantity)
      }, 0)

      const orderData = {
        barId,
        tableId,
        tableNumber: Number(tableNumber),
        senderTableId,
        senderTableNumber: Number(senderTableNumber),
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || "",
        accountType: customerInfo.accountType,
        items: orderItems,
        status: "pending" as const,
        total,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      console.log("[v0] Datos del pedido a crear:", orderData)

      if (!realtimeDb) {
        throw new Error("Firebase Realtime Database no está inicializado")
      }

      const ordersRef = ref(realtimeDb, `orders/${barId}`)
      const newOrderRef = push(ordersRef)
      await set(newOrderRef, orderData)

      console.log("[v0] Pedido creado exitosamente con ID:", newOrderRef.key)

      // Agregar cliente al CRM usando el nuevo sistema
      try {
        console.log("📝 Agregando cliente al CRM desde pedido de chat...")
        
        // Crear resumen del pedido
        const orderSummary = selectedItems.map(({ item, quantity }) => 
          `${quantity}x ${item.name}`
        ).join(', ')
        
        const crmContactData = {
          name: customerInfo.name,
          email: "", // No se pide email en pedidos
          phone: customerInfo.phone || "",
          source: "chat_order",
          tableNumber: tableNumber,
          orderId: newOrderRef.key,
          orderSummary: orderSummary,
          totalAmount: total,
          accountType: customerInfo.accountType,
          comment: `Pedido desde chat - Mesa ${tableNumber} a Mesa ${senderTableNumber}: ${orderSummary}`,
        }
        
        console.log("📝 Datos CRM del pedido de chat:", crmContactData)
        
        const contactId = await addContact(crmContactData)
        console.log("✅ Cliente agregado al CRM desde pedido de chat con ID:", contactId)
        
      } catch (crmError) {
        console.error("❌ Error agregando cliente al CRM desde pedido de chat:", crmError)
        // No fallar el pedido si el CRM falla - solo loguear el error
        console.warn("⚠️ El pedido se completó pero no se pudo guardar en el CRM")
      }

      // Solo enviar items del menú si hay un chat activo (cuando los chats están habilitados)
      // Verificar si onSendMenuItem está definido y si hay un chat seleccionado
      if (onSendMenuItem && typeof onSendMenuItem === 'function') {
        try {
          selectedItems.forEach(({ item, quantity }) => {
            for (let i = 0; i < quantity; i++) {
              onSendMenuItem(item)
            }
          })
        } catch (chatError) {
          // Si hay error al enviar items del menú (ej: chats desactivados), solo loguear
          // No fallar el pedido por esto
          console.warn("⚠️ No se pudieron enviar items del menú al chat (chats desactivados o sin chat seleccionado):", chatError)
        }
      } else {
        console.log("ℹ️ Chats desactivados - pedido creado sin enviar items al chat")
      }

      setSelectedItems([])
      // Cerrar el modal después de un pequeño delay para evitar conflictos de accesibilidad
      setTimeout(() => {
        onClose()
      }, 100)
    } catch (error) {
      console.error("[v0] Error detallado al crear pedido:", error)
      alert(
        `Error al crear el pedido: ${error instanceof Error ? error.message : "Error desconocido"}. Inténtalo de nuevo.`,
      )
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const getTotalPrice = () => {
    return selectedItems.reduce(
      (total, { item, quantity }) => total + (item.promotionPrice || item.price) * quantity,
      0,
    )
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="rounded-2xl max-w-md border"
          style={{
            backgroundColor: "var(--mt-surface)",
            borderColor: "var(--mt-secondary)",
          }}
        >
          <div className="flex items-center justify-center h-32">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "var(--mt-primary)" }}
            ></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="rounded-2xl max-w-md max-h-[90vh] h-[90vh] flex flex-col overflow-hidden"
          style={{
            backgroundColor: "var(--mt-surface)",
            borderColor: "var(--mt-secondary)",
            color: "var(--mt-text)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ color: "var(--mt-text)" }}>
              {tableT.t("menu.barMenu")}
            </DialogTitle>
            <DialogDescription style={{ color: "var(--mt-text)", opacity: 0.7 }}>
              {tableT.t("menu.selectItemsToSendTo")} {tableT.t("table.table")} {tableNumber}
            </DialogDescription>
          </DialogHeader>

          {availableCategories.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
              <p>{tableT.t("menu.noItemsAvailable")}</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <Tabs defaultValue={availableCategories[0]?.id} className="w-full flex-1 flex flex-col overflow-hidden">
                <div className="overflow-x-auto">
                  <TabsList className="inline-flex w-auto min-w-full" style={{ backgroundColor: "var(--mt-surface)" }}>
                    {availableCategories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="data-[state=active]:text-white whitespace-nowrap"
                        style={{
                          color: "var(--mt-text)",
                          backgroundColor: "transparent",
                        }}
                        data-state="active"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {availableCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="flex-1 min-h-0">
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="space-y-3">
                        {getItemsByCategory(category.id)
                          .filter((item) => item.isAvailable)
                          .map((item) => {
                            const selectedQuantity = selectedItems.find((s) => s.item.id === item.id)?.quantity || 0
                            return (
                              <div
                                key={item.id}
                                className="rounded-xl p-3 border"
                                style={{
                                  backgroundColor: "var(--mt-surface)",
                                  borderColor: "var(--mt-secondary)",
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  {item.imageUrl && (
                                    <img
                                      src={item.imageUrl || "/placeholder.svg"}
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium truncate" style={{ color: "var(--mt-text)" }}>
                                        {item.name}
                                      </h4>
                                      {item.promotion && (
                                        <Badge
                                          variant="outline"
                                          className="rounded-lg text-xs"
                                          style={{
                                            backgroundColor: "#f59e0b20",
                                            color: "#f59e0b",
                                            borderColor: "#f59e0b",
                                          }}
                                        >
                                          {item.promotion}
                                        </Badge>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p
                                        className="text-sm line-clamp-2"
                                        style={{ color: "var(--mt-text)", opacity: 0.7 }}
                                      >
                                        {item.description}
                                      </p>
                                    )}
                                    {/* Especificaciones del menú */}
                                    {item.specifications && item.specifications.length > 0 && (
                                      <div className="mt-3">
                                        <ItemSpecificationsSelector
                                          specifications={item.specifications}
                                          selectedSpecifications={itemSpecifications[item.id] || []}
                                          onSpecificationsChange={(specs) => updateItemSpecifications(item.id, specs)}
                                        />
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex flex-col">
                                        {item.promotionPrice ? (
                                          <>
                                            <Badge
                                              variant="secondary"
                                              className="line-through text-xs mb-1"
                                              style={{
                                                backgroundColor: "var(--mt-surface)",
                                                color: "var(--mt-text)",
                                                opacity: 0.7,
                                              }}
                                            >
                                              ${(item.price || 0).toFixed(2)}
                                            </Badge>
                                            <Badge
                                              variant="secondary"
                                              style={{
                                                backgroundColor: "#10b98120",
                                                color: "#10b981",
                                              }}
                                            >
                                              ${(item.promotionPrice || 0).toFixed(2)}
                                            </Badge>
                                          </>
                                        ) : (
                                          <Badge
                                            variant="secondary"
                                            style={{
                                              backgroundColor: "#10b98120",
                                              color: "#10b981",
                                            }}
                                          >
                                            ${(item.price || 0).toFixed(2)}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {selectedQuantity > 0 && (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleRemoveItem(item.id)}
                                              className="h-8 w-8 p-0"
                                              style={{
                                                backgroundColor: "var(--mt-surface)",
                                                borderColor: "var(--mt-secondary)",
                                                color: "var(--mt-text)",
                                              }}
                                            >
                                              -
                                            </Button>
                                            <span
                                              className="text-sm font-medium w-6 text-center"
                                              style={{ color: "var(--mt-text)" }}
                                            >
                                              {selectedQuantity}
                                            </span>
                                          </>
                                        )}
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddItem(item)}
                                          className="h-8 w-8 p-0 text-white"
                                          style={{ backgroundColor: "var(--mt-primary)" }}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>

              {selectedItems.length > 0 && (
                <div
                  className="rounded-xl p-4 border flex-shrink-0"
                  style={{
                    backgroundColor: "var(--mt-surface)",
                    borderColor: "var(--mt-secondary)",
                  }}
                >
                  <h4 className="font-medium mb-2" style={{ color: "var(--mt-text)" }}>
                    Resumen del Pedido
                  </h4>
                  <div className="space-y-1 text-sm">
                    {selectedItems.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="flex justify-between"
                        style={{ color: "var(--mt-text)", opacity: 0.7 }}
                      >
                        <span>
                          {item.name} x{quantity}
                          {item.promotion && <span className="text-orange-400 ml-1">({item.promotion})</span>}
                        </span>
                        <span>${((item.promotionPrice || item.price || 0) * quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="border-t mt-2 pt-2 flex justify-between font-medium"
                    style={{
                      borderColor: "var(--mt-secondary)",
                      color: "var(--mt-text)",
                    }}
                  >
                    <span>Total:</span>
                    <span>${(getTotalPrice() || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isCreatingOrder}
                  className="flex-1 bg-transparent"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "var(--mt-secondary)",
                    color: "var(--mt-text)",
                  }}
                >
                  {tableT.t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSendOrder}
                  disabled={selectedItems.length === 0 || isCreatingOrder}
                  className="flex-1 text-white"
                  style={{ backgroundColor: "var(--mt-primary)" }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isCreatingOrder ? tableT.t("common.sending") : tableT.t("menu.sendOrder")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CustomerInfoModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onConfirm={handleCustomerInfoConfirm}
        tableNumber={senderTableNumber}
      />
    </>
  )
}
