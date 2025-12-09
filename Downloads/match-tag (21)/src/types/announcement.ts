export type AnnouncementType = "promo" | "event" | "happyhour" | "news" | "alert"
export type DisplayType = "banner" | "modal" | "pinned" | "toast"

export interface Announcement {
  id: string
  barId: string
  title: string
  message: string
  type: AnnouncementType
  display: DisplayType
  isActive: boolean
  start: string // ISO date
  end: string // ISO date
  targetAudience?: {
    customerSegments?: string[]
    tableIds?: string[]
    minVisits?: number
    tags?: string[]
  }
  styling?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
    icon?: string
  }
  actions?: {
    buttonText?: string
    buttonUrl?: string
    buttonAction?: "redirect" | "order" | "reservation"
  }
  priority: number // 1-10, higher = more important
  impressions: number
  clicks: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface AnnouncementStats {
  totalAnnouncements: number
  activeAnnouncements: number
  totalImpressions: number
  totalClicks: number
  clickThroughRate: number
  topPerformingAnnouncements: Announcement[]
}

export const DEFAULT_ANNOUNCEMENT_STYLING = {
  promo: {
    backgroundColor: "#FF6B35",
    textColor: "#FFFFFF",
    borderColor: "#FF6B35",
    icon: "🎉",
  },
  event: {
    backgroundColor: "#6366F1",
    textColor: "#FFFFFF",
    borderColor: "#6366F1",
    icon: "📅",
  },
  happyhour: {
    backgroundColor: "#F59E0B",
    textColor: "#FFFFFF",
    borderColor: "#F59E0B",
    icon: "🍻",
  },
  news: {
    backgroundColor: "#10B981",
    textColor: "#FFFFFF",
    borderColor: "#10B981",
    icon: "📢",
  },
  alert: {
    backgroundColor: "#EF4444",
    textColor: "#FFFFFF",
    borderColor: "#EF4444",
    icon: "⚠️",
  },
}
