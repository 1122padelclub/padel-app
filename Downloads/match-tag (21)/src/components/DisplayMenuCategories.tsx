"use client"

import React from "react"
import { DisplayMenuCategorySection } from "./DisplayMenuCategorySection"
import { DisplayFeaturedItem } from "./DisplayFeaturedItem"
import { DisplayHeroImage } from "./DisplayHeroImage"
import type { DisplayMenuConfig, DisplayMenuCategory, DisplayMenuItem } from "@/src/types"

interface DisplayMenuCategoriesProps {
  categories: DisplayMenuCategory[]
  items: DisplayMenuItem[]
  selectedCategory: string | null
  config: DisplayMenuConfig
}

export function DisplayMenuCategories({ 
  categories, 
  items, 
  selectedCategory, 
  config 
}: DisplayMenuCategoriesProps) {
  const visibleCategories = categories.filter(cat => cat.isVisible)

  // Si hay una categoría seleccionada, mostrar solo esa
  if (selectedCategory) {
    const category = visibleCategories.find(cat => cat.id === selectedCategory)
    if (category) {
      const categoryItems = items.filter(item => item.categoryId === category.id && item.isVisible)
      return (
        <DisplayMenuCategorySection
          category={category}
          items={categoryItems}
          config={config}
        />
      )
    }
  }

  // Mostrar todas las categorías
  return (
    <div className="space-y-12">
      {/* Imagen Hero - Solo si está habilitada, tiene imagen y no hay categoría seleccionada */}
      {!selectedCategory && config.showHeroImage && config.heroImage && (
        <DisplayHeroImage config={config} />
      )}

      {visibleCategories.map((category) => {
        const categoryItems = items.filter(item => item.categoryId === category.id && item.isVisible)
        
        if (categoryItems.length === 0) {
          return null
        }

        // Solo mostrar items destacados si NO se está usando imagen hero O si showHeroImage está activado pero no hay imagen hero
        const featuredItemId = (!config.showHeroImage || (config.showHeroImage && !config.heroImage)) ? config.featuredItems?.[category.id] : null
        const featuredItem = featuredItemId ? categoryItems.find(item => item.id === featuredItemId) : null
        const regularItems = featuredItem ? categoryItems.filter(item => item.id !== featuredItemId) : categoryItems

        return (
          <div key={category.id} className="space-y-8">
            {/* Item destacado - Solo si no se usa imagen hero O si showHeroImage está activado pero no hay imagen hero */}
            {featuredItem && (!config.showHeroImage || (config.showHeroImage && !config.heroImage)) && (
              <div className="mb-8">
                <DisplayFeaturedItem
                  item={featuredItem}
                  config={config}
                />
              </div>
            )}

            {/* Items regulares */}
            <DisplayMenuCategorySection
              category={category}
              items={regularItems}
              config={config}
            />
          </div>
        )
      })}
    </div>
  )
}
