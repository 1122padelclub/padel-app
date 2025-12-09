"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChefHat, 
  Plus, 
  Trash2, 
  DollarSign,
  Percent,
  Package,
  Search,
  Tag
} from "lucide-react"
import { useRecipes } from "@/src/hooks/useRecipes"
import { useInventory } from "@/src/hooks/useInventory"
import { useMenu } from "@/src/hooks/useMenu"
import type { RecipeComponent } from "@/src/types/inventory"
import type { MenuItemSpecification } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface RecipeManagerProps {
  barId: string
}

type ComponentWithSpec = Omit<RecipeComponent, 'id' | 'recipeId' | 'barId' | 'createdAt' | 'updatedAt'>

export function RecipeManager({ barId }: RecipeManagerProps) {
  const { recipes, saveRecipe, deleteRecipe, loading: recipesLoading } = useRecipes(barId)
  const { items: inventoryItems } = useInventory(barId)
  const { items: menuItems } = useMenu(barId)
  const t = useT()
  
  const [isEditingRecipe, setIsEditingRecipe] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("")
  const [recipeComponents, setRecipeComponents] = useState<ComponentWithSpec[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<string>("base")

  // Cargar receta existente al seleccionar un ítem del menú
  useEffect(() => {
    if (selectedMenuItem) {
      const existingRecipe = recipes.find(r => r.menuItemId === selectedMenuItem)
      if (existingRecipe) {
        setRecipeComponents(existingRecipe.components.map(comp => ({
          ingredientSku: comp.ingredientSku,
          ingredientName: comp.ingredientName,
          qtyPerItemBase: comp.qtyPerItemBase,
          wastePct: comp.wastePct,
          forSpecification: comp.forSpecification,
          notes: comp.notes
        })))
      } else {
        setRecipeComponents([])
      }
    }
  }, [selectedMenuItem, recipes])

  const handleAddComponent = (forSpec?: { specificationId: string, specificationName: string, optionId: string, optionName: string }) => {
    setRecipeComponents([
      ...recipeComponents,
      {
        ingredientSku: "",
        ingredientName: "",
        qtyPerItemBase: 0,
        wastePct: 5,
        forSpecification: forSpec,
        notes: ""
      }
    ])
  }

  const handleUpdateComponent = (index: number, field: string, value: any) => {
    const updated = [...recipeComponents]
    updated[index] = { ...updated[index], [field]: value }
    
    // Si se selecciona un ingrediente, actualizar el nombre automáticamente
    if (field === 'ingredientSku') {
      const ingredient = inventoryItems.find(i => i.sku === value)
      if (ingredient) {
        updated[index].ingredientName = ingredient.name
      }
    }
    
    setRecipeComponents(updated)
  }

  const handleRemoveComponent = (index: number) => {
    setRecipeComponents(recipeComponents.filter((_, i) => i !== index))
  }

  const handleSaveRecipe = async () => {
    if (!selectedMenuItem) return

    const menuItem = menuItems.find(i => i.id === selectedMenuItem)
    if (!menuItem) return

    // Calcular el costo total antes de guardar (solo ingredientes base)
    const totalCost = calculateTotalCost()

    const result = await saveRecipe(
      selectedMenuItem,
      menuItem.name,
      recipeComponents,
      undefined, // menuItemSku (opcional)
      totalCost  // totalCost calculado
    )

    if (result.success) {
      setIsEditingRecipe(false)
      setSelectedMenuItem("")
      setRecipeComponents([])
      setActiveTab("base")
    }
  }

  const calculateTotalCost = () => {
    let total = 0
    // Solo calcular costo de ingredientes base (sin especificación)
    recipeComponents
      .filter(comp => !comp.forSpecification)
      .forEach(comp => {
        const item = inventoryItems.find(i => i.sku === comp.ingredientSku)
        if (item) {
          const cost = comp.qtyPerItemBase * item.costPerBaseUnit * (1 + comp.wastePct / 100)
          total += cost
        }
      })
    return total
  }

  const calculateCostForSpecification = (specId: string, optionId: string) => {
    let total = 0
    
    // Sumar ingredientes base
    recipeComponents
      .filter(comp => !comp.forSpecification)
      .forEach(comp => {
        const item = inventoryItems.find(i => i.sku === comp.ingredientSku)
        if (item) {
          total += comp.qtyPerItemBase * item.costPerBaseUnit * (1 + comp.wastePct / 100)
        }
      })
    
    // Sumar ingredientes específicos de esta opción
    recipeComponents
      .filter(comp => 
        comp.forSpecification?.specificationId === specId &&
        comp.forSpecification?.optionId === optionId
      )
      .forEach(comp => {
        const item = inventoryItems.find(i => i.sku === comp.ingredientSku)
        if (item) {
          total += comp.qtyPerItemBase * item.costPerBaseUnit * (1 + comp.wastePct / 100)
        }
      })
    
    return total
  }

  const filteredMenuItems = menuItems.filter(item => 
    searchTerm === "" || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Obtener especificaciones del ítem del menú seleccionado
  const getMenuItemSpecifications = (): MenuItemSpecification[] => {
    if (!selectedMenuItem) return []
    const menuItem = menuItems.find(i => i.id === selectedMenuItem)
    return menuItem?.specifications || []
  }

  // Obtener componentes por tipo
  const getBaseComponents = () => recipeComponents.filter(comp => !comp.forSpecification)
  const getSpecificationComponents = (specId: string, optionId: string) => 
    recipeComponents.filter(comp => 
      comp.forSpecification?.specificationId === specId &&
      comp.forSpecification?.optionId === optionId
    )

  if (recipesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            {t("admin.recipeManager")}
          </CardTitle>
          <CardDescription>{t("admin.linkMenuItemsWithSupplies")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Buscar ítem del menú */}
          <div className="mb-6">
            <Label>{t("admin.searchMenuItem")}</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("admin.searchMenuItemPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Lista de ítems del menú */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map(menuItem => {
              const recipe = recipes.find(r => r.menuItemId === menuItem.id)
              const hasRecipe = !!recipe
              const cost = hasRecipe ? recipe.totalCostPerItem : 0
              const margin = menuItem.price > 0 ? ((menuItem.price - cost) / menuItem.price) * 100 : 0
              const hasSpecifications = menuItem.specifications && menuItem.specifications.length > 0

              return (
                <Card key={menuItem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{menuItem.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            ${menuItem.price.toFixed(2)}
                          </Badge>
                          {hasRecipe && (
                            <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                              {t("admin.recipeConfigured")}
                            </Badge>
                          )}
                          {hasSpecifications && (
                            <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                              <Tag className="h-3 w-3 mr-1" />
                              {menuItem.specifications!.length} spec
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasRecipe && (
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Costo base:</span>
                          <span className="font-medium text-gray-900">${cost.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Margen:</span>
                          <span className={`font-medium ${margin > 50 ? 'text-green-600' : margin > 30 ? 'text-orange-600' : 'text-red-600'}`}>
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {recipe.components.length} ingrediente{recipe.components.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedMenuItem(menuItem.id)
                        setIsEditingRecipe(true)
                        setActiveTab("base")
                      }}
                    >
                      {hasRecipe ? t("admin.editRecipe") : t("admin.createRecipe")}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de edición de receta - VERSIÓN GRANDE v2 */}
      <Dialog open={isEditingRecipe} onOpenChange={setIsEditingRecipe}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto" style={{ width: '95vw', maxWidth: '95vw' }}>
          <DialogHeader>
            <DialogTitle>
              Configurar Receta - {menuItems.find(i => i.id === selectedMenuItem)?.name}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              {t("recipeManager.configureBaseAndSpecificIngredients")}
            </p>
          </DialogHeader>

          <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${1 + getMenuItemSpecifications().reduce((acc, spec) => acc + spec.options.length, 0)}, minmax(0, 1fr))` }}>
                <TabsTrigger value="base">
                  {t("admin.baseRecipe")}
                  {getBaseComponents().length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {getBaseComponents().length}
                    </Badge>
                  )}
                </TabsTrigger>
                {getMenuItemSpecifications().map(spec => 
                  spec.options.map(option => (
                    <TabsTrigger key={`${spec.id}-${option.id}`} value={`${spec.id}-${option.id}`}>
                      <Tag className="h-3 w-3 mr-1" />
                      {option.name}
                      {getSpecificationComponents(spec.id, option.id).length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getSpecificationComponents(spec.id, option.id).length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))
                )}
              </TabsList>

              {/* Tab: Receta Base */}
              <TabsContent value="base">
                <div className="border rounded-xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{t("recipeManager.baseIngredients")}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t("recipeManager.baseIngredientsDescription")}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddComponent()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("recipeManager.addIngredient")}
                    </Button>
                  </div>

                  {getBaseComponents().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No hay ingredientes base en esta receta</p>
                      <p className="text-sm">Agrega ingredientes que se usen siempre</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {recipeComponents.map((component, globalIndex) => {
                        if (component.forSpecification) return null
                        
                        const item = inventoryItems.find(i => i.sku === component.ingredientSku)
                        const costWithWaste = item 
                          ? component.qtyPerItemBase * item.costPerBaseUnit * (1 + component.wastePct / 100)
                          : 0

                        return (
                          <ComponentRow
                            key={globalIndex}
                            component={component}
                            index={globalIndex}
                            item={item}
                            costWithWaste={costWithWaste}
                            inventoryItems={inventoryItems}
                            onUpdate={handleUpdateComponent}
                            onRemove={handleRemoveComponent}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tabs: Especificaciones */}
              {getMenuItemSpecifications().map(spec => 
                spec.options.map(option => (
                  <TabsContent key={`${spec.id}-${option.id}`} value={`${spec.id}-${option.id}`}>
                    <div className="border rounded-xl p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {spec.name}: {option.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t("recipeManager.additionalIngredientsWhenSelected")} "{option.name}"
                          </p>
                          {option.priceModifier && option.priceModifier !== 0 && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Modificador de precio: {option.priceModifier > 0 ? '+' : ''}${option.priceModifier}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddComponent({
                            specificationId: spec.id,
                            specificationName: spec.name,
                            optionId: option.id,
                            optionName: option.name
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("recipeManager.addIngredient")}
                        </Button>
                      </div>

                      {getSpecificationComponents(spec.id, option.id).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{t("recipeManager.noSpecificIngredientsFor")} "{option.name}"</p>
                          <p className="text-sm">{t("recipeManager.baseIngredientsWillBeUsed")}</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {recipeComponents.map((component, globalIndex) => {
                            if (
                              component.forSpecification?.specificationId !== spec.id ||
                              component.forSpecification?.optionId !== option.id
                            ) return null
                            
                            const item = inventoryItems.find(i => i.sku === component.ingredientSku)
                            const costWithWaste = item 
                              ? component.qtyPerItemBase * item.costPerBaseUnit * (1 + component.wastePct / 100)
                              : 0

                            return (
                              <ComponentRow
                                key={globalIndex}
                                component={component}
                                index={globalIndex}
                                item={item}
                                costWithWaste={costWithWaste}
                                inventoryItems={inventoryItems}
                                onUpdate={handleUpdateComponent}
                                onRemove={handleRemoveComponent}
                              />
                            )
                          })}
                        </div>
                      )}

                      {/* Costo para esta especificación */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">
                            {t("recipeManager.totalCostWith")} "{option.name}":
                          </span>
                          <span className="text-lg font-bold text-blue-900">
                            ${calculateCostForSpecification(spec.id, option.id).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          {t("recipeManager.includesBaseAndSpecificIngredients")} "{option.name}"
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))
              )}
            </Tabs>

            {/* Resumen de costos */}
            {recipeComponents.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-blue-800 mb-1">
                        <DollarSign className="h-4 w-4" />
                        {t("recipeManager.baseCost")}
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        ${calculateTotalCost().toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        {t("recipeManager.onlyBaseIngredients")}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-blue-800 mb-1">
                        <DollarSign className="h-4 w-4" />
                        {t("recipeManager.sellingPrice")}
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        ${menuItems.find(i => i.id === selectedMenuItem)?.price.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-blue-800 mb-1">
                        <Percent className="h-4 w-4" />
                        {t("recipeManager.baseMargin")}
                      </div>
                      <div className={`text-2xl font-bold ${
                        (() => {
                          const price = menuItems.find(i => i.id === selectedMenuItem)?.price || 0
                          const cost = calculateTotalCost()
                          const margin = price > 0 ? ((price - cost) / price) * 100 : 0
                          return margin > 50 ? 'text-green-600' : margin > 30 ? 'text-orange-600' : 'text-red-600'
                        })()
                      }`}>
                        {(() => {
                          const price = menuItems.find(i => i.id === selectedMenuItem)?.price || 0
                          const cost = calculateTotalCost()
                          return price > 0 ? (((price - cost) / price) * 100).toFixed(1) : '0.0'
                        })()}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditingRecipe(false)
                  setSelectedMenuItem("")
                  setRecipeComponents([])
                  setActiveTab("base")
                }}
              >
                {t("admin.cancel")}
              </Button>
              <Button 
                onClick={handleSaveRecipe}
                disabled={recipeComponents.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t("admin.saveRecipe")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente reutilizable para mostrar una fila de ingrediente
function ComponentRow({ 
  component, 
  index, 
  item, 
  costWithWaste,
  inventoryItems,
  onUpdate, 
  onRemove 
}: { 
  component: ComponentWithSpec
  index: number
  item: any
  costWithWaste: number
  inventoryItems: any[]
  onUpdate: (index: number, field: string, value: any) => void
  onRemove: (index: number) => void
}) {
  const t = useT()
  return (
    <div className="border rounded-xl p-8 bg-white shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-semibold text-gray-900 text-xl">
          {component.ingredientName || t("recipeManager.ingredientNotSelected")}
        </h4>
        <Button
          variant="outline"
          size="lg"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
        <div className="lg:col-span-3">
          <Label className="text-base font-medium text-gray-700 mb-2 block">{t("recipeManager.ingredient")} *</Label>
          <Select
            value={component.ingredientSku}
            onValueChange={(value) => onUpdate(index, 'ingredientSku', value)}
          >
            <SelectTrigger className="h-12 bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-blue-500 text-base">
              <SelectValue placeholder="Seleccionar ingrediente..." />
            </SelectTrigger>
            <SelectContent>
              {inventoryItems.map(item => (
                <SelectItem key={item.sku} value={item.sku}>
                  {item.name} ({item.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-base font-medium text-gray-700 mb-2 block">{t("recipeManager.quantity")} *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={component.qtyPerItemBase}
            onChange={(e) => onUpdate(index, 'qtyPerItemBase', parseFloat(e.target.value) || 0)}
            className="h-12 bg-white text-gray-900 border-gray-300 focus:border-blue-500 text-base"
            placeholder="0"
          />
          {item && (
            <p className="text-sm text-gray-500 mt-2">En {item.baseUnit}</p>
          )}
        </div>
        
        <div>
          <Label className="text-base font-medium text-gray-700 mb-2 block">{t("recipeManager.shrinkage")} %</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={component.wastePct}
            onChange={(e) => onUpdate(index, 'wastePct', parseFloat(e.target.value) || 0)}
            className="h-12 bg-white text-gray-900 border-gray-300 focus:border-blue-500 text-base"
            placeholder="5"
          />
        </div>
        
        <div>
          <Label className="text-base font-medium text-gray-700 mb-2 block">{t("recipeManager.totalCost")}</Label>
          <div className="h-12 flex items-center px-4 border rounded-md bg-gray-50 text-lg font-bold text-gray-900 border-gray-300">
            ${costWithWaste.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
