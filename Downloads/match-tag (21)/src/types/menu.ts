export interface MenuCategory {
  id: string
  barId: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Modifier {
  id: string
  name: string
  priceAdjustment: number // Can be positive or negative
  isRequired: boolean
  maxSelections?: number // For multi-select modifiers
  createdAt: string
  updatedAt: string
}

export interface ModifierGroup {
  id: string
  barId: string
  name: string
  description?: string
  isRequired: boolean
  allowMultiple: boolean
  minSelections: number
  maxSelections: number
  modifiers: Modifier[]
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: string
  barId: string
  categoryId: string
  name: string
  description?: string
  basePrice: number
  imageUrl?: string
  badges: string[] // "Popular", "Spicy", "Vegetarian", etc.
  allergens: string[]
  isAlcoholic: boolean
  modifierGroupIds: string[]
  availability: {
    hours?: { start: string; end: string }[]
    weekdays?: number[] // 0-6, Sunday = 0
    stock?: number
    hideWhenOut: boolean
  }
  promotionIds: string[]
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
  preparationTime?: number // minutes
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type PromotionType = "HAPPY_HOUR" | "BUNDLE" | "2x1" | "DISCOUNT" | "FREE_ITEM"

export interface PromotionCondition {
  minQty?: number
  itemIds?: string[]
  categoryIds?: string[]
  minAmount?: number
  timeRange?: { start: string; end: string }
  weekdays?: number[]
}

export interface PromotionReward {
  type: PromotionType
  pctOff?: number // Percentage discount
  amountOff?: number // Fixed amount discount
  freeItemId?: string
  bundleItems?: { itemId: string; quantity: number }[]
  x?: number // For 2x1 promotions (buy X)
  y?: number // For 2x1 promotions (get Y)
}

export interface Promotion {
  id: string
  barId: string
  name: string
  description: string
  type: PromotionType
  isActive: boolean
  schedule: {
    start: string // ISO date
    end: string // ISO date
    weekdays?: number[]
    hours?: { start: string; end: string }[]
  }
  conditions: PromotionCondition
  reward: PromotionReward
  usageLimit?: number
  usageCount: number
  priority: number
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  basePrice: number
  selectedModifiers: {
    groupId: string
    groupName: string
    modifiers: {
      id: string
      name: string
      priceAdjustment: number
    }[]
  }[]
  appliedPromotions: {
    promotionId: string
    promotionName: string
    discount: number
  }[]
  totalPrice: number
  specialInstructions?: string
}

export interface Order {
  id: string
  barId: string
  tableId?: string
  customerId?: string
  channel: "table" | "pickup" | "delivery"
  items: OrderItem[]
  subtotal: number
  promotionDiscounts: number
  serviceCharge: number
  totalAmount: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  notes?: string
  estimatedTime?: number
  createdAt: string
  updatedAt: string
}
