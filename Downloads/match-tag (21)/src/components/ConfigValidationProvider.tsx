"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/src/hooks/useAuth"
import { useThemeConfig } from "@/src/hooks/useThemeConfig"

interface ValidationIssue {
  type: "error" | "warning" | "info"
  message: string
  field?: string
  suggestion?: string
}

interface ConfigValidationContextType {
  issues: ValidationIssue[]
  isValid: boolean
  addIssue: (issue: ValidationIssue) => void
  clearIssues: () => void
  validateConfig: () => void
}

const ConfigValidationContext = createContext<ConfigValidationContextType | undefined>(undefined)

interface ConfigValidationProviderProps {
  children: ReactNode
}

export function ConfigValidationProvider({ children }: ConfigValidationProviderProps) {
  const { user } = useAuth()
  const { theme: themeConfig, error: themeError, isLoading } = useThemeConfig(user?.barId)
  const [issues, setIssues] = useState<ValidationIssue[]>([])

  const addIssue = (issue: ValidationIssue) => {
    setIssues((prev) => [...prev, issue])
  }

  const clearIssues = () => {
    setIssues([])
  }

  const validateConfig = useMemo(() => {
    return () => {
      clearIssues()

      if (isLoading && !themeConfig) {
        setIssues([
          {
            type: "info",
            message: "Cargando configuración de tema...",
            suggestion: "Por favor espera mientras se carga la configuración",
          },
        ])
        return
      }

      if (!themeConfig && !themeError && !isLoading) {
        setIssues([
          {
            type: "info",
            message: "Configuración de tema lista para personalizar",
            suggestion: "Puedes comenzar a personalizar los colores y guardar tu configuración",
          },
        ])
        return
      }

      if (themeError) {
        console.log("[v0] Theme error details:", themeError)
        setIssues([
          {
            type: "warning",
            message: "Usando configuración por defecto",
            suggestion: "Los cambios se guardarán correctamente al hacer clic en 'Guardar Configuración'",
          },
        ])
        return
      }

      const newIssues: ValidationIssue[] = []

      if (!themeConfig.colors?.background) {
        newIssues.push({
          type: "error",
          message: "Color de fondo no configurado",
          field: "colors.background",
          suggestion: "Configura un color de fondo válido en la personalización",
        })
      }

      if (!themeConfig.colors?.text) {
        newIssues.push({
          type: "error",
          message: "Color de texto no configurado",
          field: "colors.text",
          suggestion: "Configura un color de texto para garantizar legibilidad",
        })
      }

      if (themeConfig.colors?.background && themeConfig.colors?.text) {
        const bgColor = themeConfig.colors.background
        const textColor = themeConfig.colors.text

        if (bgColor === textColor) {
          newIssues.push({
            type: "error",
            message: "Color de fondo y texto son idénticos",
            field: "colors",
            suggestion: "Cambia uno de los colores para mejorar la legibilidad",
          })
        }

        if (bgColor.includes("#fff") && textColor.includes("#fff")) {
          newIssues.push({
            type: "warning",
            message: "Contraste bajo detectado",
            field: "colors",
            suggestion: "Considera usar colores con mayor contraste para mejor accesibilidad",
          })
        }
      }

      if (!themeConfig.colors?.primary) {
        newIssues.push({
          type: "warning",
          message: "Color primario no configurado",
          field: "colors.primary",
          suggestion: "Configura un color primario para elementos destacados",
        })
      }

      if (themeConfig.menuCustomization?.borderRadius && themeConfig.menuCustomization.borderRadius > 20) {
        newIssues.push({
          type: "info",
          message: "Radio de borde muy alto",
          field: "menuCustomization.borderRadius",
          suggestion: "Considera usar un valor menor a 20px para mejor apariencia",
        })
      }

      setIssues(newIssues)
    }
  }, [themeConfig, themeError, isLoading])

  useEffect(() => {
    validateConfig()
  }, [validateConfig])

  const isValid = issues.filter((issue) => issue.type === "error").length === 0

  return (
    <ConfigValidationContext.Provider value={{ issues, isValid, addIssue, clearIssues, validateConfig }}>
      {children}
    </ConfigValidationContext.Provider>
  )
}

export function useConfigValidation() {
  const context = useContext(ConfigValidationContext)
  if (context === undefined) {
    throw new Error("useConfigValidation must be used within a ConfigValidationProvider")
  }
  return context
}

export function ConfigValidationDisplay() {
  const { issues } = useConfigValidation()

  const { errors, warnings, infos } = useMemo(
    () => ({
      errors: issues.filter((issue) => issue.type === "error"),
      warnings: issues.filter((issue) => issue.type === "warning"),
      infos: issues.filter((issue) => issue.type === "info"),
    }),
    [issues],
  )

  if (issues.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {errors.map((issue, index) => (
        <Alert key={`error-${index}`} className="border-red-500/50 bg-red-500/10">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <div className="font-medium text-red-400">{issue.message}</div>
            {issue.suggestion && <div className="text-sm opacity-80 mt-1">{issue.suggestion}</div>}
          </AlertDescription>
        </Alert>
      ))}

      {warnings.map((issue, index) => (
        <Alert key={`warning-${index}`} className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            <div className="font-medium text-yellow-400">{issue.message}</div>
            {issue.suggestion && <div className="text-sm opacity-80 mt-1">{issue.suggestion}</div>}
          </AlertDescription>
        </Alert>
      ))}

      {infos.map((issue, index) => (
        <Alert key={`info-${index}`} className="border-blue-500/50 bg-blue-500/10">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            <div className="font-medium text-blue-400">{issue.message}</div>
            {issue.suggestion && <div className="text-sm opacity-80 mt-1">{issue.suggestion}</div>}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
