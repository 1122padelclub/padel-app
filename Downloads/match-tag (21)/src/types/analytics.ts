export interface AdvancedAnalytics {
  // Métricas temporales
  peakHours: {
    hour: number
    orderCount: number
    revenue: number
  }[]

  // Análisis de productos
  productPerformance: {
    name: string
    revenue: number
    quantity: number
    profitMargin: number
    trendPercentage: number
    complementaryItems: string[]
  }[]

  // Métricas de clientes
  customerMetrics: {
    newCustomers: number
    returningCustomers: number
    customerLifetimeValue: number
    churnRate: number
    retentionRate: number
  }

  // Análisis operacional
  operationalMetrics: {
    averagePreparationTime: number
    orderFulfillmentRate: number
    tableUtilization: number
    staffEfficiency: number
  }

  // Comparativas
  periodComparison: {
    currentPeriod: PeriodMetrics
    previousPeriod: PeriodMetrics
    growthPercentage: number
  }

  // Predicciones
  forecasting: {
    predictedRevenue: number
    predictedOrders: number
    recommendedStaffing: number
    inventoryAlerts: string[]
  }
}

export interface PeriodMetrics {
  revenue: number
  orders: number
  averageOrderValue: number
  customerCount: number
  topProducts: string[]
}

export interface RealtimeMetrics {
  activeOrders: number
  waitingTime: number
  currentRevenue: number
  tablesOccupied: number
  staffOnDuty: number
}

export interface HeatmapData {
  hour: number
  day: string
  value: number
  type: "orders" | "revenue" | "customers"
}
