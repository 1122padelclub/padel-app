"use client"

import { useState, useEffect, useCallback } from "react"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"

export interface TableCustomization {
  // Colores
  primaryColor: string
  secondaryColor: string
  textColor: string
  backgroundColor: string
  
  // Tipografía
  fontFamily: string
  fontSize: string
  headerFont?: string
  bodyFont?: string
  buttonFont?: string
  
  // Imágenes
  backgroundImageUrl?: string
  logoUrl?: string
  
  // Personalización adicional
  borderRadius: number
  logoSize?: number
  showPoweredBy: boolean
  restaurantName: string
  tagline: string
  
  // Configuración de mesa
  tableName: string
  welcomeMessage: string
}

const DEFAULT_CUSTOMIZATION: TableCustomization = {
  primaryColor: "#0ea5e9",
  secondaryColor: "#1f2937",
  textColor: "#ffffff",
  backgroundColor: "#f8fafc",
  fontFamily: "system-ui, sans-serif",
  fontSize: "16px",
  borderRadius: 12,
  logoSize: 40,
  showPoweredBy: true,
  restaurantName: "Match Tag",
  tagline: "Conecta con otras mesas en tu bar o discoteca",
  tableName: "Mesa",
  welcomeMessage: "¡Bienvenido a tu mesa!"
}

export function useTableCustomization(barId: string, tableId?: string) {
  const [customization, setCustomization] = useState<TableCustomization>(DEFAULT_CUSTOMIZATION)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Cargar personalización
  const loadCustomization = useCallback(async () => {
    if (!barId) return

    try {
      setLoading(true)
      setError(null)

      // Intentar cargar desde Firestore
      const customizationRef = doc(db, "bars", barId, "themeConfig", "tableCustomization")
      const customizationDoc = await getDoc(customizationRef)

      if (customizationDoc.exists()) {
        const data = customizationDoc.data()
        setCustomization({
          ...DEFAULT_CUSTOMIZATION,
          ...data,
          // Asegurar que los colores son válidos
          primaryColor: data.primaryColor || DEFAULT_CUSTOMIZATION.primaryColor,
          secondaryColor: data.secondaryColor || DEFAULT_CUSTOMIZATION.secondaryColor,
          textColor: data.textColor || DEFAULT_CUSTOMIZATION.textColor,
          backgroundColor: data.backgroundColor || DEFAULT_CUSTOMIZATION.backgroundColor,
        })
        console.log("✅ Personalización cargada desde Firestore:", data)
      } else {
        // Crear configuración por defecto
        await setDoc(customizationRef, DEFAULT_CUSTOMIZATION)
        setCustomization(DEFAULT_CUSTOMIZATION)
        console.log("✅ Configuración por defecto creada")
      }
    } catch (err) {
      console.error("❌ Error cargando personalización:", err)
      setError("Error cargando personalización")
      setCustomization(DEFAULT_CUSTOMIZATION)
    } finally {
      setLoading(false)
    }
  }, [barId])

  // Guardar personalización
  const saveCustomization = useCallback(async (newCustomization: Partial<TableCustomization>) => {
    if (!barId) return false

    try {
      setSaving(true)
      setError(null)

      const customizationRef = doc(db, "bars", barId, "themeConfig", "tableCustomization")
      const updatedCustomization = {
        ...customization,
        ...newCustomization,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(customizationRef, updatedCustomization)
      setCustomization(updatedCustomization)
      
      console.log("✅ Personalización guardada:", updatedCustomization)
      return true
    } catch (err) {
      console.error("❌ Error guardando personalización:", err)
      setError("Error guardando personalización")
      return false
    } finally {
      setSaving(false)
    }
  }, [barId, customization])

  // Aplicar personalización a CSS variables
  const applyCustomization = useCallback((customization: TableCustomization) => {
    const root = document.documentElement
    
    // Colores
    root.style.setProperty('--mt-primary', customization.primaryColor)
    root.style.setProperty('--mt-secondary', customization.secondaryColor)
    root.style.setProperty('--mt-text', customization.textColor)
    root.style.setProperty('--mt-bg', customization.backgroundColor)
    
    // Tipografía
    root.style.setProperty('--mt-font-family', customization.fontFamily)
    root.style.setProperty('--mt-font-size', customization.fontSize)
    
    // Otros
    root.style.setProperty('--mt-border-radius', `${customization.borderRadius}px`)
    
    console.log("✅ Personalización aplicada a CSS variables")
  }, [])

  // Cargar al montar
  useEffect(() => {
    loadCustomization()
  }, [loadCustomization])

  // Aplicar personalización cuando cambie
  useEffect(() => {
    if (!loading && customization) {
      applyCustomization(customization)
    }
  }, [loading, customization, applyCustomization])

  return {
    customization,
    loading,
    error,
    saving,
    saveCustomization,
    loadCustomization,
    applyCustomization
  }
}

