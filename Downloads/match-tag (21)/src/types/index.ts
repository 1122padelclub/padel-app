export interface User {
  uid: string
  email?: string
  role: "super_admin" | "bar_admin" | "guest"
  barId?: string
  createdAt: Date
}

export interface Bar {
  id: string
  name: string
  address: string
  adminIds: string[]
  isActive: boolean
  createdAt: Date
  // Configuración de emails
  emailConfig?: {
    businessName: string
    businessAddress: string
    contactPhone: string
    contactEmail?: string
    businessHours?: string
    policies?: string
  }
}

export interface CustomButton {
  id: string
  label: string
  url: string
  icon?: string
  type: "social" | "website" | "phone" | "email" | "custom"
  color?: string
  backgroundColor?: string
  isActive: boolean
  order: number
}

export interface ButtonConfiguration {
  buttons: CustomButton[]
  showButtons: boolean
  buttonStyle: {
    layout: "horizontal" | "vertical" | "grid"
    size: "small" | "medium" | "large"
    spacing: "tight" | "normal" | "loose"
  }
}

export interface Table {
  id: string
  barId: string
  number: number | string // Cambiado para permitir "PRUEBA"
  capacity?: number // Agregado campo capacity para reservas
  isActive: boolean
  isOccupied?: boolean // Agregado campo para ocupación manual
  occupiedBy?: string // Agregado campo opcional para identificar quién ocupa la mesa
  occupiedAt?: Date // Agregado campo para timestamp de ocupación
  password?: string // Agregado campo opcional para contraseña de mesa
  isTestTable?: boolean // Agregado campo para identificar mesa de prueba
  customization?: {
    backgroundColor?: string
    textColor?: string
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    fontFamily?: string
    borderRadius?: string
    backgroundImage?: string
    backgroundOpacity?: number
  }
  createdAt: Date
}

export interface MenuItemSpecification {
  id: string
  name: string
  type: "single" | "multiple"
  required: boolean
  minSelections: number
  maxSelections: number
  options: {
    id: string
    name: string
    priceModifier?: number
  }[]
}

export interface MenuItem {
  id: string
  barId: string
  categoryId: string
  name: string
  description?: string
  price: number
  isAvailable: boolean
  imageUrl?: string
  promotion?: string
  promotionPrice?: number
  specifications?: MenuItemSpecification[]
  // Badges
  isRecommended?: boolean
  isNew?: boolean
  isSpicy?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
}

export interface MenuCategory {
  id: string
  barId: string
  name: string
  order: number
}

export interface Order {
  id: string
  barId: string
  tableId: string
  tableNumber: number // agregado número de mesa destino
  senderTableId?: string // agregado ID de mesa origen
  senderTableNumber?: number // agregado número de mesa origen
  customerName?: string // Added customer information fields
  customerPhone?: string // Added customer information fields
  accountType?: "shared" | "individual" // Added customer information fields
  items: OrderItem[]
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  total: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItemSpecification {
  specificationId: string
  specificationName: string
  selectedOptions: {
    optionId: string
    optionName: string
    priceModifier?: number
  }[]
}

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  promotionPrice?: number
  quantity: number
  notes?: string
  specifications?: OrderItemSpecification[]
}

export interface Message {
  id: string
  chatId: string // Combinación de tableIds ordenados: "table1-table2"
  barId: string
  type: "text" | "gif" | "order"
  text: string
  orderId?: string
  senderTable: string // Mesa que envía el mensaje
  senderTableNumber: number // Número de mesa que envía
  senderId: string // ID del usuario que envía
  timestamp: Date
  createdAt: Date
}

export interface TableChat {
  id: string // Combinación de tableIds: "table1-table2"
  barId: string
  tableIds: string[] // IDs de las dos mesas
  tableNumbers: number[] // Números de las dos mesas
  lastMessage?: string
  lastMessageAt?: Date
  isActive: boolean
  createdAt: Date
}

export interface WaiterCall {
  id: string
  barId: string
  tableId: string
  tableNumber: number
  message?: string
  status: "pending" | "attending" | "resolved"
  createdAt: Date
  updatedAt: Date
}

