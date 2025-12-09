"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Plus, Settings } from "lucide-react"
import type { MenuItemSpecification } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface MenuItemSpecificationsProps {
  specifications: MenuItemSpecification[]
  onChange: (specifications: MenuItemSpecification[]) => void
}

export function MenuItemSpecifications({ specifications, onChange }: MenuItemSpecificationsProps) {
  const t = useT()
  const [editingSpec, setEditingSpec] = useState<MenuItemSpecification | null>(null)
  const [isAddingSpec, setIsAddingSpec] = useState(false)

  const addSpecification = () => {
    const newSpec: MenuItemSpecification = {
      id: `spec_${Date.now()}`,
      name: "",
      type: "single",
      required: true,
      minSelections: 1,
      maxSelections: 1,
      options: []
    }
    setEditingSpec(newSpec)
    setIsAddingSpec(true)
  }

  const editSpecification = (spec: MenuItemSpecification) => {
    setEditingSpec(spec)
    setIsAddingSpec(false)
  }

  const saveSpecification = (specData: MenuItemSpecification) => {
    if (isAddingSpec) {
      onChange([...specifications, specData])
    } else {
      onChange(specifications.map(s => s.id === specData.id ? specData : s))
    }
    setEditingSpec(null)
    setIsAddingSpec(false)
  }

  const deleteSpecification = (specId: string) => {
    onChange(specifications.filter(s => s.id !== specId))
  }

  const addOption = (specId: string) => {
    const spec = specifications.find(s => s.id === specId)
    if (!spec) return

    const newOption = {
      id: `option_${Date.now()}`,
      name: "",
      priceModifier: 0
    }

    const updatedSpec = {
      ...spec,
      options: [...spec.options, newOption]
    }

    onChange(specifications.map(s => s.id === specId ? updatedSpec : s))
  }

  const updateOption = (specId: string, optionId: string, field: string, value: any) => {
    const spec = specifications.find(s => s.id === specId)
    if (!spec) return

    const updatedOptions = spec.options.map(option =>
      option.id === optionId ? { ...option, [field]: value } : option
    )

    const updatedSpec = {
      ...spec,
      options: updatedOptions
    }

    onChange(specifications.map(s => s.id === specId ? updatedSpec : s))
  }

  const deleteOption = (specId: string, optionId: string) => {
    const spec = specifications.find(s => s.id === specId)
    if (!spec) return

    const updatedOptions = spec.options.filter(option => option.id !== optionId)
    const updatedSpec = {
      ...spec,
      options: updatedOptions
    }

    onChange(specifications.map(s => s.id === specId ? updatedSpec : s))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{t("admin.dishSpecifications")}</h3>
        <Button 
          type="button" 
          onClick={addSpecification} 
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.addSpecification")}
        </Button>
      </div>

      {specifications.length === 0 ? (
        <Card className="border-dashed border-gray-600 bg-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Settings className="h-8 w-8 mb-2 text-gray-400" />
            <p className="text-center text-gray-400">
              {t("admin.noSpecificationsConfigured")}
              <br />
              {t("admin.addSpecificationsLikeMeatDoneness")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {specifications.map((spec) => (
            <Card 
              key={spec.id}
              className="border border-gray-600 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-white">{spec.name}</CardTitle>
                    <Badge 
                      variant={spec.required ? "default" : "secondary"}
                      className={spec.required ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"}
                    >
                      {spec.required ? t("admin.required") : t("admin.optional")}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className="bg-gray-600 text-gray-200 border-gray-500"
                    >
                      {spec.type === "single" ? t("admin.singleOption") : t("admin.multipleOptions")}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editSpecification(spec)}
                      className="border-gray-500 text-gray-200 hover:bg-gray-700"
                    >
                      {t("admin.edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSpecification(spec.id)}
                      className="border-red-500 text-red-300 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    {t("admin.selection")}: {spec.minSelections} - {spec.maxSelections} {t("admin.options")}
                  </p>
                  <div className="space-y-1">
                    {spec.options.map((option) => (
                      <div 
                        key={option.id} 
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition-colors bg-gray-700"
                      >
                        <span className="text-sm flex-1 text-gray-200">{option.name}</span>
                        {option.priceModifier !== 0 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-gray-600 text-gray-200 border-gray-500"
                          >
                            {option.priceModifier > 0 ? "+" : ""}${option.priceModifier}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editingSpec && (
        <SpecificationEditor
          specification={editingSpec}
          onSave={saveSpecification}
          onCancel={() => {
            setEditingSpec(null)
            setIsAddingSpec(false)
          }}
          onAddOption={addOption}
          onUpdateOption={updateOption}
          onDeleteOption={deleteOption}
        />
      )}
    </div>
  )
}

interface SpecificationEditorProps {
  specification: MenuItemSpecification
  onSave: (spec: MenuItemSpecification) => void
  onCancel: () => void
  onAddOption: (specId: string) => void
  onUpdateOption: (specId: string, optionId: string, field: string, value: any) => void
  onDeleteOption: (specId: string, optionId: string) => void
}

function SpecificationEditor({
  specification,
  onSave,
  onCancel,
  onAddOption,
  onUpdateOption,
  onDeleteOption
}: SpecificationEditorProps) {
  const t = useT()
  const [specData, setSpecData] = useState<MenuItemSpecification>(specification)

  // Sincronizar el estado local cuando cambie la especificación del padre
  React.useEffect(() => {
    setSpecData(specification)
  }, [specification])

  const handleAddOption = () => {
    const newOption = {
      id: `option_${Date.now()}`,
      name: "",
      priceModifier: 0
    }

    setSpecData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }))
  }

  const handleUpdateOption = (optionId: string, field: string, value: any) => {
    setSpecData(prev => ({
      ...prev,
      options: prev.options.map(option =>
        option.id === optionId ? { ...option, [field]: value } : option
      )
    }))
  }

  const handleDeleteOption = (optionId: string) => {
    setSpecData(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== optionId)
    }))
  }

  const handleSave = () => {
    if (!specData.name.trim()) {
      alert(t("admin.specificationNameRequired"))
      return
    }

    if (specData.options.length === 0) {
      alert(t("admin.mustAddAtLeastOneOption"))
      return
    }

    if (specData.minSelections > specData.maxSelections) {
      alert(t("admin.minSelectionCannotBeGreaterThanMax"))
      return
    }

    onSave(specData)
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700"
      >
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold">
            {specification.id.startsWith('spec_') ? t("admin.addSpecificationTitle") : t("admin.editSpecificationTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spec-name" className="text-gray-200 font-medium">{t("admin.specificationName")}</Label>
            <Input
              id="spec-name"
              value={specData.name}
              onChange={(e) => setSpecData({ ...specData, name: e.target.value })}
              placeholder={t("admin.specificationNamePlaceholder")}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spec-type" className="text-gray-200 font-medium">{t("admin.selectionType")}</Label>
              <Select
                value={specData.type}
                onValueChange={(value: "single" | "multiple") =>
                  setSpecData({ ...specData, type: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="single" className="text-white hover:bg-gray-700">{t("admin.singleOption")}</SelectItem>
                  <SelectItem value="multiple" className="text-white hover:bg-gray-700">{t("admin.multipleOptions")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="spec-required"
                  checked={specData.required}
                  onCheckedChange={(checked) =>
                    setSpecData({ ...specData, required: checked })
                  }
                />
                <Label htmlFor="spec-required" className="text-gray-200 font-medium">{t("admin.required")}</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spec-min" className="text-gray-200 font-medium">{t("admin.minimumSelections")}</Label>
              <Input
                id="spec-min"
                type="number"
                min="0"
                value={specData.minSelections}
                onChange={(e) =>
                  setSpecData({ ...specData, minSelections: parseInt(e.target.value) || 0 })
                }
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spec-max" className="text-gray-200 font-medium">{t("admin.maximumSelections")}</Label>
              <Input
                id="spec-max"
                type="number"
                min="1"
                value={specData.maxSelections}
                onChange={(e) =>
                  setSpecData({ ...specData, maxSelections: parseInt(e.target.value) || 1 })
                }
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-200 font-medium">{t("admin.availableOptions")}</Label>
              <Button
                type="button"
                size="sm"
                onClick={handleAddOption}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("admin.addOption")}
              </Button>
            </div>

            <div className="space-y-2">
              {specData.options.map((option, index) => (
                <div 
                  key={option.id} 
                  className="flex gap-2 p-3 border border-gray-600 rounded bg-gray-800"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      value={option.name}
                      onChange={(e) =>
                        handleUpdateOption(option.id, "name", e.target.value)
                      }
                      placeholder={`${t("admin.option")} ${index + 1}`}
                      className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                    <Input
                      type="number"
                      value={option.priceModifier || 0}
                      onChange={(e) =>
                        handleUpdateOption(option.id, "priceModifier", parseFloat(e.target.value) || 0)
                      }
                      placeholder={t("admin.priceModifier")}
                      className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOption(option.id)}
                    className="border-red-300/30 text-red-200 hover:bg-red-500/10"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
                      borderColor: 'rgba(239, 68, 68, 0.3) !important',
                      color: '#fca5a5 !important',
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {t("admin.save")}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
