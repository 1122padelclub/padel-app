"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useModifiers } from "@/src/hooks/useModifiers"
import { usePromotions } from "@/src/hooks/usePromotions"
import type { MenuItem, OrderItem } from "@/src/types/menu"
import { Clock, Star, Flame, Leaf } from "lucide-react"

interface MenuItemCardWithModifiersProps {
  item: MenuItem
  onAddToCart: (orderItem: OrderItem) => void
}

export function MenuItemCardWithModifiers({ item, onAddToCart }: MenuItemCardWithModifiersProps) {
  const { getModifierGroupsByIds } = useModifiers(item.barId)
  const { getApplicablePromotions } = usePromotions(item.barId)

  const [quantity, setQuantity] = useState(1)
  const [selectedModifiers, setSelectedModifiers] = useState<{
    [groupId: string]: string[]
  }>({})
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [showCustomization, setShowCustomization] = useState(false)

  const modifierGroups = getModifierGroupsByIds(item.modifierGroupIds || [])

  const calculateTotalPrice = () => {
    let total = item.basePrice * quantity

    // Add modifier prices
    modifierGroups.forEach((group) => {
      const selectedModifierIds = selectedModifiers[group.id] || []
      selectedModifierIds.forEach((modifierId) => {
        const modifier = group.modifiers.find((m) => m.id === modifierId)
        if (modifier) {
          total += modifier.priceAdjustment * quantity
        }
      })
    })

    return total
  }

  const handleModifierChange = (groupId: string, modifierId: string, checked: boolean) => {
    const group = modifierGroups.find((g) => g.id === groupId)
    if (!group) return

    setSelectedModifiers((prev) => {
      const currentSelection = prev[groupId] || []

      if (group.allowMultiple) {
        // Multiple selection allowed
        if (checked) {
          if (currentSelection.length < group.maxSelections) {
            return { ...prev, [groupId]: [...currentSelection, modifierId] }
          }
        } else {
          return { ...prev, [groupId]: currentSelection.filter((id) => id !== modifierId) }
        }
      } else {
        // Single selection only
        if (checked) {
          return { ...prev, [groupId]: [modifierId] }
        } else {
          return { ...prev, [groupId]: [] }
        }
      }

      return prev
    })
  }

  const isValidSelection = () => {
    return modifierGroups.every((group) => {
      if (!group.isRequired) return true
      const selected = selectedModifiers[group.id] || []
      return selected.length >= group.minSelections
    })
  }

  const handleAddToCart = () => {
    if (!isValidSelection()) return

    // Build selected modifiers structure
    const selectedModifiersForOrder = modifierGroups
      .map((group) => ({
        groupId: group.id,
        groupName: group.name,
        modifiers: (selectedModifiers[group.id] || []).map((modifierId) => {
          const modifier = group.modifiers.find((m) => m.id === modifierId)!
          return {
            id: modifier.id,
            name: modifier.name,
            priceAdjustment: modifier.priceAdjustment,
          }
        }),
      }))
      .filter((group) => group.modifiers.length > 0)

    const orderItem: OrderItem = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      menuItemId: item.id,
      menuItem: item,
      quantity,
      basePrice: item.basePrice,
      selectedModifiers: selectedModifiersForOrder,
      appliedPromotions: [], // Will be calculated later
      totalPrice: calculateTotalPrice(),
      specialInstructions: specialInstructions || undefined,
    }

    onAddToCart(orderItem)

    // Reset form
    setQuantity(1)
    setSelectedModifiers({})
    setSpecialInstructions("")
    setShowCustomization(false)
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "popular":
        return <Star className="w-3 h-3" />
      case "spicy":
        return <Flame className="w-3 h-3" />
      case "vegetarian":
      case "vegan":
        return <Leaf className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <Card className="rounded-2xl hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="font-serif text-lg">{item.name}</CardTitle>
              {item.isAlcoholic && (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                  +18
                </Badge>
              )}
            </div>

            {/* Badges */}
            {item.badges && item.badges.length > 0 && (
              <div className="flex gap-1 mb-2">
                {item.badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs flex items-center gap-1">
                    {getBadgeIcon(badge)}
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {item.description && <CardDescription className="mt-1">{item.description}</CardDescription>}

            {/* Preparation time and allergens */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {item.preparationTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.preparationTime} min</span>
                </div>
              )}
              {item.allergens && item.allergens.length > 0 && <span>Alérgenos: {item.allergens.join(", ")}</span>}
            </div>
          </div>

          <div className="ml-2 text-right">
            <Badge variant="secondary" className="rounded-xl">
              €{item.basePrice.toFixed(2)}
            </Badge>
            {showCustomization && (
              <div className="mt-2 text-sm font-medium">Total: €{calculateTotalPrice().toFixed(2)}</div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {item.imageUrl && (
          <div className="rounded-xl overflow-hidden">
            <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-full h-32 object-cover" />
          </div>
        )}

        {!showCustomization ? (
          <div className="flex gap-2">
            {modifierGroups.length > 0 ? (
              <Button
                onClick={() => setShowCustomization(true)}
                variant="outline"
                className="flex-1 rounded-xl bg-transparent"
              >
                Personalizar
              </Button>
            ) : null}
            <Button
              onClick={() => {
                const simpleOrderItem: OrderItem = {
                  id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  menuItemId: item.id,
                  menuItem: item,
                  quantity: 1,
                  basePrice: item.basePrice,
                  selectedModifiers: [],
                  appliedPromotions: [],
                  totalPrice: item.basePrice,
                }
                onAddToCart(simpleOrderItem)
              }}
              className={`${modifierGroups.length > 0 ? "flex-1" : "w-full"} rounded-xl`}
            >
              Agregar €{item.basePrice.toFixed(2)}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quantity Selection */}
            <div className="flex items-center gap-4">
              <Label className="text-sm">Cantidad:</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-16 text-center rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Modifier Groups */}
            {modifierGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {group.name}
                    {group.isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                  </Label>
                  {group.description && <p className="text-xs text-muted-foreground mt-1">{group.description}</p>}
                </div>

                {group.allowMultiple ? (
                  // Multiple selection with checkboxes
                  <div className="space-y-2">
                    {group.modifiers.map((modifier) => (
                      <div key={modifier.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${group.id}-${modifier.id}`}
                          checked={(selectedModifiers[group.id] || []).includes(modifier.id)}
                          onCheckedChange={(checked) => handleModifierChange(group.id, modifier.id, checked as boolean)}
                          disabled={
                            !selectedModifiers[group.id]?.includes(modifier.id) &&
                            (selectedModifiers[group.id]?.length || 0) >= group.maxSelections
                          }
                        />
                        <Label
                          htmlFor={`${group.id}-${modifier.id}`}
                          className="text-sm flex-1 flex justify-between cursor-pointer"
                        >
                          <span>{modifier.name}</span>
                          <span className="text-muted-foreground">
                            {modifier.priceAdjustment > 0 && "+"}€{modifier.priceAdjustment.toFixed(2)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Single selection with radio buttons
                  <RadioGroup
                    value={(selectedModifiers[group.id] || [])[0] || ""}
                    onValueChange={(value) => {
                      setSelectedModifiers((prev) => ({
                        ...prev,
                        [group.id]: value ? [value] : [],
                      }))
                    }}
                  >
                    {group.modifiers.map((modifier) => (
                      <div key={modifier.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={modifier.id} id={`${group.id}-${modifier.id}`} />
                        <Label
                          htmlFor={`${group.id}-${modifier.id}`}
                          className="text-sm flex-1 flex justify-between cursor-pointer"
                        >
                          <span>{modifier.name}</span>
                          <span className="text-muted-foreground">
                            {modifier.priceAdjustment > 0 && "+"}€{modifier.priceAdjustment.toFixed(2)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label className="text-sm">Instrucciones especiales:</Label>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Ej: Sin cebolla, extra salsa..."
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCustomization(false)}
                variant="outline"
                className="flex-1 rounded-xl bg-transparent"
              >
                Cancelar
              </Button>
              <Button onClick={handleAddToCart} disabled={!isValidSelection()} className="flex-1 rounded-xl">
                Agregar €{calculateTotalPrice().toFixed(2)}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