export interface BarConfiguration {
  id: string
  barId: string
  name: string
  address: string
  phone: string
  email: string
  website?: string
  openingHours: {
    [key: string]: { open: string; close: string } | null
  }
  features: {
    chatEnabled: boolean
    ordersEnabled: boolean
    reservationsEnabled: boolean
    waiterCallsEnabled: boolean
    crmEnabled: boolean
    announcementsEnabled: boolean
    generalChatEnabled: boolean
  }
  notifications: {
    newOrderSound: boolean
    newOrderNotification: boolean
    newReservationNotification: boolean
    newWaiterCallNotification: boolean
  }
  theme: {
    primaryColor: string
    secondaryColor: string
    logoUrl?: string
    backgroundImageUrl?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface ThemeConfig {
  id: string
  barId: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    surface: string
    menuText: string
    success: string
    danger: string
  }
  typography: {
    fontFamily: string
    fontSize: string
    fontWeight: string
  }
  assets: {
    logoUrl?: string
    backgroundImageUrl?: string
    faviconUrl?: string
  }
  branding: {
    restaurantName: string
    tagline?: string
    description?: string
    contactInfo?: string
  }
  menuCustomization: {
    borderRadius: number
    cardStyle: string
    layout: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface ServiceRating {
  id: string
  barId: string
  tableId: string
  tableNumber: number
  rating: number
  comment?: string
  anonymous: boolean
  customerData?: {
    name?: string
    email?: string
    phone?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Reservation {
  id: string
  barId: string
  tableId: string | null
  tableNumber: number | string
  customerName: string
  customerPhone: string
  customerEmail?: string
  partySize: number
  reservationDate: Date
  reservationTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  specialRequests?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ReservationConfig {
  barId: string
  openingTime: string // "09:00"
  closingTime: string // "23:00"
  slotDuration: number // minutos entre slots (ej: 30)
  maxPartySize: number
  minPartySize: number
  advanceBookingDays: number // días de anticipación máxima
  advanceBookingHours: number // horas de anticipación mínima
  isActive: boolean
  reservationDurationMinutes: number // duración de cada reserva en minutos
  specialHours?: {
    [dayOfWeek: string]: {
      openingTime: string
      closingTime: string
    }
  }
  // Horarios de funcionamiento del bar
  businessHours: {
    [day: string]: {
      isOpen: boolean
      openingTime: string
      closingTime: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

// Tipos para el menú de exhibición
export interface DisplayMenuConfig {
  id: string
  barId: string
  isActive: boolean
  title: string
  subtitle?: string
  backgroundImage?: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  headerFont: string
  bodyFont: string
  titleFont: string
  layout: "classic" | "modern" | "minimal" | "elegant"
  showImages: boolean
  imageSize: "small" | "medium" | "large" | "hero"
  imageStyle: "rounded" | "square" | "circle" | "none"
  showPrices: boolean
  showDescriptions: boolean
  showBadges: boolean
  badgeStyle: "rounded" | "square" | "pill"
  badgeColor: string
  categoryStyle: {
    showBorders: boolean
    borderStyle: "solid" | "dashed" | "double" | "none"
    borderColor: string
    backgroundColor: string
    textColor: string
    fontSize: "small" | "medium" | "large" | "xlarge"
    fontWeight: "normal" | "semibold" | "bold"
    textAlign: "left" | "center" | "right"
    padding: "small" | "medium" | "large"
  }
  itemStyle: {
    showBorders: boolean
    borderStyle: "solid" | "dashed" | "dotted" | "none"
    borderColor: string
    backgroundColor: string
    textColor: string
    nameColor: string
    descriptionColor: string
    priceColor: string
    fontSize: "small" | "medium" | "large"
    nameFontSize: "small" | "medium" | "large" | "xlarge"
    nameFontWeight: "normal" | "semibold" | "bold"
    spacing: "tight" | "normal" | "loose"
  }
  decorations: {
    showDivider: boolean
    dividerStyle: "line" | "dots" | "dashes" | "none"
    dividerColor: string
    showShadows: boolean
    shadowColor: string
    showGradients: boolean
    gradientColors: string[]
  }
  socialLinks: {
    showSocialLinks: boolean
    facebook?: string
    instagram?: string
    whatsapp?: string
    website?: string
    phone?: string
    email?: string
  }
  featuredItems: {
    [categoryId: string]: string // categoryId -> itemId del item destacado
  }
  heroImage?: string // Imagen hero personalizada para reemplazar items destacados
  heroTitle?: string // Título para la imagen hero
  heroSubtitle?: string // Subtítulo para la imagen hero
  showHeroImage: boolean // Mostrar imagen hero en lugar de items destacados
  headerButtons: {
    leftButton: {
      text: string
      url: string
      isVisible: boolean
    }
    rightButton: {
      text: string
      url: string
      isVisible: boolean
    }
  }
  modalStyle: {
    titleColor: string
    textColor: string
    priceColor: string
    descriptionColor: string
  }
  titleStyle: {
    titleColor: string
    subtitleColor: string
    backgroundColor: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface DisplayMenuCategory {
  id: string
  barId: string
  name: string
  description?: string
  imageUrl?: string
  isVisible: boolean
  order: number
  style?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
  }
}

export interface DisplayMenuItem {
  id: string
  barId: string
  categoryId: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  isVisible: boolean
  isNew?: boolean
  isRecommended?: boolean
  isSpicy?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  order: number
  style?: {
    backgroundColor?: string
    textColor?: string
    nameColor?: string
    priceColor?: string
  }
}

// Tipos para CRM
export interface Review {
  id: string
  barId: string
  tableId?: string
  tableNumber?: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  rating: number // 1-5 estrellas
  comment?: string
  response?: string
  responseDate?: Date
  status: "active" | "hidden" | "deleted"
  createdAt: Date
}

export interface Order {
  id: string
  barId: string
  tableId: string
  tableNumber: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  accountType: "individual" | "group" | "corporate"
  notes?: string
  createdAt: Date
  updatedAt?: Date
}

export interface OrderItem {
  id: string
  name: string
  description?: string
  price: number
  promotionPrice?: number
  quantity: number
  category?: string
  imageUrl?: string
  notes?: string
}

export interface Reservation {
  id: string
  barId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  reservationDate: Date
  reservationTime: string // Formato "HH:MM"
  time?: string // Formato "HH:MM" - campo legacy
  status: "pending" | "confirmed" | "cancelled" | "no_show" | "completed"
  notes?: string
  tableNumber?: number | string
  tableId?: string | null
  assignedTable?: string
  cancellationReason?: string
  cancelledAt?: Date
  createdAt: Date
}

// Tipos para Reportes Programados
export interface ReportSchedule {
  id: string
  barId: string
  name: string
  description?: string
  frequency: "daily" | "weekly" | "monthly"
  dataPeriod: "day" | "week" | "month" // Período de datos para ingresos y pedidos
  time: string // Formato "HH:MM" en UTC
  dayOfWeek?: number // 0-6 para reportes semanales
  dayOfMonth?: number // 1-31 para reportes mensuales
  recipients: string[] // Lista de emails
  reportTypes: ReportType[]
  isActive: boolean
  lastSent?: Date
  nextScheduled?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ReportType {
  type: "reviews" | "orders" | "reservations" | "consolidated"
  includeCharts: boolean
  includeRawData: boolean
  filters?: {
    timeRange?: "week" | "month" | "quarter" | "year"
    status?: string[]
    customDateRange?: {
      start: Date
      end: Date
    }
  }
}

export interface EmailReport {
  id: string
  scheduleId: string
  barId: string
  sentAt: Date
  recipients: string[]
  reportTypes: ReportType[]
  status: "pending" | "sent" | "failed"
  errorMessage?: string
  attachments: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  contentType: string
  data: string // Base64 encoded data
  size: number
}

export interface ReportData {
  reviews: Review[]
  orders: Order[]
  reservations: Reservation[]
  period: {
    start: Date
    end: Date
    label: string
  }
  summary: {
    totalReviews: number
    averageRating: number
    totalOrders: number
    totalRevenue: number
    totalReservations: number
    confirmationRate: number
  }
}

// Tipos para Anuncios
export interface Announcement {
  id: string
  barId: string
  title: string
  description?: string
  imageUrl: string
  isActive: boolean
  order: number
  showOnMenu: boolean
  showOnTable: boolean
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Tipos para Chat General
export interface GeneralChatMessage {
  id: string
  barId: string
  userId: string
  username: string
  isAnonymous: boolean
  tableNumber?: number
  avatar?: string
  message: string
  type: "text" | "system" | "admin"
  timestamp: Date
  createdAt: Date
}

export interface GeneralChatUser {
  id: string
  barId: string
  tableId: string
  tableNumber: number
  username: string
  isAnonymous: boolean
  avatar?: string
  joinedAt: Date
  lastActive: Date
}

export interface BannedChatUser {
  id: string
  barId: string
  tableId?: string
  tableNumber?: number
  username: string
  avatar?: string
  reason?: string
  bannedAt: Date
  bannedBy: string
}
