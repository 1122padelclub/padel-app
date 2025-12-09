"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  writeBatch,
  getDocs
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Recipe, RecipeComponent, CostAnalysis } from "@/src/types/inventory"
import type { InventoryItem } from "@/src/types/inventory"

export function useRecipes(barId: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar recetas
  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    const recipesRef = collection(db, "recipes")
    const recipesQuery = query(recipesRef, where("barId", "==", barId))

    const unsubscribe = onSnapshot(
      recipesQuery,
      async (snapshot) => {
        const recipesData: Recipe[] = []
        
        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data()
          
          // Cargar componentes de la receta
          const componentsRef = collection(db, "recipes", docSnapshot.id, "components")
          const componentsSnapshot = await getDocs(componentsRef)
          
          const components = componentsSnapshot.docs.map(compDoc => ({
            id: compDoc.id,
            recipeId: docSnapshot.id,
            ...compDoc.data(),
            createdAt: compDoc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: compDoc.data().updatedAt?.toDate?.() || new Date()
          })) as RecipeComponent[]

          recipesData.push({
            id: docSnapshot.id,
            ...data,
            components,
            lastCalculatedAt: data.lastCalculatedAt?.toDate?.() || new Date(),
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          } as Recipe)
        }

        setRecipes(recipesData)
        setLoading(false)
      },
      (err) => {
        console.error("Error loading recipes:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  // Crear o actualizar receta
  const saveRecipe = useCallback(async (
    menuItemId: string,
    menuItemName: string,
    components: Omit<RecipeComponent, 'id' | 'recipeId' | 'barId' | 'createdAt' | 'updatedAt'>[],
    menuItemSku?: string,
    totalCost?: number
  ) => {
    try {
      // Verificar si ya existe una receta para este ítem
      const existingRecipe = recipes.find(r => r.menuItemId === menuItemId)
      
      let recipeId: string
      
      // Calcular el costo total si no se proporciona
      let calculatedTotalCost = totalCost || 0
      if (!totalCost && components.length > 0) {
        // Obtener items de inventario para calcular costo
        const inventoryItemsRef = collection(db, "inventoryItems")
        const inventoryQuery = query(inventoryItemsRef, where("barId", "==", barId))
        const inventorySnapshot = await getDocs(inventoryQuery)
        const inventoryItems = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        calculatedTotalCost = components.reduce((total, component) => {
          const item = inventoryItems.find(i => i.sku === component.ingredientSku)
          if (item) {
            const costWithWaste = component.qtyPerItemBase * item.costPerBaseUnit * (1 + component.wastePct / 100)
            return total + costWithWaste
          }
          return total
        }, 0)
      }
      
      // Preparar datos de la receta (sin campos undefined)
      const recipeData: any = {
        barId,
        menuItemId,
        menuItemName,
        totalCostPerItem: calculatedTotalCost,
        lastCalculatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Solo agregar menuItemSku si tiene valor
      if (menuItemSku && menuItemSku.trim() !== '') {
        recipeData.menuItemSku = menuItemSku
      }
      
      if (existingRecipe) {
        // Actualizar receta existente
        recipeId = existingRecipe.id
        const recipeRef = doc(db, "recipes", recipeId)
        
        // Preparar datos de actualización (sin campos undefined)
        const updateData: any = {
          menuItemName,
          totalCostPerItem: calculatedTotalCost,
          lastCalculatedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        // Solo agregar menuItemSku si tiene valor
        if (menuItemSku && menuItemSku.trim() !== '') {
          updateData.menuItemSku = menuItemSku
        }
        
        await updateDoc(recipeRef, updateData)
      } else {
        // Crear nueva receta
        const recipesRef = collection(db, "recipes")
        const docRef = await addDoc(recipesRef, recipeData)
        recipeId = docRef.id
      }

      // Eliminar componentes antiguos
      const componentsRef = collection(db, "recipes", recipeId, "components")
      const oldComponents = await getDocs(componentsRef)
      const batch = writeBatch(db)
      
      oldComponents.docs.forEach(docSnapshot => {
        batch.delete(doc(db, "recipes", recipeId, "components", docSnapshot.id))
      })

      // Agregar nuevos componentes
      components.forEach(component => {
        const newComponentRef = doc(collection(db, "recipes", recipeId, "components"))
        
        // Preparar datos del componente sin campos undefined
        const componentData: any = {
          recipeId,
          barId,
          ingredientSku: component.ingredientSku,
          ingredientName: component.ingredientName,
          qtyPerItemBase: component.qtyPerItemBase,
          wastePct: component.wastePct,
          notes: component.notes || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        // Solo agregar forSpecification si no es undefined
        if (component.forSpecification) {
          componentData.forSpecification = component.forSpecification
        }
        
        batch.set(newComponentRef, componentData)
      })

      await batch.commit()

      console.log("Receta guardada exitosamente")
      return { success: true, recipeId }
    } catch (err) {
      console.error("Error saving recipe:", err)
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" }
    }
  }, [barId, recipes])

  // Eliminar receta
  const deleteRecipe = useCallback(async (recipeId: string) => {
    try {
      // Eliminar componentes
      const componentsRef = collection(db, "recipes", recipeId, "components")
      const componentsSnapshot = await getDocs(componentsRef)
      const batch = writeBatch(db)
      
      componentsSnapshot.docs.forEach(docSnapshot => {
        batch.delete(doc(db, "recipes", recipeId, "components", docSnapshot.id))
      })

      // Eliminar receta
      batch.delete(doc(db, "recipes", recipeId))
      
      await batch.commit()

      console.log("Receta eliminada exitosamente")
      return { success: true }
    } catch (err) {
      console.error("Error deleting recipe:", err)
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" }
    }
  }, [])

  // Calcular costo de una receta
  const calculateRecipeCost = useCallback(async (
    recipeId: string,
    inventoryItems: InventoryItem[]
  ): Promise<CostAnalysis | null> => {
    try {
      const recipe = recipes.find(r => r.id === recipeId)
      if (!recipe) return null

      let totalCost = 0
      const componentsCost: CostAnalysis['components'] = []

      for (const component of recipe.components) {
        const item = inventoryItems.find(i => i.sku === component.ingredientSku)
        if (!item) {
          console.warn(`Ingredient ${component.ingredientSku} not found in inventory`)
          continue
        }

        const costWithWaste = component.qtyPerItemBase * item.costPerBaseUnit * (1 + component.wastePct / 100)
        const costPercentage = 0 // Se calculará al final

        componentsCost.push({
          ingredientName: component.ingredientName,
          quantity: component.qtyPerItemBase,
          unit: item.baseUnit,
          cost: costWithWaste,
          costPercentage
        })

        totalCost += costWithWaste
      }

      // Calcular porcentajes
      componentsCost.forEach(comp => {
        comp.costPercentage = totalCost > 0 ? (comp.cost / totalCost) * 100 : 0
      })

      // Obtener precio de venta del menú (esto requeriría cargar el menú)
      const salePrice = 0 // TODO: Obtener del menú
      const marginAmount = salePrice - totalCost
      const margin = salePrice > 0 ? (marginAmount / salePrice) * 100 : 0

      return {
        menuItemId: recipe.menuItemId,
        menuItemName: recipe.menuItemName,
        salePrice,
        totalCost,
        margin,
        marginAmount,
        components: componentsCost
      }
    } catch (err) {
      console.error("Error calculating recipe cost:", err)
      return null
    }
  }, [recipes])

  // Obtener receta por menuItemId
  const getRecipeByMenuItem = useCallback((menuItemId: string) => {
    return recipes.find(r => r.menuItemId === menuItemId)
  }, [recipes])

  return {
    recipes,
    loading,
    error,
    saveRecipe,
    deleteRecipe,
    calculateRecipeCost,
    getRecipeByMenuItem
  }
}

