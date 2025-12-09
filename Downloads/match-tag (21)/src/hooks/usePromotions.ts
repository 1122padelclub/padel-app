"use client"

import { useState, useEffect } from "react"
import { collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import type { Promotion, OrderItem } from "@/src/types/menu"

export function usePromotions(barId?: string) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setIsLoading(false)
      return
    }

    const promotionsQuery = query(
      collection(db, `bars/${barId}/promotions`),
      orderBy("priority", "desc"),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(
      promotionsQuery,
      (snapshot) => {
        const promotionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Promotion[]

        setPromotions(promotionsList)

        // Filter active promotions
        const now = new Date()
        const active = promotionsList.filter((promo) => {
          if (!promo.isActive) return false

          const startDate = new Date(promo.schedule.start)
          const endDate = new Date(promo.schedule.end)

          if (now < startDate || now > endDate) return false

          // Check weekdays if specified
          if (promo.schedule.weekdays && promo.schedule.weekdays.length > 0) {
            const currentDay = now.getDay()
            if (!promo.schedule.weekdays.includes(currentDay)) return false
          }

          // Check hours if specified
          if (promo.schedule.hours && promo.schedule.hours.length > 0) {
            const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
            const isInTimeRange = promo.schedule.hours.some(
              (timeRange) => currentTime >= timeRange.start && currentTime <= timeRange.end,
            )
            if (!isInTimeRange) return false
          }

          return true
        })

        setActivePromotions(active)
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Error loading promotions:", err)
        setError(err.message)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [barId])

  const createPromotion = async (
    promotionData: Omit<Promotion, "id" | "barId" | "usageCount" | "createdAt" | "updatedAt">,
  ) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const newPromotion = {
        ...promotionData,
        barId,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, `bars/${barId}/promotions`), newPromotion)
      return docRef.id
    } catch (err) {
      console.error("Error creating promotion:", err)
      throw err
    }
  }

  const updatePromotion = async (promotionId: string, updates: Partial<Promotion>) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const promotionRef = doc(db, `bars/${barId}/promotions/${promotionId}`)
      await updateDoc(promotionRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Error updating promotion:", err)
      throw err
    }
  }

  const deletePromotion = async (promotionId: string) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      await deleteDoc(doc(db, `bars/${barId}/promotions/${promotionId}`))
    } catch (err) {
      console.error("Error deleting promotion:", err)
      throw err
    }
  }

  const calculatePromotionDiscount = (orderItems: OrderItem[], promotion: Promotion): number => {
    // Check if promotion conditions are met
    const { conditions, reward } = promotion

    let eligibleItems = orderItems

    // Filter by item IDs if specified
    if (conditions.itemIds && conditions.itemIds.length > 0) {
      eligibleItems = eligibleItems.filter((item) => conditions.itemIds!.includes(item.menuItemId))
    }

    // Filter by category IDs if specified
    if (conditions.categoryIds && conditions.categoryIds.length > 0) {
      eligibleItems = eligibleItems.filter((item) => conditions.categoryIds!.includes(item.menuItem.categoryId))
    }

    // Check minimum quantity
    if (conditions.minQty) {
      const totalQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0)
      if (totalQty < conditions.minQty) return 0
    }

    // Check minimum amount
    if (conditions.minAmount) {
      const totalAmount = eligibleItems.reduce((sum, item) => sum + item.totalPrice, 0)
      if (totalAmount < conditions.minAmount) return 0
    }

    // Calculate discount based on reward type
    switch (reward.type) {
      case "DISCOUNT":
        const eligibleAmount = eligibleItems.reduce((sum, item) => sum + item.totalPrice, 0)
        if (reward.pctOff) {
          return eligibleAmount * (reward.pctOff / 100)
        }
        if (reward.amountOff) {
          return Math.min(reward.amountOff, eligibleAmount)
        }
        break

      case "2x1":
        if (reward.x && reward.y) {
          const totalQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0)
          const freeItems = Math.floor(totalQty / reward.x) * reward.y
          const avgPrice = eligibleItems.reduce((sum, item) => sum + item.totalPrice, 0) / totalQty
          return freeItems * avgPrice
        }
        break

      case "HAPPY_HOUR":
        if (reward.pctOff) {
          const eligibleAmount = eligibleItems.reduce((sum, item) => sum + item.totalPrice, 0)
          return eligibleAmount * (reward.pctOff / 100)
        }
        break
    }

    return 0
  }

  const getApplicablePromotions = (orderItems: OrderItem[]): Promotion[] => {
    return activePromotions
      .filter((promotion) => {
        const discount = calculatePromotionDiscount(orderItems, promotion)
        return discount > 0
      })
      .sort((a, b) => b.priority - a.priority)
  }

  return {
    promotions,
    activePromotions,
    isLoading,
    error,
    createPromotion,
    updatePromotion,
    deletePromotion,
    calculatePromotionDiscount,
    getApplicablePromotions,
  }
}
