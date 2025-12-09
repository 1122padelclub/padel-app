# 📦 Sistema de Gestión de Inventarios - MatchTag

## 🎯 Descripción General

Sistema completo de gestión de inventarios integrado con MatchTag que permite controlar insumos, recetas, costos y consumo automático vinculado con las ventas.

## 🏗️ Arquitectura

### Estructura de Datos en Firestore

```
inventoryItems/
├── {itemId}
│   ├── barId: string
│   ├── sku: string
│   ├── name: string
│   ├── category: string
│   ├── baseUnit: string
│   ├── currentStockBase: number
│   ├── minStockBase: number
│   ├── costPerBaseUnit: number
│   └── ...

recipes/
├── {recipeId}  // recipeId = menuItemId
│   ├── barId: string
│   ├── menuItemId: string
│   ├── menuItemName: string
│   ├── totalCostPerItem: number
│   └── components/
│       ├── {componentId}
│       │   ├── ingredientSku: string
│       │   ├── ingredientName: string
│       │   ├── qtyPerItemBase: number
│       │   ├── wastePct: number
│       │   └── ...

inventoryMovements/
├── {movementId}
│   ├── barId: string
│   ├── itemId: string
│   ├── type: "purchase" | "sale" | "adjustment" | "waste" | "cancel"
│   ├── quantityBase: number
│   ├── balanceAfter: number
│   ├── reference: string (orderId, etc.)
│   └── ...
```

## 🚀 Funcionalidades Implementadas

### 1. Gestión de Inventario (`InventoryTable.tsx`)
- ✅ Crear, editar y eliminar insumos
- ✅ Búsqueda y filtrado por categoría
- ✅ Conversión automática de unidades
- ✅ Control de stock mínimo
- ✅ Alertas visuales de stock bajo/agotado
- ✅ Tracking de lotes y fechas de vencimiento
- ✅ Estadísticas en tiempo real

### 2. Gestor de Recetas (`RecipeManager.tsx`)
- ✅ Vincular ítems del menú con insumos
- ✅ Configurar cantidades y porcentaje de merma
- ✅ Cálculo automático de costos por receta
- ✅ Visualización de margen de ganancia
- ✅ Interfaz visual intuitiva

### 3. Historial de Movimientos (`InventoryMovements.tsx`)
- ✅ Registro manual de compras y ajustes
- ✅ Trazabilidad completa de movimientos
- ✅ Filtros por tipo y fecha
- ✅ Visualización de balance después de cada movimiento

### 4. Sistema de Alertas (`InventoryAlerts.tsx`)
- ✅ Alertas automáticas de stock bajo
- ✅ Alertas de productos agotados
- ✅ Alertas de vencimiento próximo
- ✅ Alertas de productos vencidos
- ✅ Clasificación por severidad (crítico, alto, medio, bajo)

### 5. Consumo Automático
- ✅ API route para procesar pedidos
- ✅ Descuento automático de inventario al confirmar pedido
- ✅ Reversión automática al cancelar pedido
- ✅ Registro de movimientos con referencia al pedido

## 📊 Cómo Usar el Sistema

### Paso 1: Crear Insumos
1. Ve a la pestaña "Inventario"
2. Haz clic en "Nuevo Insumo"
3. Completa los campos:
   - **SKU**: Código único (ej: ING-001)
   - **Nombre**: Nombre del insumo
   - **Categoría**: Tipo de producto
   - **Unidades**: Base y de compra
   - **Stock**: Actual y mínimo
   - **Costo**: Por unidad base

### Paso 2: Configurar Recetas
1. Ve a la subpestaña "Recetas"
2. Busca el ítem del menú
3. Haz clic en "Crear Receta" o "Editar Receta"
4. Agrega ingredientes con:
   - Insumo del inventario
   - Cantidad por porción
   - Porcentaje de merma (desperdicio)
5. El sistema calculará automáticamente:
   - Costo total de la receta
   - Margen de ganancia

### Paso 3: Registrar Movimientos
1. Ve a la subpestaña "Movimientos"
2. Haz clic en "Registrar Movimiento"
3. Selecciona:
   - Insumo
   - Tipo (compra, ajuste, merma)
   - Cantidad
   - Costo (si es compra)
4. El sistema actualizará el stock automáticamente

### Paso 4: Monitorear Alertas
1. Ve a la subpestaña "Alertas"
2. Revisa los productos con:
   - Stock crítico
   - Stock bajo
   - Próximos a vencer
   - Ya vencidos

## 🔄 Flujo de Consumo Automático

```
Cliente hace pedido → Pedido confirmado → API /inventory/process-order
                                                ↓
                           Busca recetas de los ítems vendidos
                                                ↓
                        Calcula consumo con fórmula de merma
                                                ↓
                          Descuenta stock de inventario
                                                ↓
                        Registra movimientos tipo "sale"
```

