# 🚀 Inicio Rápido - Sistema de Inventarios

## ✅ Componentes Creados

### Tipos y Modelos
- ✅ `src/types/inventory.ts` - Interfaces TypeScript completas

### Hooks
- ✅ `src/hooks/useInventory.ts` - Gestión de insumos
- ✅ `src/hooks/useRecipes.ts` - Gestión de recetas

### Componentes UI
- ✅ `src/components/InventoryPanel.tsx` - Panel principal
- ✅ `src/components/InventoryTable.tsx` - Tabla de insumos
- ✅ `src/components/RecipeManager.tsx` - Gestor de recetas
- ✅ `src/components/InventoryMovements.tsx` - Historial
- ✅ `src/components/InventoryAlerts.tsx` - Sistema de alertas

### API Routes
- ✅ `app/api/inventory/process-order/route.ts` - Procesamiento automático

### Documentación
- ✅ `INVENTORY_SYSTEM.md` - Documentación completa
- ✅ `firestore.rules` - Reglas de seguridad actualizadas

## 📝 Pasos para Activar

### 1. Actualizar Reglas de Firestore
```bash
firebase deploy --only firestore:rules
```

### 2. Acceder al Panel de Inventario
1. Ve al panel de administración
2. Busca la pestaña "Inventario" (icono de paquete 📦)
3. Explora las 4 subpestañas:
   - **Inventario**: Gestionar insumos
   - **Recetas**: Vincular menú con insumos
   - **Movimientos**: Ver historial
   - **Alertas**: Monitorear stock

### 3. Crear tu Primer Insumo
1. Haz clic en "Nuevo Insumo"
2. Completa el formulario:
   ```
   SKU: HAR-001
   Nombre: Harina de trigo
   Categoría: Alimentos
   Unidad Base: g (gramos)
   Unidad de Compra: kg (kilogramos)
   Multiplicador: 1000 (1 kg = 1000 g)
   Stock Actual: 5000 g
   Stock Mínimo: 1000 g
   Costo por g: $0.005
   ```
3. Haz clic en "Crear Insumo"

### 4. Configurar una Receta
1. Ve a la pestaña "Recetas"
2. Busca un ítem de tu menú (ej: "Hamburguesa")
3. Haz clic en "Crear Receta"
4. Agrega ingredientes:
   ```
   Ingrediente: Harina de trigo (HAR-001)
   Cantidad: 100 g por hamburguesa
   Merma: 5%
   ```
5. El sistema calcula automáticamente:
   - Costo total de la receta
   - Margen de ganancia

### 5. Activar Consumo Automático
Agrega este código al componente que confirma pedidos:

```typescript
// Al confirmar un pedido
const confirmOrder = async (orderId: string) => {
  // ... tu lógica de confirmación
  
  // Descuento automático de inventario
  await fetch('/api/inventory/process-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      barId,
      orderItems: order.items,
      action: 'deduct'
    })
  })
}

// Al cancelar un pedido
const cancelOrder = async (orderId: string) => {
  // ... tu lógica de cancelación
  
  // Reversar inventario
  await fetch('/api/inventory/process-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      barId,
      orderItems: order.items,
      action: 'reverse'
    })
  })
}
```

## 🎯 Ejemplo Completo de Flujo

### Escenario: Venta de Hamburguesa

**1. Configuración Inicial:**
```
Insumos creados:
- Carne molida (150g, $0.02/g)
- Pan (1 unidad, $0.50/unidad)
- Queso (30g, $0.03/g)

Receta de Hamburguesa:
- 150g carne molida (merma 10%)
- 1 pan (merma 5%)
- 30g queso (merma 5%)

Costo calculado: $4.45
Precio de venta: $10.00
Margen: 55.5%
```

**2. Cliente hace pedido:**
```
Pedido #123
- 2 Hamburguesas
- Estado: pending
```

**3. Se confirma el pedido:**
```javascript
// Estado cambia a "confirmed"
await confirmOrder('123')
```

**4. Sistema descuenta automáticamente:**
```
Carne molida: -330g (150g × 2 × 1.10)
Pan: -2.1 unidades (1 × 2 × 1.05)
Queso: -63g (30g × 2 × 1.05)

Movimientos registrados:
- Sale: Carne molida -330g (ref: 123)
- Sale: Pan -2.1 unidades (ref: 123)
- Sale: Queso -63g (ref: 123)
```

**5. Si se cancela el pedido:**
```javascript
await cancelOrder('123')

// Sistema revierte:
Carne molida: +330g
Pan: +2.1 unidades
Queso: +63g

Movimientos registrados:
- Cancel: Carne molida +330g (ref: 123)
- Cancel: Pan +2.1 unidades (ref: 123)
- Cancel: Queso +63g (ref: 123)
```

## 📊 Características Destacadas

### ✅ Conversión de Unidades
El sistema maneja diferentes unidades automáticamente:
- Compras en kg → almacenamiento en g
- Compras en litros → almacenamiento en ml
- Conversión automática con multiplicadores

### ✅ Cálculo de Merma
Incluye desperdicio/merma en los cálculos:
```
consumo_real = cantidad_teórica × (1 + merma% / 100)
```

### ✅ Alertas Inteligentes
- 🔴 **Críticas**: Stock agotado o producto vencido
- 🟠 **Altas**: Stock muy bajo o vence en 3 días
- 🟡 **Medias**: Stock bajo o vence en 7 días

### ✅ Trazabilidad Total
Cada movimiento registra:
- Quién lo hizo
- Cuándo se hizo
- Por qué se hizo
- Referencia (pedido, compra, etc.)
- Balance después del movimiento

## 🎨 Interfaz de Usuario

### Panel de Inventario
- Diseño moderno con Tailwind CSS
- Responsive (móvil, tablet, desktop)
- Búsqueda en tiempo real
- Filtros por categoría
- Acciones rápidas (editar, eliminar)

### Indicadores Visuales
- 🟢 Stock normal
- 🟡 Stock bajo
- 🔴 Stock agotado
- 📅 Productos próximos a vencer

## 🔄 Integración con MatchTag

El sistema está completamente integrado con:
- ✅ Sistema de pedidos existente
- ✅ Gestión de menú
- ✅ Panel de administración
- ✅ Sistema multi-bar
- ✅ Autenticación de Firebase

## 💡 Tips de Uso

### Configurar Unidades Correctamente
```
Líquidos:
- Base: ml
- Compra: l
- Multiplicador: 1000

Sólidos:
- Base: g
- Compra: kg
- Multiplicador: 1000

Items por Unidad:
- Base: unidad
- Compra: unidad
- Multiplicador: 1
```

### Definir Merma Realista
```
Vegetales frescos: 10-15%
Carne: 8-12%
Líquidos: 3-5%
Enlatados: 1-2%
```

### Establecer Stock Mínimo
```
Stock mínimo = Consumo diario × Días de reorden
Ejemplo: 500g/día × 7 días = 3500g stock mínimo
```

## ⚠️ Notas Importantes

1. **Crear recetas ANTES de vender**: Los ítems sin receta no descontarán inventario
2. **Revisar alertas diariamente**: El stock bajo puede causar problemas de servicio
3. **Actualizar costos regularmente**: Los costos cambian con los proveedores
4. **Registrar compras inmediatamente**: Mantener el inventario actualizado

## 🎉 ¡Listo!

El sistema de inventarios está completamente funcional y listo para usar. Comienza creando tus insumos y configurando las recetas de tu menú.

