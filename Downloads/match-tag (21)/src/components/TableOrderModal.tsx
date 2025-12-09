"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, ShoppingCart } from "@/src/components/icons/Icons"
import { Star, Sparkles, Flame, Leaf, Wheat } from "lucide-react"
import { useMenu } from "@/src/hooks/useMenu"
import { useCRMContacts } from "@/src/hooks/useCRMContacts"
import { ref, push, set } from "@/src/services/firebaseExtras"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { realtimeDb, db } from "@/src/services/firebaseExtras"
import type { MenuItem } from "@/src/types"
import type { MenuCategory } from "@/src/types"
import { CustomerInfoModal, type CustomerInfo } from "./CustomerInfoModal"
import { ItemSpecificationsSelector } from "./ItemSpecificationsSelector"
import { useT } from "@/src/hooks/useTranslation"
import { useTableT } from "@/src/hooks/useTableTranslation"

interface TableOrderModalProps {
  isOpen: boolean
  onClose: () => void
  barId: string
  tableId: string
  tableNumber: number | string
  onOrderCreated?: (orderId: string, orderSummary: string) => void
}

import type { OrderItemSpecification } from "@/src/types"

interface OrderItem extends MenuItem {
  quantity: number
  finalPrice: number
  specifications?: string
  orderSpecifications?: OrderItemSpecification[]
}

