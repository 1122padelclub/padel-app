"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { MenuItemSpecification, OrderItemSpecification } from "@/src/types"

interface ItemSpecificationsSelectorProps {
  specifications: MenuItemSpecification[]
  selectedSpecifications: OrderItemSpecification[]
  onSpecificationsChange: (specifications: OrderItemSpecification[]) => void
}

export function ItemSpecificationsSelector({
  specifications,
  selectedSpecifications,
  onSpecificationsChange
}: ItemSpecificationsSelectorProps) {
  const [localSelections, setLocalSelections] = useState<{[specId: string]: string[]}>(() => {
    const initial: {[specId: string]: string[]} = {}
    selectedSpecifications.forEach(spec => {
      initial[spec.specificationId] = spec.selectedOptions.map(opt => opt.optionId)
    })
    return initial
  })

  const handleSpecificationChange = (specId: string, optionId: string, checked: boolean) => {
    const spec = specifications.find(s => s.id === specId)
    if (!spec) return

    setLocalSelections(prev => {
      const currentSelections = prev[specId] || []
      let newSelections: string[]

      if (spec.type === "single") {
        // Solo una opción permitida
        newSelections = checked ? [optionId] : []
      } else {
        // Múltiples opciones permitidas
        if (checked) {
          newSelections = [...currentSelections, optionId]
          // Verificar límite máximo
          if (newSelections.length > spec.maxSelections) {
            newSelections = newSelections.slice(-spec.maxSelections)
          }
        } else {
          newSelections = currentSelections.filter(id => id !== optionId)
        }
      }

      const updated = { ...prev, [specId]: newSelections }
      
      // Convertir a OrderItemSpecification y notificar al padre
      const orderSpecs: OrderItemSpecification[] = specifications.map(spec => {
        const selectedOptionIds = updated[spec.id] || []
        const selectedOptions = selectedOptionIds.map(optionId => {
          const option = spec.options.find(opt => opt.id === optionId)
          return {
            optionId,
            optionName: option?.name || '',
            priceModifier: option?.priceModifier || 0
          }
        }).filter(opt => opt.optionName) // Solo incluir opciones válidas

        return {
          specificationId: spec.id,
          specificationName: spec.name,
          selectedOptions
        }
      }).filter(spec => spec.selectedOptions.length > 0) // Solo incluir especificaciones con opciones seleccionadas

      onSpecificationsChange(orderSpecs)
      return updated
    })
  }

  const getTotalPriceModifier = () => {
    return selectedSpecifications.reduce((total, spec) => {
      return total + spec.selectedOptions.reduce((specTotal, option) => {
        return specTotal + (option.priceModifier || 0)
      }, 0)
    }, 0)
  }

  if (specifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm" style={{ color: "var(--mt-text)" }}>Especificaciones:</h4>
      {specifications.map((spec) => {
        const currentSelections = localSelections[spec.id] || []
        const isRequired = spec.required
        const hasValidSelection = currentSelections.length >= spec.minSelections && 
                                 currentSelections.length <= spec.maxSelections

        return (
          <Card 
            key={spec.id} 
            className={`backdrop-blur-md border border-white/20 ${
              isRequired && !hasValidSelection 
                ? 'border-red-300/50 bg-red-500/10' 
                : 'bg-white/10 hover:bg-white/15'
            }`}
            style={{
              backgroundColor: isRequired && !hasValidSelection 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              borderColor: isRequired && !hasValidSelection 
                ? 'rgba(239, 68, 68, 0.3)' 
                : 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: "var(--mt-text)" }}>
                {spec.name}
                {isRequired && (
                  <Badge 
                    variant="destructive" 
                    className="text-xs bg-red-500/20 text-red-200 border-red-400/30"
                  >
                    Obligatorio
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className="text-xs bg-white/10 text-white/80 border-white/30"
                >
                  {spec.type === "single" ? "Una opción" : "Múltiples opciones"}
                </Badge>
              </CardTitle>
              {spec.minSelections !== spec.maxSelections && (
                <p className="text-xs" style={{ color: "var(--mt-text)", opacity: 0.7 }}>
                  Selecciona entre {spec.minSelections} y {spec.maxSelections} opciones
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {spec.type === "single" ? (
                <RadioGroup
                  value={currentSelections[0] || ""}
                  onValueChange={(value) => handleSpecificationChange(spec.id, value, true)}
                >
                  {spec.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <RadioGroupItem 
                        value={option.id} 
                        id={`${spec.id}-${option.id}`}
                        className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/50"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                      />
                      <Label 
                        htmlFor={`${spec.id}-${option.id}`} 
                        className="flex-1 cursor-pointer"
                        style={{ color: "var(--mt-text)" }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.name}</span>
                          {option.priceModifier !== 0 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-white/10 text-white/80 border-white/30"
                            >
                              {option.priceModifier > 0 ? "+" : ""}${option.priceModifier}
                            </Badge>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {spec.options.map((option) => {
                    const isChecked = currentSelections.includes(option.id)
                    const canSelect = isChecked || currentSelections.length < spec.maxSelections
                    
                    return (
                      <div key={option.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <Checkbox
                          id={`${spec.id}-${option.id}`}
                          checked={isChecked}
                          disabled={!canSelect}
                          onCheckedChange={(checked) => 
                            handleSpecificationChange(spec.id, option.id, checked as boolean)
                          }
                          className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/50"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          }}
                        />
                        <Label 
                          htmlFor={`${spec.id}-${option.id}`} 
                          className={`flex-1 cursor-pointer ${!canSelect ? 'opacity-50' : ''}`}
                          style={{ color: "var(--mt-text)" }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.name}</span>
                            {option.priceModifier !== 0 && (
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-white/10 text-white/80 border-white/30"
                              >
                                {option.priceModifier > 0 ? "+" : ""}${option.priceModifier}
                              </Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
              
              {isRequired && !hasValidSelection && (
                <p className="text-xs mt-2" style={{ color: '#ef4444' }}>
                  {spec.minSelections === spec.maxSelections 
                    ? `Debes seleccionar ${spec.minSelections} opción${spec.minSelections > 1 ? 'es' : ''}`
                    : `Debes seleccionar entre ${spec.minSelections} y ${spec.maxSelections} opciones`
                  }
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
      
      {getTotalPriceModifier() !== 0 && (
        <div className="text-sm font-medium text-right p-3 rounded-lg bg-white/5 border border-white/10">
          <span style={{ color: "var(--mt-text)", opacity: 0.7 }}>Modificador de precio: </span>
          <span style={{ color: getTotalPriceModifier() > 0 ? '#10b981' : '#ef4444' }}>
            {getTotalPriceModifier() > 0 ? '+' : ''}${getTotalPriceModifier().toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}
