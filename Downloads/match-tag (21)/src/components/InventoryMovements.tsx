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
  History, 
  Plus, 
  Minus, 
  RefreshCw, 
  Trash, 
  ShoppingCart,
  ArrowRight,
  Calendar,
  DollarSign
} from "lucide-react"
import { useInventory } from "@/src/hooks/useInventory"
import type { MovementType } from "@/src/types/inventory"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useT } from "@/src/hooks/useTranslation"

interface InventoryMovementsProps {
  barId: string
}

export function InventoryMovements({ barId }: InventoryMovementsProps) {
  const t = useT()
  const { items, movements, recordMovement, loading } = useInventory(barId)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [isRecordingMovement, setIsRecordingMovement] = useState(false)

  // Formulario de movimiento
  const [movementForm, setMovementForm] = useState({
    itemId: "",
    type: "purchase" as MovementType,
    quantity: 0,
    costPerUnit: 0,
    reason: "",
    reference: "",
    notes: ""
  })

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault()

    const item = items.find(i => i.id === movementForm.itemId)
    if (!item) return

    const quantityBase = movementForm.type === 'purchase' || movementForm.type === 'adjustment'
      ? movementForm.quantity
      : -movementForm.quantity

    await recordMovement(
      movementForm.itemId,
      movementForm.type,
      quantityBase,
      {
        costPerUnit: movementForm.costPerUnit > 0 ? movementForm.costPerUnit : undefined,
        reason: movementForm.reason,
        reference: movementForm.reference,
        notes: movementForm.notes
      }
    )

    setIsRecordingMovement(false)
    resetMovementForm()
  }

  const resetMovementForm = () => {
    setMovementForm({
      itemId: "",
      type: "purchase",
      quantity: 0,
      costPerUnit: 0,
      reason: "",
      reference: "",
      notes: ""
    })
  }

  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="h-4 w-4 text-green-600" />
      case 'sale':
        return <Minus className="h-4 w-4 text-blue-600" />
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-orange-600" />
      case 'waste':
        return <Trash className="h-4 w-4 text-red-600" />
      case 'cancel':
        return <ArrowRight className="h-4 w-4 text-purple-600" />
      case 'transfer':
        return <ArrowRight className="h-4 w-4 text-blue-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementColor = (type: MovementType) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'sale':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'adjustment':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'waste':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancel':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'transfer':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMovementText = (type: MovementType) => {
    switch (type) {
      case 'purchase':
        return 'Compra'
      case 'sale':
        return 'Venta'
      case 'adjustment':
        return 'Ajuste'
      case 'waste':
        return 'Merma'
      case 'cancel':
        return 'Cancelación'
      case 'transfer':
        return 'Transferencia'
      default:
        return type
    }
  }

  const filteredMovements = movements.filter(movement => {
    const matchesType = typeFilter === "all" || movement.type === typeFilter
    const matchesDate = !dateFilter || format(movement.createdAt, "yyyy-MM-dd") === dateFilter
    return matchesType && matchesDate
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Movimientos de Inventario
            </CardTitle>
            <CardDescription>Historial de entradas, salidas y ajustes</CardDescription>
          </div>
          <Dialog open={isRecordingMovement} onOpenChange={setIsRecordingMovement}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecordMovement} className="space-y-4">
                <div>
                  <Label htmlFor="item">Insumo *</Label>
                  <Select 
                    value={movementForm.itemId} 
                    onValueChange={(value) => setMovementForm({ ...movementForm, itemId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar insumo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.sku}) - Stock: {(item.currentStockBase || 0).toFixed(2)} {item.baseUnit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo de Movimiento *</Label>
                    <Select 
                      value={movementForm.type} 
                      onValueChange={(value: MovementType) => setMovementForm({ ...movementForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Compra</SelectItem>
                        <SelectItem value="adjustment">Ajuste</SelectItem>
                        <SelectItem value="waste">Merma</SelectItem>
                        <SelectItem value="transfer">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Cantidad *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={movementForm.quantity}
                      onChange={(e) => setMovementForm({ ...movementForm, quantity: parseFloat(e.target.value) })}
                      required
                    />
                    {movementForm.itemId && (
                      <p className="text-xs text-gray-500 mt-1">
                        En {items.find(i => i.id === movementForm.itemId)?.baseUnit}
                      </p>
                    )}
                  </div>
                </div>

                {movementForm.type === 'purchase' && (
                  <div>
                    <Label htmlFor="costPerUnit">Costo por Unidad</Label>
                    <Input
                      id="costPerUnit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={movementForm.costPerUnit}
                      onChange={(e) => setMovementForm({ ...movementForm, costPerUnit: parseFloat(e.target.value) })}
                      placeholder="Costo unitario"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reason">Razón</Label>
                    <Input
                      id="reason"
                      value={movementForm.reason}
                      onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                      placeholder="Ej: Restock mensual"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Referencia</Label>
                    <Input
                      id="reference"
                      value={movementForm.reference}
                      onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
                      placeholder="Ej: PO-2025-001"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    value={movementForm.notes}
                    onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                    placeholder="Información adicional..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsRecordingMovement(false)
                    resetMovementForm()
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Registrar Movimiento
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de movimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="purchase">Compras</SelectItem>
              <SelectItem value="sale">Ventas</SelectItem>
              <SelectItem value="adjustment">Ajustes</SelectItem>
              <SelectItem value="waste">Mermas</SelectItem>
              <SelectItem value="cancel">Cancelaciones</SelectItem>
              <SelectItem value="transfer">Transferencias</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[200px]"
          />
        </div>

        {/* Tabla de movimientos */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Razón</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay movimientos registrados</p>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(movement.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getMovementColor(movement.type)} flex items-center gap-1 w-fit`}>
                        {getMovementIcon(movement.type)}
                        {getMovementText(movement.type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{movement.itemName}</div>
                      <div className="text-xs text-gray-500">{movement.itemSku}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm font-bold ${
                        movement.quantityBase >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantityBase >= 0 ? '+' : ''}{(movement.quantityBase || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(movement.balanceAfter || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {movement.totalCost ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {(movement.totalCost || 0).toFixed(2)}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {movement.reason || movement.reference || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Estadísticas de movimientos */}
        {movements.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total de Movimientos</div>
                <div className="text-2xl font-bold text-gray-900">{filteredMovements.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Compras (Mes)</div>
                <div className="text-2xl font-bold text-green-600">
                  {movements.filter(m => {
                    const isCurrentMonth = new Date(m.createdAt).getMonth() === new Date().getMonth()
                    return m.type === 'purchase' && isCurrentMonth
                  }).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Ventas (Mes)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {movements.filter(m => {
                    const isCurrentMonth = new Date(m.createdAt).getMonth() === new Date().getMonth()
                    return m.type === 'sale' && isCurrentMonth
                  }).length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

