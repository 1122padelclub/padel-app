"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Star } from "lucide-react"
import type { DisplayMenuConfig, DisplayMenuCategory, DisplayMenuItem } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface FeaturedItemsConfigProps {
  config: DisplayMenuConfig
  categories: DisplayMenuCategory[]
  items: DisplayMenuItem[]
  onConfigChange: (updates: Partial<DisplayMenuConfig>) => void
}

export function FeaturedItemsConfig({ 
  config, 
  categories, 
  items, 
  onConfigChange 
}: FeaturedItemsConfigProps) {
  const t = useT()
  
  const handleFeaturedItemChange = (categoryId: string, itemId: string | null) => {
    const newFeaturedItems = { ...(config.featuredItems || {}) }
    
    if (itemId) {
      newFeaturedItems[categoryId] = itemId
    } else {
      delete newFeaturedItems[categoryId]
    }
    
    onConfigChange({ featuredItems: newFeaturedItems })
  }

  const getCategoryItems = (categoryId: string) => {
    return items.filter(item => item.categoryId === categoryId && item.isVisible)
  }

  const getItemName = (itemId: string) => {
    const item = items.find(item => item.id === itemId)
    return item ? item.name : t("admin.itemNotFound")
  }

  return (
    <Card className="backdrop-blur-md border border-white/20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Star className="h-5 w-5" />
          {t("admin.featuredItemsByCategory")}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {t("admin.selectFeaturedItemForEachCategory")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories
          .filter(cat => cat.isVisible)
          .map((category) => {
            const categoryItems = getCategoryItems(category.id)
            const currentFeaturedItem = config.featuredItems?.[category.id]
            
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  {currentFeaturedItem && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeaturedItemChange(category.id, null)}
                      className="backdrop-blur-md border border-white/20 text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t("admin.removeFeatured")}
                    </Button>
                  )}
                </div>
                
                <Select
                  value={currentFeaturedItem || ""}
                  onValueChange={(value) => handleFeaturedItemChange(category.id, value)}
                >
                  <SelectTrigger className="backdrop-blur-md border border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder={`${t("admin.selectFeaturedItemFor")} ${category.name}`} />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-md border border-white/20 bg-white/10">
                    {categoryItems.map((item) => (
                      <SelectItem 
                        key={item.id} 
                        value={item.id}
                        className="text-white hover:bg-white/20"
                      >
                        <div className="flex items-center gap-2">
                          {item.imageUrl && (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-400">${item.price.toLocaleString()}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {currentFeaturedItem && (
                  <div className="p-3 rounded-lg backdrop-blur-md border border-white/20 bg-white/5">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{t("admin.featuredItem")}: <strong>{getItemName(currentFeaturedItem)}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        
        {Object.keys(config.featuredItems || {}).length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("admin.noFeaturedItemsConfigured")}</p>
            <p className="text-sm">{t("admin.selectFeaturedItemsForEachCategoryAbove")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
