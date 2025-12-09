"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { DisplayMenuConfig } from "@/src/types"

const DEFAULT_CONFIG: Omit<DisplayMenuConfig, "id" | "barId" | "createdAt" | "updatedAt"> = {
  isActive: true,
  title: "Nuestro Menú",
  subtitle: "Deliciosos sabores que te encantarán",
  backgroundColor: "#ffffff",
  textColor: "#333333",
  accentColor: "#8B0000",
  fontFamily: "Inter",
  headerFont: "Playfair Display",
  bodyFont: "Inter",
  titleFont: "Playfair Display",
  layout: "elegant",
  showImages: true,
  imageSize: "medium",
  imageStyle: "rounded",
  showPrices: true,
  showDescriptions: true,
  showBadges: true,
  badgeStyle: "rounded",
  badgeColor: "#3B82F6",
  categoryStyle: {
    showBorders: true,
    borderStyle: "double",
    borderColor: "#8B0000",
    backgroundColor: "transparent",
    textColor: "#8B0000",
    fontSize: "large",
    fontWeight: "bold",
    textAlign: "center",
    padding: "medium"
  },
  itemStyle: {
    showBorders: false,
    borderStyle: "none",
    borderColor: "#e5e5e5",
    backgroundColor: "transparent",
    textColor: "#333333",
    nameColor: "#8B0000",
    descriptionColor: "#666666",
    priceColor: "#000000",
    fontSize: "medium",
    nameFontSize: "large",
    nameFontWeight: "bold",
    spacing: "normal"
  },
  decorations: {
    showDivider: true,
    dividerStyle: "line",
    dividerColor: "#8B0000",
    showShadows: true,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    showGradients: false,
    gradientColors: ["#8B0000", "#FF6B6B"]
  },
  socialLinks: {
    showSocialLinks: true,
    facebook: "",
    instagram: "",
    whatsapp: "",
    website: "",
    phone: "",
    email: ""
  },
  featuredItems: {},
  heroImage: "",
  heroTitle: "Bienvenidos",
  heroSubtitle: "Disfruta de nuestros deliciosos platos",
  showHeroImage: true,
  headerButtons: {
    leftButton: {
      text: "Contáctanos",
      url: "https://wa.me/1234567890",
      isVisible: true
    },
    rightButton: {
      text: "Recomendados",
      url: "#recomendados",
      isVisible: true
    }
  },
  modalStyle: {
    titleColor: "#8B0000",
    textColor: "#333333",
    priceColor: "#8B0000",
    descriptionColor: "#666666"
  },
  titleStyle: {
    titleColor: "#FFFFFF",
    subtitleColor: "#FFFFFF",
    backgroundColor: "#1F2937"
  }
}

export function useDisplayMenuConfig(barId: string) {
  const [config, setConfig] = useState<DisplayMenuConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    console.log("🎨 Cargando configuración del menú de exhibición para barId:", barId)
    setLoading(true)

    // Timeout para evitar carga infinita
    const timeout = setTimeout(() => {
      console.warn("⚠️ Timeout cargando configuración del menú de exhibición")
      setLoading(false)
      setError("Timeout cargando configuración")
    }, 10000) // 10 segundos

    const configRef = doc(db, "bars", barId, "displayMenuConfig", "config")

    const unsubscribe = onSnapshot(configRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const currentConfig = {
          id: snapshot.id,
          barId,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as DisplayMenuConfig

        // Migración automática: si showHeroImage es false, actualizarlo a true
        if (currentConfig.showHeroImage === false) {
          console.log("🔄 Migrando configuración: actualizando showHeroImage de false a true")
          const migratedConfig = {
            ...currentConfig,
            showHeroImage: true,
            updatedAt: new Date()
          }
          
          // Actualizar en Firestore
          setDoc(configRef, migratedConfig, { merge: true }).catch(err => {
            console.error("❌ Error migrando configuración:", err)
          })
          
          setConfig(migratedConfig)
        } else {
          setConfig(currentConfig)
        }
      } else {
        // Crear configuración por defecto si no existe
        const defaultConfig: DisplayMenuConfig = {
          id: "default",
          barId,
          ...DEFAULT_CONFIG,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setConfig(defaultConfig)
        
        // Guardar la configuración por defecto en Firestore
        setDoc(configRef, defaultConfig).catch(err => {
          console.error("❌ Error creando configuración por defecto:", err)
        })
      }
      
      setLoading(false)
      setError(null)
      clearTimeout(timeout)
    }, (err) => {
      console.error("❌ Error cargando configuración del menú de exhibición:", err)
      setError(err.message || "Error desconocido al cargar configuración")
      setLoading(false)
      clearTimeout(timeout)
    })

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [barId])

  const updateConfig = async (updates: Partial<DisplayMenuConfig>) => {
    try {
      if (!config) {
        console.error("❌ No hay configuración cargada para actualizar")
        return
      }

      const configRef = doc(db, "bars", barId, "displayMenuConfig", "config")
      
      // Crear una copia profunda de la configuración actual
      const updatedConfig = {
        ...config,
        ...updates,
        updatedAt: new Date(),
      }

      console.log("🎨 Actualizando configuración del menú de exhibición:", {
        barId,
        updates,
        updatedConfig
      })

      await setDoc(configRef, updatedConfig, { merge: true })
      
      // Actualizar el estado local inmediatamente para feedback visual
      setConfig(updatedConfig)
      
      console.log("✅ Configuración del menú de exhibición actualizada exitosamente")
    } catch (err: any) {
      console.error("❌ Error actualizando configuración del menú de exhibición:", err)
      throw new Error(err.message || "Error desconocido al actualizar configuración")
    }
  }

  const resetToDefault = async () => {
    try {
      const defaultConfig: DisplayMenuConfig = {
        id: "default",
        barId,
        ...DEFAULT_CONFIG,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const configRef = doc(db, "bars", barId, "displayMenuConfig", "config")
      await setDoc(configRef, defaultConfig)
      
      setConfig(defaultConfig)
      console.log("✅ Configuración del menú de exhibición restablecida a valores por defecto")
    } catch (err: any) {
      console.error("❌ Error restableciendo configuración del menú de exhibición:", err)
      throw new Error(err.message || "Error desconocido al restablecer configuración")
    }
  }

  return {
    config,
    loading,
    error,
    updateConfig,
    resetToDefault,
  }
}
