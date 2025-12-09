"use client"

import { useState, useEffect, useCallback } from "react"
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { ButtonConfiguration, CustomButton } from "@/src/types"

const DEFAULT_BUTTON_CONFIG: ButtonConfiguration = {
  buttons: [],
  showButtons: true,
  buttonStyle: {
    layout: "horizontal",
    size: "medium",
    spacing: "normal"
  }
}

export function useButtonConfiguration(barId: string) {
  const [configuration, setConfiguration] = useState<ButtonConfiguration>(DEFAULT_BUTTON_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    console.log("🔘 Cargando configuración de botones para barId:", barId)

    const configRef = doc(db, "bars", barId, "buttonConfig", "default")
    
    const unsubscribe = onSnapshot(
      configRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as ButtonConfiguration
          setConfiguration(data)
          console.log("🔘 Configuración de botones cargada:", data)
        } else {
          console.log("🔘 No existe configuración de botones, usando valores por defecto")
          setConfiguration(DEFAULT_BUTTON_CONFIG)
        }
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("❌ Error cargando configuración de botones:", err)
        if (err.code === "permission-denied") {
          console.warn("⚠️ Permisos insuficientes para configuración de botones, usando valores por defecto")
          setConfiguration(DEFAULT_BUTTON_CONFIG)
          setError(null) // No mostrar error al usuario para permisos
        } else {
          setError(err.message)
          setConfiguration(DEFAULT_BUTTON_CONFIG)
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  const updateConfiguration = useCallback(async (newConfig: Partial<ButtonConfiguration>) => {
    try {
      console.log("🔘 Actualizando configuración de botones:", newConfig)
      
      const configRef = doc(db, "bars", barId, "buttonConfig", "default")
      
      // Limpiar valores undefined para evitar errores de Firestore
      const cleanConfig = (obj: any): any => {
        if (obj === null || obj === undefined) return null
        if (typeof obj !== 'object') return obj
        
        if (Array.isArray(obj)) {
          return obj.map(cleanConfig)
        }
        
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            cleaned[key] = cleanConfig(value)
          }
        }
        return cleaned
      }
      
      const updatedConfig = cleanConfig({
        ...configuration,
        ...newConfig,
        updatedAt: serverTimestamp()
      })
      
      await setDoc(configRef, updatedConfig)
      console.log("✅ Configuración de botones actualizada exitosamente")
      return true
    } catch (error) {
      console.error("❌ Error actualizando configuración de botones:", error)
      if (error.code === "permission-denied") {
        console.warn("⚠️ Permisos insuficientes para actualizar configuración de botones")
        setError("No tienes permisos para actualizar la configuración de botones")
      } else {
        setError(error.message)
      }
      return false
    }
  }, [barId, configuration])

  const addButton = useCallback(async (button: Omit<CustomButton, "id" | "order">) => {
    const newButton: CustomButton = {
      id: `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: button.label || "",
      url: button.url || "",
      type: button.type || "custom",
      icon: button.icon || "",
      color: button.color || "",
      backgroundColor: button.backgroundColor || "",
      isActive: button.isActive ?? true,
      order: configuration.buttons.length
    }

    const newButtons = [...configuration.buttons, newButton]
    return await updateConfiguration({ buttons: newButtons })
  }, [configuration.buttons, updateConfiguration])

  const updateButton = useCallback(async (buttonId: string, updates: Partial<CustomButton>) => {
    const updatedButtons = configuration.buttons.map(btn => {
      if (btn.id === buttonId) {
        // Limpiar valores undefined en las actualizaciones
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, value]) => value !== undefined)
        )
        return { ...btn, ...cleanUpdates }
      }
      return btn
    })
    return await updateConfiguration({ buttons: updatedButtons })
  }, [configuration.buttons, updateConfiguration])

  const deleteButton = useCallback(async (buttonId: string) => {
    const filteredButtons = configuration.buttons.filter(btn => btn.id !== buttonId)
    // Reordenar los botones restantes
    const reorderedButtons = filteredButtons.map((btn, index) => ({
      ...btn,
      order: index
    }))
    return await updateConfiguration({ buttons: reorderedButtons })
  }, [configuration.buttons, updateConfiguration])

  const reorderButtons = useCallback(async (newOrder: CustomButton[]) => {
    const reorderedButtons = newOrder.map((btn, index) => ({
      ...btn,
      order: index
    }))
    return await updateConfiguration({ buttons: reorderedButtons })
  }, [updateConfiguration])

  const toggleButtonsVisibility = useCallback(async (show: boolean) => {
    return await updateConfiguration({ showButtons: show })
  }, [updateConfiguration])

  const updateButtonStyle = useCallback(async (style: Partial<ButtonConfiguration["buttonStyle"]>) => {
    const newStyle = {
      ...configuration.buttonStyle,
      ...style
    }
    return await updateConfiguration({ buttonStyle: newStyle })
  }, [configuration.buttonStyle, updateConfiguration])

  return {
    configuration,
    loading,
    error,
    updateConfiguration,
    addButton,
    updateButton,
    deleteButton,
    reorderButtons,
    toggleButtonsVisibility,
    updateButtonStyle
  }
}
