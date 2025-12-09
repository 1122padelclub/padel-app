"use client"

import React from "react"
import { DisplayMenuItemCard } from "./DisplayMenuItemCard"
import type { DisplayMenuConfig, DisplayMenuCategory, DisplayMenuItem } from "@/src/types"

interface DisplayMenuCategorySectionProps {
  category: DisplayMenuCategory
  items: DisplayMenuItem[]
  config: DisplayMenuConfig
}

export function DisplayMenuCategorySection({ 
  category, 
  items, 
  config 
}: DisplayMenuCategorySectionProps) {
  const categoryStyle = config.categoryStyle

  return (
    <section className="mb-12">
      {/* Título de la categoría */}
      <div 
        className="mb-8"
        style={{
          textAlign: categoryStyle.textAlign,
          padding: categoryStyle.padding === "small" ? "1rem" : 
                   categoryStyle.padding === "medium" ? "1.5rem" : "2rem"
        }}
      >
        <h2 
          className="inline-block"
          style={{
            fontFamily: config.titleFont,
            fontSize: categoryStyle.fontSize === "small" ? "1.5rem" :
                     categoryStyle.fontSize === "medium" ? "1.875rem" :
                     categoryStyle.fontSize === "large" ? "2.25rem" : "2.5rem",
            fontWeight: categoryStyle.fontWeight === "normal" ? "400" :
                       categoryStyle.fontWeight === "semibold" ? "600" : "700",
            color: categoryStyle.textColor || config.accentColor,
            backgroundColor: categoryStyle.backgroundColor || "transparent",
            padding: categoryStyle.showBorders ? "1rem 2rem" : "0.5rem 0",
            border: categoryStyle.showBorders ? `2px ${categoryStyle.borderStyle} ${categoryStyle.borderColor}` : "none",
            borderRadius: categoryStyle.showBorders ? "0.5rem" : "0",
            boxShadow: config.decorations.showShadows ? `0 4px 6px ${config.decorations.shadowColor}` : "none"
          }}
        >
          {category.name}
        </h2>
        
        {/* Descripción de la categoría */}
        {category.description && (
          <p 
            className="mt-2 opacity-80"
            style={{
              fontFamily: config.bodyFont,
              color: categoryStyle.textColor || config.textColor,
              fontSize: "1rem"
            }}
          >
            {category.description}
          </p>
        )}
      </div>

      {/* Grid de items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <DisplayMenuItemCard
            key={item.id}
            item={item}
            config={config}
          />
        ))}
      </div>

      {/* Divisor decorativo */}
      {config.decorations.showDivider && items.length > 0 && (
        <div 
          className="mt-8 flex justify-center"
          style={{ color: config.decorations.dividerColor }}
        >
          {config.decorations.dividerStyle === "line" && (
            <div 
              className="w-24 h-0.5"
              style={{ backgroundColor: config.decorations.dividerColor }}
            />
          )}
          {config.decorations.dividerStyle === "dots" && (
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.decorations.dividerColor }}
                />
              ))}
            </div>
          )}
          {config.decorations.dividerStyle === "dashes" && (
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-8 h-0.5"
                  style={{ backgroundColor: config.decorations.dividerColor }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
