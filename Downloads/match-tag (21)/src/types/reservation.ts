export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no-show"

export interface ReservationCustomer {
  name: string
  phone: string
  email?: string
  notes?: string
}

export interface Reservation {
  id?: string
  barId?: string
  tableId: string | null // null hasta asignación automática
  tableNumber?: number
  partySize: number
  startAt: Date | any // Timestamp de Firestore
  endAt: Date | any // Timestamp de Firestore
  customerName: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
  status: ReservationStatus
  source: "admin" | "web"
  createdAt?: Date | any
  updatedAt?: Date | any
  confirmedAt?: Date | any
  cancelledAt?: Date | any
  cancelReason?: string

  // Campos legacy para compatibilidad
  date?: Date | string
  time?: string
  guestCount?: number
  customer?: ReservationCustomer
}

export interface ReservationSiteConfig {
  logoUrl?: string
  backgroundUrl?: string
  heroTitle?: string
  heroSubtitle?: string
  colorPrimary?: string
  slug?: string // opcional: si no, usar /reservar/[barId]
  policies?: string // texto de políticas
  contactInfo?: {
    address?: string
    phone?: string
    email?: string
  }
  openingHours?: {
    [day: string]: { open: string; close: string } | null
  }
}

export interface Table {
  id?: string
  number: number
  name?: string
  capacity: number
  state: "available" | "reserved" | "occupied"
  active: boolean
  currentReservationId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface TimeSlot {
  time: string
  datetime: Date
  available: boolean
  availableTablesCount: number
  suggestedTable: Table | null
}

export interface ReservationSettings {
  barId: string
  openingHours: {
    [day: string]: { open: string; close: string } | null
  }
  slotDuration: number
  maxAdvanceBooking: number
  minAdvanceBooking: number
  maxPartySize: number
  requireConfirmation: boolean
  allowOnlineBooking: boolean
  createdAt: string
  updatedAt: string
}

export const DEFAULT_RESERVATION_SETTINGS: Omit<ReservationSettings, "barId" | "createdAt" | "updatedAt"> = {
  openingHours: {
    monday: { open: "12:00", close: "23:00" },
    tuesday: { open: "12:00", close: "23:00" },
    wednesday: { open: "12:00", close: "23:00" },
    thursday: { open: "12:00", close: "23:00" },
    friday: { open: "12:00", close: "24:00" },
    saturday: { open: "12:00", close: "24:00" },
    sunday: { open: "12:00", close: "23:00" },
  },
  slotDuration: 30,
  maxAdvanceBooking: 30,
  minAdvanceBooking: 2,
  maxPartySize: 12,
  requireConfirmation: false, // Confirmación automática para web
  allowOnlineBooking: true,
}
