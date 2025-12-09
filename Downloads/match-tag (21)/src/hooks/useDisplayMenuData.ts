"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { DisplayMenuCategory, DisplayMenuItem, MenuCategory, MenuItem } from "@/src/types"

export function useDisplayMenuData(barId: string) {
  const [categories, setCategories] = useState<DisplayMenuCategory[]>([])
  const [items, setItems] = useState<DisplayMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    console.log("📋 Cargando datos del menú de exhibición para barId:", barId)
    setLoading(true)

    // Timeout para evitar carga infinita
    const timeout = setTimeout(() => {
      console.warn("⚠️ Timeout cargando datos del menú de exhibición")
      setLoading(false)
      setError("Timeout cargando datos del menú")
    }, 10000) // 10 segundos

    // Cargar categorías del menú original
    const categoriesRef = collection(db, "bars", barId, "menuCategories")
    const categoriesQuery = query(categoriesRef, orderBy("order", "asc"))

    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        barId,
        name: doc.data().name,
        description: doc.data().description || "",
        imageUrl: doc.data().imageUrl || "",
        isVisible: doc.data().isVisible !== false, // Por defecto visible
        order: doc.data().order || 0,
        style: {
          backgroundColor: doc.data().style?.backgroundColor || "transparent",
          textColor: doc.data().style?.textColor || "#8B0000",
          borderColor: doc.data().style?.borderColor || "#8B0000"
        }
      } as DisplayMenuCategory))

      setCategories(categoriesData)
      setLoading(false) // Cambiar loading a false cuando se cargan las categorías
      console.log("📋 Categorías cargadas:", categoriesData.length)
      clearTimeout(timeout)
    }, (err) => {
      console.error("❌ Error cargando categorías del menú:", err)
      setError(err.message || "Error cargando categorías")
      clearTimeout(timeout)
    })

    // Cargar items del menú original
    const itemsRef = collection(db, "bars", barId, "menuItems")
    const itemsQuery = query(itemsRef, orderBy("name", "asc")) // Usar la misma consulta que useMenu

    const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
      console.log("📋 Snapshot de items recibido:", snapshot.docs.length, "documentos")
      console.log("📋 Query path:", itemsRef.path)
      console.log("📋 BarId:", barId)
      console.log("📋 Snapshot metadata:", snapshot.metadata)
      
      if (snapshot.docs.length === 0) {
        console.warn("⚠️ No hay items en el menú. Verifica que existan items en la colección menuItems")
        console.log("📋 Ruta de la colección:", `bars/${barId}/menuItems`)
        console.log("📋 Verifica en Firebase Console que existan documentos en esta ruta")
      } else {
        console.log("📋 Documentos encontrados:", snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))
      }
      
      const itemsData = snapshot.docs
        .map(doc => {
          const data = doc.data()
          console.log("📋 Procesando item:", doc.id, data.name, "isAvailable:", data.isAvailable)
          return {
            id: doc.id,
            barId,
            categoryId: data.categoryId,
            name: data.name,
            description: data.description || "",
            price: data.price || 0,
            imageUrl: data.imageUrl || "",
            isVisible: data.isAvailable !== false, // Usar isAvailable del menú original
            isNew: data.isNew || false,
            isRecommended: data.isRecommended || false,
            isSpicy: data.isSpicy || false,
            isVegetarian: data.isVegetarian || false,
            isVegan: data.isVegan || false,
            isGlutenFree: data.isGlutenFree || false,
            order: data.order || 0,
            style: {
              backgroundColor: data.style?.backgroundColor || "transparent",
              textColor: data.style?.textColor || "#333333",
              nameColor: data.style?.nameColor || "#8B0000",
              priceColor: data.style?.priceColor || "#000000"
            }
          } as DisplayMenuItem
        })
        .filter(item => item.isVisible && item.name) // Filtrar items visibles y con nombre en JavaScript

      console.log("📋 Items después del filtro:", itemsData.length)
      setItems(itemsData)
      setLoading(false) // Cambiar loading a false cuando se cargan los items
      console.log("📋 Items cargados:", itemsData.length)
      clearTimeout(timeout)
    }, (err) => {
      console.error("❌ Error cargando items del menú:", err)
      setError(err.message || "Error cargando items")
      clearTimeout(timeout)
    })

    // Cleanup
    return () => {
      unsubscribeCategories()
      unsubscribeItems()
      clearTimeout(timeout)
    }
  }, [barId])

  // Función para obtener items de una categoría específica
  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.categoryId === categoryId && item.isVisible)
  }

  // Función para obtener categorías visibles
  const getVisibleCategories = () => {
    return categories.filter(category => category.isVisible)
  }

  // Función para obtener items recomendados
  const getRecommendedItems = () => {
    return items.filter(item => item.isRecommended && item.isVisible)
  }

  // Función para obtener items nuevos
  const getNewItems = () => {
    return items.filter(item => item.isNew && item.isVisible)
  }

  return {
    categories,
    items,
    loading,
    error,
    getItemsByCategory,
    getVisibleCategories,
    getRecommendedItems,
    getNewItems,
  }
}
