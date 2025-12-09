export type Permission =
  | "orders.view"
  | "orders.manage"
  | "orders.delete"
  | "menu.view"
  | "menu.edit"
  | "menu.delete"
  | "customers.view"
  | "customers.edit"
  | "customers.export"
  | "analytics.view"
  | "analytics.advanced"
  | "analytics.export"
  | "staff.view"
  | "staff.manage"
  | "staff.delete"
  | "settings.view"
  | "settings.edit"
  | "settings.advanced"
  | "reservations.view"
  | "reservations.manage"
  | "reviews.view"
  | "reviews.respond"
  | "reviews.moderate"
  | "announcements.view"
  | "announcements.create"
  | "announcements.delete"
  | "themes.view"
  | "themes.edit"
  | "billing.view"
  | "billing.manage"

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystemRole: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  roleId: string
  barId: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  // Configuración de seguridad
  twoFactorEnabled: boolean
  sessionTimeout: number // en minutos
  allowedIPs?: string[]
}

export interface UserSession {
  id: string
  userId: string
  deviceInfo: string
  ipAddress: string
  userAgent: string
  createdAt: string
  expiresAt: string
  isActive: boolean
}

export interface SecurityLog {
  id: string
  userId?: string
  action: SecurityAction
  resource: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: "low" | "medium" | "high" | "critical"
}

export type SecurityAction =
  | "login"
  | "logout"
  | "failed_login"
  | "password_change"
  | "role_change"
  | "permission_grant"
  | "permission_revoke"
  | "data_export"
  | "sensitive_access"
  | "admin_action"
  | "suspicious_activity"
  | "rate_limit_exceeded"

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: "monthly" | "yearly"
  features: PlanFeature[]
  limits: PlanLimits
  isActive: boolean
}

export interface PlanFeature {
  key: string
  name: string
  description: string
  included: boolean
}

export interface PlanLimits {
  maxUsers: number
  maxTables: number
  maxMenuItems: number
  maxOrders: number // por mes
  maxStorage: number // en MB
  advancedAnalytics: boolean
  customThemes: boolean
  apiAccess: boolean
}

export interface BarSubscription {
  id: string
  barId: string
  planId: string
  status: "active" | "cancelled" | "past_due" | "trialing"
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

// Roles predefinidos del sistema
export const SYSTEM_ROLES: Omit<Role, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Super Admin",
    description: "Acceso completo a todas las funciones",
    permissions: [
      "orders.view",
      "orders.manage",
      "orders.delete",
      "menu.view",
      "menu.edit",
      "menu.delete",
      "customers.view",
      "customers.edit",
      "customers.export",
      "analytics.view",
      "analytics.advanced",
      "analytics.export",
      "staff.view",
      "staff.manage",
      "staff.delete",
      "settings.view",
      "settings.edit",
      "settings.advanced",
      "reservations.view",
      "reservations.manage",
      "reviews.view",
      "reviews.respond",
      "reviews.moderate",
      "announcements.view",
      "announcements.create",
      "announcements.delete",
      "themes.view",
      "themes.edit",
      "billing.view",
      "billing.manage",
    ],
    isSystemRole: true,
  },
  {
    name: "Manager",
    description: "Gestión completa del restaurante sin configuración avanzada",
    permissions: [
      "orders.view",
      "orders.manage",
      "menu.view",
      "menu.edit",
      "customers.view",
      "customers.edit",
      "customers.export",
      "analytics.view",
      "analytics.advanced",
      "analytics.export",
      "staff.view",
      "staff.manage",
      "settings.view",
      "settings.edit",
      "reservations.view",
      "reservations.manage",
      "reviews.view",
      "reviews.respond",
      "announcements.view",
      "announcements.create",
      "themes.view",
    ],
    isSystemRole: true,
  },
  {
    name: "Waiter",
    description: "Gestión de pedidos y atención al cliente",
    permissions: [
      "orders.view",
      "orders.manage",
      "menu.view",
      "customers.view",
      "reservations.view",
      "reservations.manage",
      "reviews.view",
    ],
    isSystemRole: true,
  },
  {
    name: "Kitchen Staff",
    description: "Visualización y gestión de pedidos de cocina",
    permissions: ["orders.view", "orders.manage", "menu.view"],
    isSystemRole: true,
  },
  {
    name: "Viewer",
    description: "Solo visualización de datos básicos",
    permissions: ["orders.view", "menu.view", "customers.view", "analytics.view"],
    isSystemRole: true,
  },
]
