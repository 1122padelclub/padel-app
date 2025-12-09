"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingDown,
  TrendingUp,
  Calendar
} from "lucide-react"
import { useInventory } from "@/src/hooks/useInventory"
import type { InventoryItem, UnitType, InventoryCategory } from "@/src/types/inventory"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useT } from "@/src/hooks/useTranslation"

interface InventoryTableProps {
  barId: string
}

export function InventoryTable({ barId }: InventoryTableProps) {
  const { items, loading, createItem, updateItem, deleteItem, searchItems } = useInventory(barId)
  const t = useT()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  // Formulario
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "alimentos" as InventoryCategory,
    baseUnit: "g" as UnitType,
    purchaseUnit: "kg" as UnitType,
    purchaseToBaseMultiplier: 1000,
    currentStockBase: 0,
    minStockBase: 0,
    maxStockBase: 0,
    costPerBaseUnit: 0,
    supplier: "",
    lotCode: "",
    expiryDate: "",
    notes: "",
    isActive: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
      barId,
      ...formData,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      lastRestockDate: new Date()
    }

    if (editingItem) {
      await updateItem(editingItem.id, itemData)
      setEditingItem(null)
    } else {
      await createItem(itemData)
    }

    resetForm()
    setIsCreateOpen(false)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      baseUnit: item.baseUnit,
      purchaseUnit: item.purchaseUnit,
      purchaseToBaseMultiplier: item.purchaseToBaseMultiplier,
      currentStockBase: item.currentStockBase,
      minStockBase: item.minStockBase,
      maxStockBase: item.maxStockBase || 0,
      costPerBaseUnit: item.costPerBaseUnit,
      supplier: item.supplier || "",
      lotCode: item.lotCode || "",
      expiryDate: item.expiryDate ? format(item.expiryDate, "yyyy-MM-dd") : "",
      notes: item.notes || "",
      isActive: item.isActive
    })
    setIsCreateOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (confirm("¿Estás seguro de eliminar este item del inventario?")) {
      await deleteItem(itemId)
    }
  }

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      category: "alimentos",
      baseUnit: "g",
      purchaseUnit: "kg",
      purchaseToBaseMultiplier: 1000,
      currentStockBase: 0,
      minStockBase: 0,
      maxStockBase: 0,
      costPerBaseUnit: 0,
      supplier: "",
      lotCode: "",
      expiryDate: "",
      notes: "",
      isActive: true
    })
    setEditingItem(null)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStockBase <= 0) {
      return { color: "bg-red-100 text-red-800 border-red-200", text: t("admin.outOfStock"), icon: <AlertTriangle className="h-3 w-3" /> }
    }
    if (item.currentStockBase <= item.minStockBase) {
      return { color: "bg-orange-100 text-orange-800 border-orange-200", text: t("admin.lowStock"), icon: <TrendingDown className="h-3 w-3" /> }
    }
    return { color: "bg-green-100 text-green-800 border-green-200", text: t("admin.normal"), icon: <TrendingUp className="h-3 w-3" /> }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  if (loading) {
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("admin.inventoryItems")}
              </CardTitle>
              <CardDescription>{t("admin.manageStockAndRawMaterials")}</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
              setIsCreateOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("admin.newItem")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? t("admin.editItem") : t("admin.createNewItem")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">{t("admin.skuCode")} *</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                        placeholder="Ej: ING-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">{t("admin.supplyName")} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Ej: Harina de trigo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">{t("admin.category")} *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value: InventoryCategory) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bebidas">Bebidas</SelectItem>
                          <SelectItem value="alimentos">Alimentos</SelectItem>
                          <SelectItem value="suministros">Suministros</SelectItem>
                          <SelectItem value="limpieza">Limpieza</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="supplier">{t("admin.supplier")}</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="Ej: Distribuidora XYZ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="baseUnit">{t("admin.baseUnit")} *</Label>
                      <Select 
                        value={formData.baseUnit} 
                        onValueChange={(value: UnitType) => setFormData({ ...formData, baseUnit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">Gramos (g)</SelectItem>
                          <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                          <SelectItem value="ml">Mililitros (ml)</SelectItem>
                          <SelectItem value="l">Litros (l)</SelectItem>
                          <SelectItem value="unidad">Unidad</SelectItem>
                          <SelectItem value="oz">Onzas (oz)</SelectItem>
                          <SelectItem value="lb">Libras (lb)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="purchaseUnit">{t("admin.purchaseUnit")} *</Label>
                      <Select 
                        value={formData.purchaseUnit} 
                        onValueChange={(value: UnitType) => setFormData({ ...formData, purchaseUnit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">Gramos (g)</SelectItem>
                          <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                          <SelectItem value="ml">Mililitros (ml)</SelectItem>
                          <SelectItem value="l">Litros (l)</SelectItem>
                          <SelectItem value="unidad">Unidad</SelectItem>
                          <SelectItem value="oz">Onzas (oz)</SelectItem>
                          <SelectItem value="lb">Libras (lb)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="multiplier">{t("admin.multiplier")} *</Label>
                      <Input
                        id="multiplier"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.purchaseToBaseMultiplier}
                        onChange={(e) => setFormData({ ...formData, purchaseToBaseMultiplier: parseFloat(e.target.value) })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">1 {formData.purchaseUnit} = {formData.purchaseToBaseMultiplier} {formData.baseUnit}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currentStock">{t("admin.currentStock")} *</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.currentStockBase}
                        onChange={(e) => setFormData({ ...formData, currentStockBase: parseFloat(e.target.value) })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{t("admin.in")} {formData.baseUnit}</p>
                    </div>
                    <div>
                      <Label htmlFor="minStock">{t("admin.minStock")} *</Label>
                      <Input
                        id="minStock"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minStockBase}
                        onChange={(e) => setFormData({ ...formData, minStockBase: parseFloat(e.target.value) })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{t("admin.alertWhenReachesThisLevel")}</p>
                    </div>
                    <div>
                      <Label htmlFor="costPerUnit">{t("admin.costPer")} {formData.baseUnit} *</Label>
                      <Input
                        id="costPerUnit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.costPerBaseUnit}
                        onChange={(e) => setFormData({ ...formData, costPerBaseUnit: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lotCode">{t("admin.lotCode")}</Label>
                      <Input
                        id="lotCode"
                        value={formData.lotCode}
                        onChange={(e) => setFormData({ ...formData, lotCode: e.target.value })}
                        placeholder="Ej: LOTE-2025-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">{t("admin.expiryDate")}</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">{t("admin.notes")}</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Información adicional..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsCreateOpen(false)
                      resetForm()
                    }}>
                      {t("admin.cancel")}
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingItem ? t("admin.update") : t("admin.create")} {t("admin.item")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("admin.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="bebidas">Bebidas</SelectItem>
                <SelectItem value="alimentos">Alimentos</SelectItem>
                <SelectItem value="suministros">Suministros</SelectItem>
                <SelectItem value="limpieza">Limpieza</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.sku")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.product")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.category")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.stock")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.status")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.costPerUnit")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.supplier")}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No hay insumos en el inventario</p>
                      <p className="text-sm">Crea tu primer insumo para comenzar</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const status = getStockStatus(item)
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.sku}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.lotCode && (
                              <div className="text-xs text-gray-500">Lote: {item.lotCode}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                          >
                            {item.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {item.currentStockBase.toFixed(2)} {item.baseUnit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Mín: {item.minStockBase.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                            {status.icon}
                            {status.text}
                          </Badge>
                          {item.expiryDate && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vence: {format(item.expiryDate, "dd/MM/yyyy", { locale: es })}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${item.costPerBaseUnit.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.supplier || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Estadísticas */}
          {items.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">{t("admin.totalSupplies")}</div>
                  <div className="text-2xl font-bold text-gray-900">{items.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">{t("admin.lowStock")}</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {items.filter(i => i.currentStockBase <= i.minStockBase && i.currentStockBase > 0).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">{t("admin.outOfStock")}</div>
                  <div className="text-2xl font-bold text-red-600">
                    {items.filter(i => i.currentStockBase <= 0).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">{t("admin.totalValue")}</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${items.reduce((sum, i) => sum + (i.currentStockBase * i.costPerBaseUnit), 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

