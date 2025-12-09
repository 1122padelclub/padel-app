"use client"

import React from "react"
import { ChevronRight } from "lucide-react"
import type { DisplayMenuConfig, DisplayMenuCategory } from "@/src/types"

interface DisplayMenuNavigationProps {
  categories: DisplayMenuCategory[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
  config: DisplayMenuConfig
}

export function DisplayMenuNavigation({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  config 
}: DisplayMenuNavigationProps) {
  const visibleCategories = categories.filter(cat => cat.isVisible)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-3">
        <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              style={{
                fontFamily: config.bodyFont,
                fontSize: config.categoryStyle.fontSize === "small" ? "0.875rem" : 
                         config.categoryStyle.fontSize === "medium" ? "1rem" :
                         config.categoryStyle.fontSize === "large" ? "1.125rem" : "1.25rem",
                fontWeight: config.categoryStyle.fontWeight === "normal" ? "400" :
                           config.categoryStyle.fontWeight === "semibold" ? "600" : "700"
              }}
            >
              <span>{category.name}</span>
              {selectedCategory === category.id && (
                <div 
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: config.accentColor }}
                />
              )}
            </button>
          ))}
          
          {/* Indicador de más categorías */}
          {visibleCategories.length > 5 && (
            <div className="flex items-center text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}