export function TableOrderModal({
  isOpen,
  onClose,
  barId,
  tableId,
  tableNumber,
  onOrderCreated,
}: TableOrderModalProps) {
  const tableT = useTableT()
  const t = useT() // Keep for common translations
  const { items: menuItems, categories, loading } = useMenu(barId)
  const { addContact } = useCRMContacts(barId)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [cart, setCart] = useState<OrderItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [itemSpecifications, setItemSpecifications] = useState<{ [key: string]: string }>({})
  const [itemOrderSpecifications, setItemOrderSpecifications] = useState<{ [key: string]: OrderItemSpecification[] }>({})
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  const updateItemSpecifications = (itemId: string, specifications: string) => {
    setItemSpecifications((prev) => ({
      ...prev,
      [itemId]: specifications,
    }))
  }

  const updateItemOrderSpecifications = (itemId: string, specifications: OrderItemSpecification[]) => {
    setItemOrderSpecifications((prev) => ({
      ...prev,
      [itemId]: specifications,
    }))
  }

  const updateCartItemSpecifications = (itemId: string, specifications: string) => {
    setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, specifications } : item)))
  }

  const updateCartItemOrderSpecifications = (itemId: string, orderSpecifications: OrderItemSpecification[]) => {
    setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, orderSpecifications } : item)))
  }

  useEffect(() => {
    console.log("[v0] TableOrderModal - Debug data:", {
      barId,
      categories: categories?.length || 0,
      menuItems: menuItems?.length || 0,
      selectedCategory,
      loading,
    })

    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id)
      console.log("[v0] Setting selected category to:", categories[0].id)
    }
  }, [categories, selectedCategory, menuItems, barId, loading])

  const filteredItems = useMemo(() => {
    if (!selectedCategory || !menuItems) {
      console.log("[v0] No category selected or no menu items")
      return []
    }

    const filtered = menuItems.filter((item) => {
      const matches = item.categoryId === selectedCategory || item.category === selectedCategory
      return matches
    })

    console.log("[v0] Filtered items:", {
      selectedCategory,
      totalItems: menuItems.length,
      filteredCount: filtered.length,
      sampleItem: menuItems[0]
        ? {
            name: menuItems[0].name,
            categoryId: menuItems[0].categoryId,
            category: menuItems[0].category,
          }
        : null,
    })

    return filtered
  }, [selectedCategory, menuItems])

  const getActiveBadges = (item: MenuItem) => {
    const badges = []
    // Usar un color consistente para todos los badges
    const badgeColor = "bg-blue-500"
    if (item.isRecommended) badges.push({ type: "recommended", icon: Star, text: t("menu.popular"), color: badgeColor })
    if (item.isNew) badges.push({ type: "new", icon: Sparkles, text: t("menu.new"), color: badgeColor })
    if (item.isSpicy) badges.push({ type: "spicy", icon: Flame, text: t("menu.spicy"), color: badgeColor })
    if (item.isVegetarian) badges.push({ type: "vegetarian", icon: Leaf, text: t("menu.vegetarian"), color: badgeColor })
    if (item.isVegan) badges.push({ type: "vegan", icon: Leaf, text: t("menu.vegan"), color: badgeColor })
    if (item.isGlutenFree) badges.push({ type: "glutenFree", icon: Wheat, text: t("menu.glutenFree"), color: badgeColor })
    return badges
  }

  const addToCart = (item: MenuItem) => {
    const finalPrice = item.isPromotion && item.promotionPrice ? item.promotionPrice : item.price
    const specifications = itemSpecifications[item.id] || ""
    const orderSpecifications = itemOrderSpecifications[item.id] || []

    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { 
            ...cartItem, 
            quantity: cartItem.quantity + 1, 
            specifications,
            orderSpecifications
          } : cartItem,
        )
      }
      return [...prev, { ...item, quantity: 1, finalPrice, specifications, orderSpecifications }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      }
      return prev.filter((cartItem) => cartItem.id !== itemId)
    })
  }

  const getCartItemQuantity = (itemId: string) => {
    const item = cart.find((cartItem) => cartItem.id === itemId)
    return item ? item.quantity : 0
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const basePrice = item.finalPrice * item.quantity
      const specificationsPrice = item.orderSpecifications?.reduce((specTotal, spec) => {
        return specTotal + spec.selectedOptions.reduce((optionTotal, option) => {
          return optionTotal + (option.priceModifier || 0)
        }, 0)
      }, 0) || 0
      
      return total + basePrice + (specificationsPrice * item.quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return

    if (!customerInfo) {
      setShowCustomerModal(true)
      return
    }

    setIsSubmitting(true)
    try {
      const orderData = {
        barId,
        tableId,
        tableNumber,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || "",
        accountType: customerInfo.accountType,
        items: cart.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          finalPrice: item.finalPrice,
          quantity: item.quantity,
          isPromotion: item.isPromotion || false,
          promotionDescription: item.promotionDescription || "",
          notes: item.specifications || "",
          specifications: item.orderSpecifications || [],
        })),
        total: getTotalPrice(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: "table_order",
      }

      // Guardar en Realtime Database
      const ordersRef = ref(realtimeDb, `orders/${barId}`)
      const newOrderRef = push(ordersRef)
      await set(newOrderRef, orderData)

      console.log("[v0] Pedido creado en Realtime DB:", newOrderRef.key)

      // Agregar cliente al CRM usando el nuevo sistema
      try {
        console.log("📝 Agregando cliente al CRM desde pedido...")
        
        // Crear resumen del pedido
        const orderSummary = cart.map(item => {
          let itemText = `${item.quantity}x ${item.name}`
          
          // Agregar especificaciones del menú
          if (item.orderSpecifications && item.orderSpecifications.length > 0) {
            const specTexts = item.orderSpecifications.map(spec => {
              const options = spec.selectedOptions.map(opt => opt.optionName).join(', ')
              return `${spec.specificationName}: ${options}`
            })
            itemText += ` (${specTexts.join(', ')})`
          }
          
          // Agregar notas adicionales
          if (item.specifications) {
            itemText += ` [${item.specifications}]`
          }
          
          return itemText
        }).join(', ')
        
        const crmContactData = {
          name: customerInfo.name,
          email: "", // No se pide email en pedidos
          phone: customerInfo.phone || "",
          source: "order",
          tableNumber: tableNumber,
          orderId: newOrderRef.key,
          orderSummary: orderSummary,
          totalAmount: getTotalPrice(),
          accountType: customerInfo.accountType,
          comment: `Pedido desde Mesa ${tableNumber}: ${orderSummary}`,
        }
        
        console.log("📝 Datos CRM del pedido:", crmContactData)
        
        const contactId = await addContact(crmContactData)
        console.log("✅ Cliente agregado al CRM desde pedido con ID:", contactId)
        
      } catch (crmError) {
        console.error("❌ Error agregando cliente al CRM desde pedido:", crmError)
        // No fallar el pedido si el CRM falla - solo loguear el error
        console.warn("⚠️ El pedido se completó pero no se pudo guardar en el CRM")
      }

      const orderSummary = `Pedido #${newOrderRef.key?.slice(-6)} - ${customerInfo.name} - ${getTotalItems()} items - $${getTotalPrice().toFixed(2)}`

      if (onOrderCreated) {
        onOrderCreated(newOrderRef.key || "", orderSummary)
      }

      setCart([])
      setItemSpecifications({})
      setCustomerInfo(null)
      onClose()

      alert(`¡Pedido realizado exitosamente!\n${orderSummary}`)
    } catch (error) {
      console.error("[v0] Error al crear pedido:", error)
      alert(t("errors.networkError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomerInfoConfirm = (info: CustomerInfo) => {
    setCustomerInfo(info)
    setShowCustomerModal(false)
    // Automatically proceed with order after customer info is set
    setTimeout(() => {
      handleSubmitOrder()
    }, 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] h-[90vh] border overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--mt-surface)",
          borderColor: "var(--mt-secondary)",
          color: "var(--mt-text)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center" style={{ color: "var(--mt-text)" }}>
            {tableT.t("order.makeOrder")} - {tableT.t("table.table")} {tableNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              {categories &&
                categories.map((category: MenuCategory) => {
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        console.log("[v0] Category selected:", category.id, category.name)
                        setSelectedCategory(category.id)
                      }}
                      className={selectedCategory === category.id ? "text-white" : "bg-transparent"}
                      style={
                        selectedCategory === category.id
                          ? { backgroundColor: "var(--mt-primary)" }
                          : {
                              backgroundColor: "transparent",
                              borderColor: "var(--mt-secondary)",
                              color: "var(--mt-text)",
                            }
                      }
                    >
                      {category.name || category.id}
                    </Button>
                  )
                })}
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {loading ? (
                <div className="text-center py-8" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                  Cargando menú...
                </div>
              ) : !filteredItems || filteredItems.length === 0 ? (
                <div className="text-center py-8" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                  No hay items en esta categoría
                  <div className="text-xs mt-2" style={{ color: "var(--mt-text)", opacity: 0.5 }}>
                    Debug: {menuItems?.length || 0} items totales, categoría: {selectedCategory}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredItems.map((item) => {
                    const quantity = getCartItemQuantity(item.id)
                    const finalPrice = item.isPromotion && item.promotionPrice ? item.promotionPrice : item.price

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl p-4 border"
                        style={{
                          backgroundColor: "var(--mt-surface)",
                          borderColor: "var(--mt-secondary)",
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3
                                  className="font-semibold text-lg flex items-center gap-2 flex-wrap"
                                  style={{ color: "var(--mt-text)" }}
                                >
                                  {item.name}
                                  {item.isPromotion && (
                                    <Badge className="bg-red-500 text-white text-xs">PROMOCIÓN</Badge>
                                  )}
                                  {getActiveBadges(item).map((badge, index) => {
                                    const IconComponent = badge.icon
                                    return (
                                      <Badge key={index} className={`${badge.color} text-white text-xs flex items-center gap-1`}>
                                        <IconComponent className="h-3 w-3" />
                                        {badge.text}
                                      </Badge>
                                    )
                                  })}
                                </h3>
                                {item.description && (
                                  <p className="text-sm mt-1" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                                    {item.description}
                                  </p>
                                )}
                                {item.isPromotion && item.promotionDescription && (
                                  <p className="text-green-400 text-sm mt-1 font-medium">
                                    🎉 {item.promotionDescription}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {item.isPromotion && item.promotionPrice ? (
                                    <>
                                      <span
                                        className="line-through text-sm"
                                        style={{ color: "var(--mt-text)", opacity: 0.7 }}
                                      >
                                        ${(item.price || 0).toFixed(2)}
                                      </span>
                                      <span className="text-green-400 font-bold text-lg">
                                        ${(item.promotionPrice || 0).toFixed(2)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold text-lg" style={{ color: "var(--mt-text)" }}>
                                      ${(item.price || 0).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-3">
                                  {/* Especificaciones del menú (término de carne, acompañantes, etc.) */}
                                  {item.specifications && item.specifications.length > 0 && (
                                    <div className="mb-3">
                                      <ItemSpecificationsSelector
                                        specifications={item.specifications}
                                        selectedSpecifications={itemOrderSpecifications[item.id] || []}
                                        onSpecificationsChange={(specs) => {
                                          updateItemOrderSpecifications(item.id, specs)
                                          updateCartItemOrderSpecifications(item.id, specs)
                                        }}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Notas adicionales del cliente */}
                                  <Textarea
                                    placeholder={t("orders.addInstructions")}
                                    value={itemSpecifications[item.id] || ""}
                                    onChange={(e) => updateItemSpecifications(item.id, e.target.value)}
                                    className="text-sm resize-none"
                                    style={{
                                      backgroundColor: "var(--mt-surface)",
                                      borderColor: "var(--mt-secondary)",
                                      color: "var(--mt-text)",
                                    }}
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {quantity > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromCart(item.id)}
                                    style={{
                                      backgroundColor: "transparent",
                                      borderColor: "var(--mt-secondary)",
                                      color: "var(--mt-text)",
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                                {quantity > 0 && (
                                  <span
                                    className="font-medium min-w-[2rem] text-center"
                                    style={{ color: "var(--mt-text)" }}
                                  >
                                    {quantity}
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  className="text-white"
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
              )}
            </ScrollArea>
          </div>

          <div
            className="w-full lg:w-80 rounded-xl p-4 border flex flex-col overflow-hidden"
            style={{
              backgroundColor: "var(--mt-surface)",
              borderColor: "var(--mt-secondary)",
            }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--mt-text)" }}>
              <ShoppingCart className="h-5 w-5" />
              {tableT.t("order.yourOrder")} ({getTotalItems()})
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-8" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                {tableT.t("order.yourCartIsEmpty")}
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 min-h-0 mb-4 overflow-hidden">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg p-3"
                        style={{
                          backgroundColor: "var(--mt-surface)",
                          border: "1px solid var(--mt-secondary)",
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm" style={{ color: "var(--mt-text)" }}>
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                                ${(item.finalPrice || 0).toFixed(2)} x {item.quantity}
                              </span>
                              {item.isPromotion && <Badge className="bg-red-500 text-white text-xs">PROMO</Badge>}
                            </div>
                            {item.specifications && (
                              <div className="mt-2">
                                <p className="text-xs mb-1" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                                  {tableT.t("common.specifications")}:
                                </p>
                                <Textarea
                                  value={item.specifications}
                                  onChange={(e) => updateCartItemSpecifications(item.id, e.target.value)}
                                  className="text-xs resize-none"
                                  style={{
                                    backgroundColor: "var(--mt-surface)",
                                    borderColor: "var(--mt-secondary)",
                                    color: "var(--mt-text)",
                                  }}
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="h-6 w-6 p-0"
                              style={{ color: "var(--mt-text)", opacity: 0.7 }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addToCart(item)}
                              className="h-6 w-6 p-0"
                              style={{ color: "var(--mt-text)", opacity: 0.7 }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right mt-2">
                          <span className="font-bold" style={{ color: "var(--mt-primary)" }}>
                            ${((item.finalPrice || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t pt-4 mt-auto" style={{ borderColor: "var(--mt-secondary)" }}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold" style={{ color: "var(--mt-text)" }}>
                      Total:
                    </span>
                    <span className="text-xl font-bold" style={{ color: "var(--mt-primary)" }}>
                      ${(getTotalPrice() || 0).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full text-white py-3 text-lg font-medium"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    {isSubmitting ? tableT.t("common.loading") : tableT.t("order.confirmOrder")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>

      <CustomerInfoModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onConfirm={handleCustomerInfoConfirm}
        tableNumber={tableNumber}
      />
    </Dialog>
  )
}