## 📐 Fórmulas de Cálculo

### Consumo de Inventario
```
consumo = cantidad_vendida × qty_por_item × (1 + merma% / 100)
```

### Costo de Receta
```
costo_ingrediente = qty_base × costo_por_unidad × (1 + merma% / 100)
costo_total = Σ costo_ingrediente
```

### Margen de Ganancia
```
margen% = ((precio_venta - costo_total) / precio_venta) × 100
```

## 🔧 API Endpoints

### POST /api/inventory/process-order
Procesa el descuento o reversión de inventario para un pedido.

**Request Body:**
```json
{
  "orderId": "order123",
  "barId": "bar456",
  "orderItems": [
    {
      "menuItemId": "item789",
      "name": "Hamburguesa",
      "quantity": 2
    }
  ],
  "action": "deduct" | "reverse"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inventory deducted successfully",
  "processed": [
    {
      "ingredient": "Carne molida",
      "consumed": 200,
      "newStock": 5000
    }
  ]
}
```

## 🎨 Componentes Creados

### Componentes UI
- `InventoryPanel.tsx` - Panel principal con tabs
- `InventoryTable.tsx` - Tabla de insumos
- `RecipeManager.tsx` - Gestor de recetas
- `InventoryMovements.tsx` - Historial de movimientos
- `InventoryAlerts.tsx` - Sistema de alertas

### Hooks
- `useInventory.ts` - Gestión de insumos y movimientos
- `useRecipes.ts` - Gestión de recetas y cálculo de costos

### Tipos
- `src/types/inventory.ts` - Todas las interfaces TypeScript

## 📋 Plantillas de Importación

### Estructura CSV para Inventario
```csv
sku,name,category,base_unit,purchase_unit,multiplier,current_stock,min_stock,cost_per_unit,supplier
ING-001,Harina de trigo,alimentos,g,kg,1000,5000,1000,0.005,Distribuidora ABC
ING-002,Aceite vegetal,alimentos,ml,l,1000,3000,500,0.008,Proveedor XYZ
```

### Estructura CSV para Recetas
```csv
menu_item_id,menu_item_name,ingredient_sku,ingredient_name,qty_per_item,waste_pct
item123,Hamburguesa Clásica,ING-001,Harina de trigo,100,5
item123,Hamburguesa Clásica,ING-003,Carne molida,150,10
```

## 🔐 Reglas de Seguridad de Firestore

```javascript
match /inventoryItems/{id} {
  allow read: if request.auth != null &&
              request.auth.token.barId == resource.data.barId;
  allow write: if request.auth != null &&
               request.auth.token.barId == resource.data.barId;
}

match /recipes/{id} {
  allow read: if request.auth != null &&
              request.auth.token.barId == resource.data.barId;
  allow write: if request.auth != null &&
               request.auth.token.barId == resource.data.barId;
}

match /inventoryMovements/{id} {
  allow read: if request.auth != null &&
              request.auth.token.barId == resource.data.barId;
  allow write: if request.auth != null &&
               request.auth.token.barId == resource.data.barId;
}
```

## 🎯 Próximos Pasos Sugeridos

1. **Importación/Exportación CSV** - Implementar componente InventoryUploadModal
2. **Órdenes de Compra** - Sistema para gestionar compras a proveedores
3. **Reportes de Costos** - Análisis de rentabilidad por producto
4. **Integración con Ventas** - Trigger automático en cambios de estado de pedidos
5. **Dashboard de Inventario** - Gráficos y métricas visuales

## 💡 Características Destacadas

- ✅ **Multi-Bar**: Cada bar tiene su propio inventario independiente
- ✅ **Tiempo Real**: Actualizaciones instantáneas con Firebase
- ✅ **Cálculos Automáticos**: Costos, márgenes y consumos
- ✅ **Alertas Inteligentes**: Notificaciones proactivas
- ✅ **Trazabilidad Completa**: Cada movimiento queda registrado
- ✅ **Interfaz Profesional**: Diseño moderno con Tailwind CSS

## 🐛 Troubleshooting

### Las recetas no se guardan
- Verifica que el menuItemId exista
- Revisa que los SKUs de ingredientes sean correctos
- Confirma los permisos de Firestore

### El stock no se descuenta automáticamente
- Verifica que exista una receta para el ítem vendido
- Confirma que la API route esté configurada correctamente
- Revisa los logs en la consola del navegador

### Las alertas no aparecen
- Confirma que el stock esté por debajo del mínimo
- Verifica que el componente esté montado correctamente
- Revisa el estado `isActive` de los items

## 📞 Soporte

Para más información o ayuda, consulta la documentación principal de MatchTag.

