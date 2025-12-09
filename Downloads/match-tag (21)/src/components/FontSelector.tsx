"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FONT_OPTIONS, FONT_CATEGORIES, type FontOption } from "@/src/constants/fonts"

interface FontSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
}

export function FontSelector({ 
  value, 
  onChange, 
  label = "Seleccionar Fuente",
  placeholder = "Elige una fuente...",
  className = ""
}: FontSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<FontOption['category']>('sans-serif')

  const selectedFont = FONT_OPTIONS.find(font => font.value === value)
  const fontsInCategory = FONT_OPTIONS.filter(font => font.category === selectedCategory)

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      {/* Vista previa de la fuente seleccionada */}
      {selectedFont && (
        <div className="p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Vista previa:</span>
            <Badge variant="secondary" className="text-xs">
              {FONT_CATEGORIES[selectedFont.category]}
            </Badge>
          </div>
          <div 
            className="text-lg font-medium"
            style={{ fontFamily: selectedFont.value }}
          >
            {selectedFont.label} - {selectedFont.description}
          </div>
        </div>
      )}

      {/* Selector de categorías */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as FontOption['category'])}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sans-serif">Sans-serif</TabsTrigger>
          <TabsTrigger value="serif">Serif</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="handwriting">Handwriting</TabsTrigger>
          <TabsTrigger value="monospace">Monospace</TabsTrigger>
        </TabsList>

        {Object.keys(FONT_CATEGORIES).map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {fontsInCategory.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span 
                          className="font-medium"
                          style={{ fontFamily: font.value }}
                        >
                          {font.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {font.description}
                        </span>
                      </div>
                      {font.googleFont && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Google
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>
        ))}
      </Tabs>

      {/* Información adicional */}
      <div className="text-xs text-muted-foreground">
        <p>💡 Las fuentes de Google se cargarán automáticamente</p>
        <p>🎨 Puedes cambiar la categoría para ver más opciones</p>
      </div>
    </div>
  )
}





