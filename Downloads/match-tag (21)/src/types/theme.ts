export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  success: string
  warning: string
  danger: string
  menuBackground: string
  menuText: string
  categoryBorder: string
  categoryBackground: string
  headerOverlay: string
}

export interface ThemeTypography {
  baseFont: string
  scale: "small" | "medium" | "large"
  headerFont: string
  categoryFont: string
  priceFont: string
  bodyFont: string
}

export interface ThemeAssets {
  logoUrl?: string
  faviconUrl?: string
  backgroundImageUrl?: string
  backgroundVideoUrl?: string
  watermarkUrl?: string
  menuBackgroundUrl?: string
  headerBackgroundUrl?: string
  categoryIconsUrl?: string[]
}

export interface ThemeSoundPack {
  enabled: boolean
  chimeUrl?: string
}

export interface ThemeHaptics {
  enabled: boolean
}

export interface ThemeI18n {
  defaultLocale: string
  locales: string[]
  currency: string
  priceFormat: string
  serviceFeePct: number
  defaultTipPct: number
}

export interface EventSkinOverrides {
  colors?: Partial<ThemeColors>
  typography?: Partial<ThemeTypography>
  assets?: Partial<ThemeAssets>
  layoutPreset?: LayoutPreset
}

export interface EventSkin {
  start: string // ISO date
  end: string // ISO date
  overrides: EventSkinOverrides
}

export type LayoutPreset = "classic" | "glass" | "high-contrast" | "event-skin"
export type ThemeMode = "light" | "dark" | "auto"

export interface MenuCustomization {
  categoryStyle: "rounded" | "oval" | "square" | "custom"
  showCategoryImages: boolean
  categoryImagePosition: "left" | "right" | "background"
  headerStyle: "overlay" | "solid" | "transparent" | "gradient"
  menuLayout: "grid" | "list" | "cards" | "elegant"
  borderRadius: number
  shadowIntensity: "none" | "light" | "medium" | "strong"
  backgroundOpacity: number
}

export interface ThemeConfig {
  id?: string
  barId?: string
  mode?: ThemeMode
  colors: {
    background: string // fondo principal de la mesa
    surface: string // contenedores/cards/modals
    text: string // texto por defecto
    primary: string // CTA / énfasis / burbuja emisor
    secondary: string // bordes/resaltados/gradiente 2
    menuText?: string // texto sobre primary/surface si difiere
    success?: string
    danger?: string
  }
  typography?: ThemeTypography
  assets?: ThemeAssets
  layoutPreset?: LayoutPreset
  soundPack?: ThemeSoundPack
  haptics?: ThemeHaptics
  i18n?: ThemeI18n
  eventSkins?: EventSkin[]
  menuCustomization?: {
    borderRadius?: number // px
  }
  branding?: {
    restaurantName?: string
    tagline?: string
    showPoweredBy?: boolean
  }
  createdAt?: string
  updatedAt?: number
}

export const DEFAULT_THEME_CONFIG: Omit<ThemeConfig, "id" | "barId" | "createdAt" | "updatedAt"> = {
  mode: "dark",
  colors: {
    background: "#0B0B0B",
    surface: "#1C1C1C",
    text: "#FFFFFF",
    primary: "#0A84FF",
    secondary: "#252525",
    menuText: "#FFFFFF",
    success: "#34C759",
    danger: "#FF3B30",
  },
  typography: {
    baseFont: "Inter",
    scale: "medium",
    headerFont: "Dancing Script",
    categoryFont: "Dancing Script",
    priceFont: "Inter",
    bodyFont: "Inter",
  },
  assets: {},
  layoutPreset: "classic",
  soundPack: {
    enabled: false,
  },
  haptics: {
    enabled: true,
  },
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    currency: "EUR",
    priceFormat: "€{amount}",
    serviceFeePct: 0,
    defaultTipPct: 10,
  },
  eventSkins: [],
  menuCustomization: {
    borderRadius: 12,
  },
  branding: {
    restaurantName: "Mi Restaurante",
    tagline: "Menú Digital Personalizado",
    showPoweredBy: true,
  },
}
