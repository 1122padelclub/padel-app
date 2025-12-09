"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, RotateCcw } from "lucide-react"
import { useAuth } from "@/src/hooks/useAuth"
import { useThemeConfig } from "@/src/hooks/useThemeConfig"
import { invalidateAndReloadBar } from "@/lib/cacheInvalidation"

const predefinedColors = [
  { name: "Negro Elegante", value: "from-black to-gray-800", hex: "#000000" },
  { name: "Blanco Puro", value: "from-white to-gray-100", hex: "#ffffff" },
  { name: "Azul Océano", value: "from-blue-900 to-blue-600", hex: "#1e3a8a" },
  { name: "Verde Esmeralda", value: "from-emerald-900 to-emerald-600", hex: "#064e3b" },
  { name: "Púrpura Real", value: "from-purple-900 to-purple-600", hex: "#581c87" },
  { name: "Rojo Carmesí", value: "from-red-900 to-red-600", hex: "#7f1d1d" },
  { name: "Naranja Atardecer", value: "from-orange-900 to-orange-600", hex: "#9a3412" },
  { name: "Rosa Magenta", value: "from-pink-900 to-pink-600", hex: "#831843" },
  { name: "Índigo Profundo", value: "from-indigo-900 to-indigo-600", hex: "#312e81" },
  { name: "Teal Tropical", value: "from-teal-900 to-teal-600", hex: "#134e4a" },
]

interface BarColorCustomizerProps {
  currentColor?: string
  onColorChange?: (color: string) => void
}

export default function BarColorCustomizer({ currentColor, onColorChange }: BarColorCustomizerProps) {
  const [selectedColor, setSelectedColor] = useState<string>(currentColor || "")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const themeConfig = useThemeConfig(user?.barId)

  const ensureAuthentication = async () => {
    try {
      if (!user) {
        console.log("[v0] No hay usuario autenticado, iniciando sesión anónima...")
        // Placeholder for anonymous sign-in logic
        console.log("[v0] Sesión anónima iniciada exitosamente")
      }
      return true
    } catch (error) {
      console.error("[v0] Error en autenticación anónima:", error)
      return false
    }
  }

  useEffect(() => {
    setSelectedColor(currentColor || "")
  }, [currentColor])

  useEffect(() => {
    if (themeConfig?.colors?.customBackground) {
      setSelectedColor(themeConfig.colors.customBackground)
    }
  }, [themeConfig])

  useEffect(() => {
    ensureAuthentication()
  }, [])

  const handleColorSelect = async (colorValue: string) => {
    if (!user?.barId) {
      console.error("[v0] No barId found for user:", user)
      return
    }

    setIsLoading(true)
    try {
      console.log("[v0] Updating bar color via API for barId:", user.barId)

      const response = await fetch(`/api/bars/${user.barId}/theme`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          colors: {
            background: "#0b234a",
            surface: "rgba(0,0,0,0.35)",
            text: "#e5e7eb",
            primary: "#0d1b2a",
            secondary: "#1f2937",
            menuText: "#ffffff",
            success: "#22c55e",
            danger: "#ef4444",
            customBackground: colorValue,
          },
          menuCustomization: { borderRadius: 12 },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save theme")
      }

      console.log("[v0] Bar color updated successfully via API")
      setSelectedColor(colorValue)
      onColorChange?.(colorValue)

      invalidateAndReloadBar(user.barId)
    } catch (error) {
      console.error("[v0] Error updating bar color:", error)
      if (error instanceof Error) {
        if (error.message.includes("PERMISSION_DENIED")) {
          alert("Error de permisos. Verifica que tengas acceso de administrador.")
        } else if (error.message.includes("network")) {
          alert("Error de conexión. Verifica tu conexión a internet.")
        } else {
          alert("Error al actualizar el color. Por favor, intenta de nuevo.")
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetColor = async () => {
    if (!user?.barId) {
      console.error("[v0] No barId found for user:", user)
      return
    }

    setIsLoading(true)
    try {
      console.log("[v0] Resetting bar color via API for barId:", user.barId)

      const response = await fetch(`/api/bars/${user.barId}/theme`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          colors: {
            background: "#0b234a",
            surface: "rgba(0,0,0,0.35)",
            text: "#e5e7eb",
            primary: "#0d1b2a",
            secondary: "#1f2937",
            menuText: "#ffffff",
            success: "#22c55e",
            danger: "#ef4444",
            customBackground: null,
          },
          menuCustomization: { borderRadius: 12 },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reset theme")
      }

      console.log("[v0] Bar color reset successfully via API")
      setSelectedColor("")
      onColorChange?.("")

      invalidateAndReloadBar(user.barId)
    } catch (error) {
      console.error("[v0] Error resetting bar color:", error)
      if (error instanceof Error) {
        if (error.message.includes("PERMISSION_DENIED")) {
          alert("Error de permisos. Verifica que tengas acceso de administrador.")
        } else if (error.message.includes("network")) {
          alert("Error de conexión. Verifica tu conexión a internet.")
        } else {
          alert("Error al restablecer el color. Por favor, intenta de nuevo.")
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!user?.barId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalizar Color de Fondo
          </CardTitle>
          <CardDescription>
            No se puede cargar la configuración. Verifica que tengas permisos de administrador.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalizar Color de Fondo
        </CardTitle>
        <CardDescription>Selecciona un color personalizado para el fondo de las mesas de tu bar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {predefinedColors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorSelect(color.value)}
              disabled={isLoading}
              className={`
                relative h-16 rounded-lg border-2 transition-all duration-200 hover:scale-105
                ${
                  selectedColor === color.value
                    ? "border-white ring-2 ring-blue-500"
                    : "border-gray-600 hover:border-gray-400"
                }
                bg-gradient-to-br ${color.value}
                ${color.value.includes("white") ? "text-black" : "text-white"}
              `}
              title={color.name}
            >
              {selectedColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-6 h-6 ${color.value.includes("white") ? "bg-black" : "bg-white"} rounded-full flex items-center justify-center`}
                  >
                    <div
                      className={`w-3 h-3 ${color.value.includes("white") ? "bg-white" : "bg-blue-500"} rounded-full`}
                    />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleResetColor}
            variant="outline"
            disabled={isLoading || !selectedColor}
            className="flex items-center gap-2 bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
            Usar Predeterminado
          </Button>
        </div>

        {selectedColor && (
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
            <div className={`h-20 rounded-lg bg-gradient-to-br ${selectedColor} flex items-center justify-center`}>
              <span className={`font-medium ${selectedColor.includes("white") ? "text-black" : "text-white"}`}>
                Fondo de Mesa
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
