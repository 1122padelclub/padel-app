"use client"

import React from "react"
import type { DisplayMenuConfig, DisplayMenuCategory, DisplayMenuItem } from "@/src/types"

interface iPhoneMockupProps {
  config: DisplayMenuConfig
  categories: DisplayMenuCategory[]
  items: DisplayMenuItem[]
  className?: string
}

export function iPhoneMockup({ 
  config, 
  categories, 
  items, 
  className = "" 
}: iPhoneMockupProps) {
  console.log("iPhoneMockup renderizando con:", { config: !!config, categories: categories?.length, items: items?.length })
  
  // Versión de prueba que siempre se muestra
  return (
    <div className={`w-80 h-[640px] bg-gray-100 rounded-lg border-2 border-gray-300 ${className}`}>
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        {/* Header del mockup */}
        <div className="bg-gray-800 text-white text-xs px-4 py-2 flex justify-between items-center">
          <span className="font-semibold">9:41</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-3 h-1.5 bg-white rounded-sm m-0.5"></div>
            </div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Contenido del menú - VERSIÓN DE PRUEBA */}
        <div className="w-full h-full overflow-y-auto p-4 bg-white">
          {/* Header del menú */}
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold mb-1 text-gray-800">
              {config?.title || 'Mi Menú'}
            </h1>
            {config?.subtitle && (
              <p className="text-xs text-gray-600">
                {config.subtitle}
              </p>
            )}
          </div>

          {/* Imagen Hero de prueba */}
          {config?.showHeroImage && config?.heroImage ? (
            <div className="mb-4">
              <div 
                className="w-full h-20 bg-cover bg-center rounded mb-2"
                style={{ backgroundImage: `url(${config.heroImage})` }}
              />
              <h2 className="text-sm font-bold text-gray-800">
                {config.heroTitle || "Bienvenidos"}
              </h2>
              {config.heroSubtitle && (
                <p className="text-xs text-gray-600">
                  {config.heroSubtitle}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4 p-4 bg-blue-100 rounded">
              <p className="text-xs text-blue-800">Imagen Hero: {config?.showHeroImage ? 'Habilitada' : 'Deshabilitada'}</p>
            </div>
          )}

          {/* Categorías y items de prueba */}
          <div className="space-y-3">
            <div className="mb-3">
              <h3 className="text-sm font-bold mb-1 text-red-600">
                Categorías ({categories?.length || 0})
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center p-2 rounded text-xs bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">Item de Prueba 1</h4>
                    <p className="text-xs text-gray-600">Descripción del item</p>
                  </div>
                  <span className="font-bold text-red-600">$15.000</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded text-xs bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">Item de Prueba 2</h4>
                    <p className="text-xs text-gray-600">Otra descripción</p>
                  </div>
                  <span className="font-bold text-red-600">$25.000</span>
                </div>
              </div>
            </div>
            
            <div className="p-2 bg-green-100 rounded">
              <p className="text-xs text-green-800">
                ✅ Mockup funcionando - Config: {config ? 'Sí' : 'No'} | 
                Categorías: {categories?.length || 0} | 
                Items: {items?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
