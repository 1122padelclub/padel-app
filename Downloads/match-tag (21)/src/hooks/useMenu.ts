"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, type Unsubscribe } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { MenuItem, MenuCategory } from "@/src/types"

export function useMenu(barId: string) {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!barId) return

    const unsubscribes: Unsubscribe[] = []

    const categoriesRef = collection(db, "bars", barId, "menuCategories")
    const categoriesQuery = query(categoriesRef, orderBy("order", "asc"))

    const unsubscribeCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const fetchedCategories: MenuCategory[] = []
        snapshot.forEach((doc) => {
          fetchedCategories.push({
            id: doc.id,
            ...doc.data(),
          } as MenuCategory)
        })
        setCategories(fetchedCategories)
        console.log("[v0] Categories updated:", fetchedCategories.length)
      },
      (error) => {
        console.error("[v0] Error listening to categories:", error)
      },
    )

    const itemsRef = collection(db, "bars", barId, "menuItems")
    const itemsQuery = query(itemsRef, orderBy("name", "asc"))

    const unsubscribeItems = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const fetchedItems: MenuItem[] = []
        snapshot.forEach((doc) => {
          fetchedItems.push({
            id: doc.id,
            ...doc.data(),
          } as MenuItem)
        })
        setItems(fetchedItems)
        setLoading(false)
        console.log("[v0] Items updated:", fetchedItems.length)
      },
      (error) => {
        console.error("[v0] Error listening to items:", error)
        setLoading(false)
      },
    )

    unsubscribes.push(unsubscribeCategories, unsubscribeItems)

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [barId])

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => item.categoryId === categoryId)
  }

  const refetch = () => {
    console.log("[v0] Refetch called - using real-time listeners, no manual refetch needed")
  }

  return {
    categories,
    items,
    loading,
    getItemsByCategory,
    refetch,
  }
}
