"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { MenuItem } from "@/src/types"

interface OrderCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem, quantity: number, notes?: string) => void
}

export function OrderCard({ item, onAddToCart }: OrderCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [showDetails, setShowDetails] = useState(false)

  const handleAddToCart = () => {
    const finalPrice = item.promotionPrice || item.price
    onAddToCart({ ...item, price: finalPrice }, quantity, notes || undefined)
    setQuantity(1)
    setNotes("")
    setShowDetails(false)
  }

  return (
    <Card className="rounded-2xl hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="font-serif text-lg">{item.name}</CardTitle>
              {item.promotion && (
                <Badge variant="outline" className="rounded-lg bg-orange-100 text-orange-800 border-orange-200 text-xs">
                  {item.promotion}
                </Badge>
              )}
            </div>
            {item.description && <CardDescription className="mt-1">{item.description}</CardDescription>}
          </div>
          <div className="ml-2 flex flex-col items-end">
            {item.promotionPrice ? (
              <>
                <Badge variant="secondary" className="rounded-xl line-through text-xs mb-1">
                  ${(item.price || 0).toFixed(2)}
                </Badge>
                <Badge variant="default" className="rounded-xl bg-green-600">
                  ${(item.promotionPrice || 0).toFixed(2)}
                </Badge>
              </>
            ) : (
              <Badge variant="secondary" className="rounded-xl">
                ${(item.price || 0).toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {item.imageUrl && (
          <div className="rounded-xl overflow-hidden">
            <img
              src={item.imageUrl || "/placeholder.svg?height=120&width=200&query=food item"}
              alt={item.name}
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {!showDetails ? (
          <div className="flex gap-2">
            <Button onClick={() => setShowDetails(true)} variant="outline" className="flex-1 rounded-xl bg-transparent">
              Personalizar
            </Button>
            <Button
              onClick={() => onAddToCart({ ...item, price: item.promotionPrice || item.price }, 1)}
              className="flex-1 rounded-xl"
            >
              Pedir
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor={`quantity-${item.id}`} className="text-sm">
                Cantidad:
              </Label>
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
                  id={`quantity-${item.id}`}
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

            <div className="space-y-2">
              <Label htmlFor={`notes-${item.id}`} className="text-sm">
                Notas especiales:
              </Label>
              <Textarea
                id={`notes-${item.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Sin cebolla, extra salsa..."
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowDetails(false)}
                variant="outline"
                className="flex-1 rounded-xl bg-transparent"
              >
                Cancelar
              </Button>
              <Button onClick={handleAddToCart} className="flex-1 rounded-xl">
                Agregar (${((item.promotionPrice || item.price || 0) * quantity).toFixed(2)})
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
