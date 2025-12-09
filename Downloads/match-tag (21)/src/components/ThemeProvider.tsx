"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { type ThemeConfig, DEFAULT_THEME_CONFIG } from "@/src/types/theme"
import { useThemeConfig } from "@/src/hooks/useThemeConfig"
import { ThemeVars } from "@/src/components/ThemeVars"

interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (theme: Partial<ThemeConfig>) => void
  applyTheme: (theme: ThemeConfig) => void
  resetTheme: () => void
  saveTheme: () => Promise<void>
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  barId?: string
  defaultTheme?: Partial<ThemeConfig>
}

export function ThemeProvider({ children, barId, defaultTheme }: ThemeProviderProps) {
  const pathname = usePathname()
  const isTableRoute = pathname?.includes("/mesa") || false

  const [theme, setThemeState] = useState<ThemeConfig>({
    ...DEFAULT_THEME_CONFIG,
    ...defaultTheme,
    barId: barId || "default",
  })

  const { themeConfig, updateThemeConfig, isLoading } = useThemeConfig(barId)

  useEffect(() => {
    if (themeConfig && themeConfig !== theme) {
      setThemeState(themeConfig)
    }
  }, [themeConfig, theme])

  const applyTheme = (themeConfig: ThemeConfig) => {
    if (!isTableRoute) return

    if (!themeConfig || !themeConfig.colors) {
      console.warn("[v0] ThemeConfig o colors es undefined, usando valores por defecto")
      return
    }

    const root = document.documentElement

    root.style.setProperty("--mt-bg", themeConfig.colors.background || "#0b234a")
    root.style.setProperty("--mt-surface", themeConfig.colors.surface || "rgba(0,0,0,0.35)")
    root.style.setProperty("--mt-text", themeConfig.colors.text || "#e5e7eb")
    root.style.setProperty("--mt-primary", themeConfig.colors.primary || "#0d1b2a")
    root.style.setProperty("--mt-secondary", themeConfig.colors.secondary || "#1f2937")
    root.style.setProperty("--mt-menutext", themeConfig.colors.menuText || themeConfig.colors.text || "#ffffff")

    // Apply typography
    if (themeConfig.typography?.scale) {
      const fontScale = {
        small: "0.875rem",
        medium: "1rem",
        large: "1.125rem",
      }
      root.style.setProperty("--font-size-base", fontScale[themeConfig.typography.scale])
    }

    // Apply specific fonts
    if (themeConfig.typography?.headerFont) {
      root.style.setProperty("--font-header", themeConfig.typography.headerFont)
    }
    if (themeConfig.typography?.bodyFont) {
      root.style.setProperty("--font-body", themeConfig.typography.bodyFont)
    }
    if (themeConfig.typography?.buttonFont) {
      root.style.setProperty("--font-button", themeConfig.typography.buttonFont)
    }

    // Apply layout preset classes
    document.body.className = document.body.className.replace(/layout-\w+/g, "")
    if (themeConfig.layoutPreset) {
      document.body.classList.add(`layout-${themeConfig.layoutPreset}`)
    }

    // Apply theme mode
    if (themeConfig.mode) {
      document.documentElement.classList.toggle("dark", themeConfig.mode === "dark")
      document.documentElement.classList.toggle("light", themeConfig.mode === "light")
    }

    // Apply background assets
    if (themeConfig.assets?.backgroundImageUrl) {
      root.style.setProperty("--bg-image", `url(${themeConfig.assets.backgroundImageUrl})`)
    }

    // Log removido para evitar bucle infinito
  }

  const setTheme = (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates, updatedAt: Date.now() }
    setThemeState(newTheme)
    console.log("[v0] Tema actualizado localmente:", updates)
  }

  const saveTheme = async () => {
    if (barId && updateThemeConfig) {
      console.log("[v0] Guardando tema en Firebase:", theme)
      await updateThemeConfig(theme)
      console.log("[v0] Tema guardado exitosamente")
    }
  }

  const resetTheme = () => {
    const defaultTheme = {
      ...DEFAULT_THEME_CONFIG,
      barId: barId || "default",
      updatedAt: Date.now(),
    }
    setThemeState(defaultTheme)
    if (isTableRoute) {
      applyTheme(defaultTheme)
    }
  }

  useEffect(() => {
    if (themeConfig && isTableRoute) {
    applyTheme(themeConfig)
    }
  }, [themeConfig, isTableRoute])

  useEffect(() => {
    if (theme.mode === "auto" && isTableRoute) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => {
        document.documentElement.classList.toggle("dark", mediaQuery.matches)
        document.documentElement.classList.toggle("light", !mediaQuery.matches)
      }

      handleChange()
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme.mode, isTableRoute])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyTheme, resetTheme, saveTheme, isLoading }}>
      {isTableRoute && <ThemeVars themeConfig={themeConfig} />}
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
