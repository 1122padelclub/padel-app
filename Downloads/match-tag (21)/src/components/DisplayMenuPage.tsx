"use client"

import React from "react"
import { DisplayMenuHeader } from "./DisplayMenuHeader"
import { DisplayMenuNavigation } from "./DisplayMenuNavigation"
import { DisplayMenuHero } from "./DisplayMenuHero"
import { DisplayMenuCategories } from "./DisplayMenuCategories"
import { DisplayMenuFooter } from "./DisplayMenuFooter"
import type { DisplayMenuConfig, DisplayMenuCategory, DisplayMenuItem } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface DisplayMenuPageProps {
  config: DisplayMenuConfig
  categories: DisplayMenuCategory[]
  items: DisplayMenuItem[]
}

export function DisplayMenuPage({ config, categories, items }: DisplayMenuPageProps) {
  const t = useT()
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  // Aplicar estilos dinámicos basados en la configuración
  const pageStyle = {
    backgroundColor: config.backgroundColor,
    color: config.textColor,
    fontFamily: config.fontFamily,
  }

  const backgroundStyle = config.backgroundImage ? {
    backgroundImage: `url(${config.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : {}


  return (
    <div 
      className="min-h-screen"
      style={{
        ...pageStyle,
        ...backgroundStyle,
      }}
    >
      {/* Header con título y navegación */}
      <DisplayMenuHeader 
        config={config}
        onContactClick={() => console.log("Contact clicked")}
        onRecommendedClick={() => setSelectedCategory("recommended")}
      />

      {/* Navegación de categorías */}
      <DisplayMenuNavigation 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        config={config}
      />

      {/* Hero section con imagen destacada */}
      <DisplayMenuHero 
        config={config}
        categories={categories}
        items={items}
      />

      {/* Contenido principal del menú */}
      <main className="px-4 py-8 max-w-6xl mx-auto">
        <DisplayMenuCategories 
          categories={categories}
          items={items}
          selectedCategory={selectedCategory}
          config={config}
          t={t}
        />
      </main>

      {/* Footer con enlaces sociales */}
      <DisplayMenuFooter 
        config={config}
      />
    </div>
  )
}
