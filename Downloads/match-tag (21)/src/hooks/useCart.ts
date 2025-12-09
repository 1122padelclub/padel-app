"use client"

import { useState } from "react"
import { ref, push, set } from "@/src/services/firebaseExtras"
import { realtimeDb } from "@/src/services/firebaseExtras"
import type { MenuItem, OrderItem } from "@/src/types"

export function useCart() {
  const [cartItems, setCartItems] = useState<OrderItem[]>([])

  const addToCart = (menuItem: MenuItem, quantity = 1, notes?: string) => {
    const existingItemIndex = cartItems.findIndex((item) => item.menuItemId === menuItem.id)

    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems]
      updatedItems[existingItemIndex].quantity += quantity
      if (notes) {
        updatedItems[existingItemIndex].notes = notes
      }
      setCartItems(updatedItems)
    } else {
      const newItem: OrderItem = {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        notes,
      }
      setCartItems([...cartItems, newItem])
    }
  }

  const removeFromCart = (menuItemId: string) => {
    setCartItems(cartItems.filter((item) => item.menuItemId !== menuItemId))
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId)
      return
    }

    setCartItems(cartItems.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const createOrder = async (barId: string, tableId: string) => {
    if (cartItems.length === 0) return null

    try {
      const orderData = {
        barId,
        tableId,
        items: cartItems,
        status: "pending",
        total: getTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Usar Realtime Database en lugar de Firestore
      const ordersRef = ref(realtimeDb, `orders/${barId}`)
      const newOrderRef = push(ordersRef)
      await set(newOrderRef, orderData)

      console.log("[v0] Pedido creado exitosamente en Realtime DB:", newOrderRef.key)
      clearCart()
      return newOrderRef.key
    } catch (error) {
      console.error("[v0] Error creating order:", error)
      return null
    }
  }

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    createOrder,
  }
}
