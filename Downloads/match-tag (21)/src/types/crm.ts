export interface Customer {
  id: string
  barId: string
  name: string
  phone: string
  email?: string
  deviceId?: string
  visitsCount: number
  totalSpent: number
  lastVisitAt: string
  firstVisitAt: string
  averageOrderValue: number
  favoriteItems: string[] // item IDs
  notes?: string
  tags: string[] // VIP, Regular, etc.
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  barId: string
  customerId?: string
  orderId?: string
  tableId?: string
  stars: number // 1-5
  comment?: string
  categories: {
    food: number
    service: number
    ambiance: number
    value: number
  }
  isAnonymous: boolean
  customerName?: string
  response?: {
    message: string
    respondedAt: string
    respondedBy: string
  }
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: {
    minVisits?: number
    maxVisits?: number
    minSpent?: number
    maxSpent?: number
    lastVisitDays?: number
    tags?: string[]
  }
  customerCount: number
  createdAt: string
}

export interface CustomerStats {
  totalCustomers: number
  newCustomersThisMonth: number
  returningCustomers: number
  averageVisitsPerCustomer: number
  averageSpentPerCustomer: number
  topSpenders: Customer[]
  frequentVisitors: Customer[]
  averageRating: number
  totalReviews: number
  ratingDistribution: { [key: number]: number }
}
