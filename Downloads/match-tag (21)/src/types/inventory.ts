// Tipos para el sistema de gestión de inventarios

export type UnitType = 'g' | 'kg' | 'ml' | 'l' | 'unidad' | 'oz' | 'lb'
export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'waste' | 'cancel' | 'transfer'
export type InventoryCategory = 'bebidas' | 'alimentos' | 'suministros' | 'limpieza' | 'otro'

export interface InventoryItem {
  id: string
  barId: string
  sku: string // Código único del producto
  name: string
  category: InventoryCategory
  baseUnit: UnitType // Unidad base para cálculos (g, ml, unidad)
  purchaseUnit: UnitType // Unidad en la que se compra
  purchaseToBaseMultiplier: number // Factor de conversión compra → base
  currentStockBase: number // Stock actual en unidad base
  minStockBase: number // Stock mínimo para alertas
  maxStockBase?: number // Stock máximo recomendado
  costPerBaseUnit: number // Costo por unidad base
  supplier?: string // Proveedor principal
  lotCode?: string // Código de lote actual
  expiryDate?: Date // Fecha de vencimiento
  notes?: string
  isActive: boolean
  lastRestockDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface RecipeComponent {
  id: string
  recipeId: string // ID de la receta (menuItemId)
  barId: string
  ingredientSku: string // SKU del insumo
  ingredientName: string // Nombre del insumo (cache)
  qtyPerItemBase: number // Cantidad por ítem vendido en unidad base
  wastePct: number // Porcentaje de desperdicio/merma (ej: 5%)
  costPerItem?: number // Costo calculado de este ingrediente por ítem
  
  // Especificación y opción a la que pertenece este ingrediente (opcional)
  // Si está vacío, el ingrediente se usa siempre (receta base)
  // Si está lleno, el ingrediente solo se usa cuando se selecciona esa opción
  forSpecification?: {
    specificationId: string
    specificationName: string
    optionId: string
    optionName: string
  }
  
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Recipe {
  id: string // Mismo que menuItemId
  barId: string
  menuItemId: string
  menuItemName: string
  menuItemSku?: string
  components: RecipeComponent[] // Lista de ingredientes
  totalCostPerItem: number // Costo total calculado
  lastCalculatedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface InventoryMovement {
  id: string
  barId: string
  itemId: string // ID del inventoryItem
  itemSku: string
  itemName: string
  type: MovementType
  quantityBase: number // Cantidad en unidad base (positivo = entrada, negativo = salida)
  costPerUnit?: number // Costo unitario en esta transacción
  totalCost?: number // Costo total del movimiento
  reason?: string // Razón del movimiento
  reference?: string // Referencia externa (ej: orderId, purchaseOrderId)
  lotCode?: string
  expiryDate?: Date
  performedBy?: string // UID del usuario que realizó el movimiento
  performedByName?: string
  notes?: string
  balanceAfter: number // Stock después del movimiento
  createdAt: Date
}

export interface InventoryAlert {
  id: string
  barId: string
  itemId: string
  itemSku: string
  itemName: string
  alertType: 'low_stock' | 'out_of_stock' | 'near_expiry' | 'expired'
  severity: 'low' | 'medium' | 'high' | 'critical'
  currentStock: number
  minStock?: number
  expiryDate?: Date
  message: string
  isResolved: boolean
  resolvedAt?: Date
  createdAt: Date
}

export interface StockAdjustment {
  itemId: string
  itemSku: string
  itemName: string
  currentStock: number
  newStock: number
  difference: number
  reason: string
  notes?: string
}

export interface ImportValidationError {
  row: number
  column: string
  value: any
  error: string
  severity: 'error' | 'warning'
}

export interface ImportPreview {
  totalRows: number
  validRows: number
  invalidRows: number
  errors: ImportValidationError[]
  warnings: ImportValidationError[]
  data: any[]
}

export interface InventoryConfig {
  barId: string
  defaultPurchaseUnit: UnitType
  defaultBaseUnit: UnitType
  defaultWastePct: number
  enableLowStockAlerts: boolean
  enableExpiryAlerts: boolean
  expiryAlertDays: number // Días antes del vencimiento para alertar
  autoDeductOnSale: boolean // Descuento automático al confirmar venta
  requireLotTracking: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CostAnalysis {
  menuItemId: string
  menuItemName: string
  salePrice: number
  totalCost: number
  margin: number // Margen en porcentaje
  marginAmount: number // Margen en dinero
  components: {
    ingredientName: string
    quantity: number
    unit: UnitType
    cost: number
    costPercentage: number
  }[]
}

export interface PurchaseOrder {
  id: string
  barId: string
  supplier: string
  orderDate: Date
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  status: 'draft' | 'sent' | 'received' | 'partial' | 'cancelled'
  items: PurchaseOrderItem[]
  totalCost: number
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseOrderItem {
  itemId: string
  itemSku: string
  itemName: string
  quantityOrdered: number
  quantityReceived?: number
  unit: UnitType
  costPerUnit: number
  totalCost: number
  lotCode?: string
  expiryDate?: Date
}

