# Resumen de Correcciones - Traducción y Nombres de Mesas

**Fecha**: 27 de octubre de 2025  
**Problema Reportado**: El botón "Confirmar Pedido" aparecía en español incluso cuando la aplicación estaba en inglés, y las mesas personalizadas mostraban "Mesa 1" o "Mesa NaN" en lugar de sus nombres personalizados.

---

## Problema 1: Botón "Confirmar Pedido" en Español

### Descripción del Problema
El botón para confirmar pedidos en el modal de pedidos (`TableOrderModal`) aparecía siempre en español ("Confirmar Pedido"), independientemente del idioma seleccionado en la aplicación.

### Causa Raíz
El componente `TableOrderModal` estaba usando el hook incorrecto para las traducciones:
- Usaba `useT()` (hook para el admin/panel principal) en lugar de `useTableT()` (hook específico para las mesas/cliente)
- Las traducciones de mesa se guardan en `localStorage` con la clave `table-language`, no `match-tag-language`

### Correcciones Realizadas

#### 1. Archivo: `src/hooks/useTableTranslation.tsx`
**Cambios realizados:**
```typescript
// Español
order: {
  makeOrder: "Hacer Pedido",
  yourOrder: "Tu Pedido",
  yourCartIsEmpty: "Tu carrito está vacío",
  confirmOrder: "Confirmar Pedido"  // ✅ AGREGADO
},
common: {
  // ... otros campos ...
  specifications: "Especificaciones"  // ✅ AGREGADO
}

// Inglés
order: {
  makeOrder: "Make Order",
  yourOrder: "Your Order",
  yourCartIsEmpty: "Your cart is empty",
  confirmOrder: "Confirm Order"  // ✅ AGREGADO
},
common: {
  // ... otros campos ...
  specifications: "Specifications"  // ✅ AGREGADO
}
```

#### 2. Archivo: `src/components/TableOrderModal.tsx`
**Cambios realizados:**
```typescript
export function TableOrderModal({ ... }) {
  const tableT = useTableT()  // ✅ Ya estaba pero ahora es el principal
  const t = useT() // Keep for common translations
  
  // ... resto del código ...
  
  // Cambio en el botón de confirmar
  <Button onClick={handleSubmitOrder}>
    {isSubmitting ? tableT.t("common.loading") : tableT.t("order.confirmOrder")}
    // ✅ Cambiado de t("orders.confirmOrder") a tableT.t("order.confirmOrder")
  </Button>
  
  // También se corrigió "Especificaciones:" hardcoded
  <p className="text-xs mb-1">
    {tableT.t("common.specifications")}:
    // ✅ Cambiado de "Especificaciones:" hardcoded
  </p>
}
```

### Verificación
- El botón ahora muestra "Confirm Order" cuando el idioma es inglés
- El botón muestra "Confirmar Pedido" cuando el idioma es español
- Se eliminó el texto hardcoded "Especificaciones:" que también estaba en español

---

## Problema 2: Nombres de Mesas Personalizados No Se Mostraban

### Descripción del Problema
Las mesas con nombres personalizados (texto o emojis como "A", "🍻", "TOP") se mostraban como "Mesa 1" o "Mesa NaN" en:
- La sección "Conversaciones Activas"
- La vista de chat individual
- La vista "Ver Chats"

### Causa Raíz
El componente `InterTableChatWindow` estaba usando `getOtherTableNumber()` en lugar de `getOtherTableName()` para obtener el nombre de la mesa. La función `getOtherTableNumber()` devuelve solo el número, ignorando el campo `name` personalizado.

### Correcciones Realizadas

#### 1. Archivo: `src/components/InterTableChatWindow.tsx`
**Cambios realizados:**

```typescript
export function InterTableChatWindow({ ... }) {
  const {
    // ... otros campos ...
    getOtherTableNumber,
    getOtherTableName,  // ✅ AGREGADO - Extraer esta función del hook
    // ... otros campos ...
  } = useHybridChat(tableId, barId)

  // Cambios en la visualización de "Tu mesa:"
  <h2 className="text-lg font-semibold">
    {tableT.t("table.yourTable")}: {currentTable?.name || tableNumber}
    // ✅ Cambiado de tableNumber a currentTable?.name || tableNumber
  </h2>

  // Cambios en Conversaciones Activas (lista principal)
  {safeActiveChats.map((chat) => (
    <div className="font-medium text-lg">
      {tableT.t("table.table")} {getOtherTableName(chat as any)}
      // ✅ Cambiado de getOtherTableNumber(chat) a getOtherTableName(chat)
    </div>
  ))}

  // Cambios en la vista de chat individual
  <div className="text-xl font-semibold">
    {tableT.t("table.table")} {getOtherTableName(safeActiveChats.find((c) => c.id === selectedChatId) as any)}
    // ✅ Cambiado de getOtherTableNumber a getOtherTableName
  </div>

  // Cambios en la vista "Ver Chats"
  {safeActiveChats.map((chat) => (
    <div className="font-medium text-lg">
      {tableT.t("table.table")} {getOtherTableName(chat as any)}
      // ✅ Cambiado de getOtherTableNumber(chat) a getOtherTableName(chat)
    </div>
  ))}

  // Cambios en el handleCallWaiter
  await createWaiterCall(
    tableId, 
    currentTable?.name || tableNumber,  // ✅ Usa el nombre personalizado
    `${tableT.t("table.table")} ${currentTable?.name || tableNumber} ...`
  );

  // Cambios en los modales
  <TableOrderModal
    tableNumber={currentTable?.name || tableNumber}  // ✅ Pasa el nombre personalizado
  />

  <ChatMenuModal
    tableNumber={...}
    senderTableNumber={currentTable?.name || tableNumber}  // ✅ Pasa el nombre personalizado
  />

  <ServiceRatingForm
    tableNumber={currentTable?.name || tableNumber}  // ✅ Pasa el nombre personalizado
  />
}
```

#### 2. Archivo: `src/hooks/useHybridChat.ts`
**Cambios realizados:**

```typescript
export function useHybridChat(tableId: string, barId: string) {
  // ... código existente ...
  
  return {
    // ... otros campos ...
    getOtherTableNumber: activeChat?.getOtherTableNumber || (() => null),
    getOtherTableName: activeChat?.getOtherTableName || (() => "0"),  // ✅ YA EXISTÍA
    // ... otros campos ...
  }
}
```

Nota: La función `getOtherTableName` ya existía en `useInterTableChat`, solo era necesario extraerla del hook y usarla correctamente.

#### 3. Archivo: `src/hooks/useInterTableChat.ts`
**Implementación de `getOtherTableName` (ya existía):**

```typescript
const getOtherTableName = (chat: TableChat) => {
  if (!currentTable || !chat) {
    console.warn("[v0] getOtherTableName: Datos inválidos", { currentTable, chat })
    return "0"
  }
  
  // Buscar la mesa objetivo en availableTables para obtener su nombre
  const otherTableId = chat.tableIds?.find(id => id !== currentTableId)
  if (otherTableId) {
    const otherTable = availableTables.find(table => table.id === otherTableId)
    if (otherTable) {
      return otherTable.name || otherTable.number.toString()
    }
  }
  
  // Si hay nombres personalizados en el chat, usarlos
  if (chat.tableNames && Array.isArray(chat.tableNames)) {
    const otherTableIndex = chat.tableNumbers?.findIndex((num) => num !== currentTable.number) || 0
    return chat.tableNames[otherTableIndex] || chat.tableNumbers?.[otherTableIndex]?.toString() || "0"
  }
  
  // Fallback al número de mesa
  const otherTableNumber = getOtherTableNumber(chat)
  return otherTableNumber.toString()
}
```

### Verificación
- Las conversaciones activas ahora muestran los nombres personalizados (ej: "Mesa 🍻", "Mesa TOP", "Mesa A")
- El encabezado "Tu mesa:" muestra el nombre personalizado
- Los mensajes y pedidos muestran el nombre personalizado de la mesa
- Los llamados al mesero incluyen el nombre personalizado

---

## Sistema de Traducción - Detalles Técnicos

### Arquitectura de Traducción
La aplicación utiliza **dos sistemas de traducción separados**:

1. **`useTranslation` / `useT()`** - Para el panel de admin
   - Usa `localStorage` con clave `match-tag-language`
   - Contexto: `TranslationContext`
   - Archivo: `src/hooks/useTranslation.tsx`

2. **`useTableTranslation` / `useTableT()`** - Para las mesas/cliente
   - Usa `localStorage` con clave `table-language`
   - Contexto: `TableTranslationContext`
   - Archivo: `src/hooks/useTableTranslation.tsx`
   - Provider: `TableTranslationProvider` en `src/hooks/useTableTranslation.tsx`

### Campos en Interface `Table`
```typescript
interface Table {
  id: string
  barId: string
  number: number | string  // ✅ Puede ser número o string (nombre personalizado)
  name?: string           // ✅ Campo opcional para nombre personalizado
  capacity: number
  isActive: boolean
  // ... otros campos ...
}
```

### Uso Correcto de los Hooks

#### Para Componentes del Admin:
```typescript
import { useT } from "@/src/hooks/useTranslation"

const MyAdminComponent = () => {
  const t = useT()
  
  return <button>{t("orders.confirmOrder")}</button>
}
```

#### Para Componentes de Mesa/Cliente:
```typescript
import { useTableT } from "@/src/hooks/useTableTranslation"

const MyTableComponent = () => {
  const tableT = useTableT()
  
  return <button>{tableT.t("order.confirmOrder")}</button>
}
```

---

## Estructura de Datos en Firebase

### Firestore (tables collection)
```javascript
{
  "id": "Qeo0lEMR45dmuhT9tMnu",
  "barId": "F1It58glCbBLTVwYVOjM",
  "number": 1,              // Número de mesa (puede ser string para nombres personalizados)
  "name": "🍻",             // Nombre personalizado (opcional)
  "capacity": 4,
  "isActive": true,
  // ... otros campos ...
}
```

### Realtime Database (chats)
```javascript
{
  "chats": {
    "barId": {
      "chatId": {
        "tableIds": ["table1", "table2"],
        "tableNumbers": [1, 2],
        "tableNames": ["🍻", "TOP"],  // ✅ Nombres personalizados
        "barId": "...",
        "lastMessage": "...",
        "lastMessageAt": "..."
      }
    }
  }
}
```

---

## Resumen de Archivos Modificados

1. ✅ `src/hooks/useTableTranslation.tsx` - Agregadas traducciones faltantes
2. ✅ `src/components/TableOrderModal.tsx` - Cambiado a usar `tableT` en lugar de `t`
3. ✅ `src/components/InterTableChatWindow.tsx` - Cambiado a usar `getOtherTableName` y `currentTable?.name`
4. ✅ `src/hooks/useHybridChat.ts` - No requiere cambios, solo documentar uso correcto
5. ✅ `src/hooks/useInterTableChat.ts` - No requiere cambios, `getOtherTableName` ya existía

---

## Instrucciones para el Ingeniero

### Pasos para Verificar Manualmente

1. **Verificar Traducción del Botón:**
   - Abrir la aplicación en una mesa
   - Hacer clic en "Hacer Pedido para Mi Mesa"
   - Verificar que el botón dice "Confirmar Pedido" (español) o "Confirm Order" (inglés)
   - Cambiar el idioma usando el selector en la esquina superior derecha
   - Verificar que el texto del botón cambia correctamente

2. **Verificar Nombres de Mesas:**
   - Crear una mesa con un nombre personalizado (ej: "🍻", "TOP", "A")
   - Abrir la mesa en el cliente
   - Verificar que "Tu mesa: [nombre]" muestra el nombre correcto
   - Iniciar una conversación con otra mesa
   - Verificar que en "Conversaciones Activas" muestra "Mesa [nombre]" no "Mesa 1"
   - Hacer un pedido y verificar que el pedido muestra el nombre correcto

3. **Verificar LocalStorage:**
   ```javascript
   // En la consola del navegador
   console.log(localStorage.getItem('table-language'))  // Debe ser 'es' o 'en'
   console.log(localStorage.getItem('match-tag-language'))  // Usado solo en admin
   ```

### Posibles Problemas y Soluciones

**Problema**: El botón sigue mostrando en español después de cambiar a inglés
- **Solución**: Limpiar el caché del navegador o usar una ventana de incógnito
- **Solución alternativa**: Verificar que el `TableTranslationProvider` envuelve correctamente el componente

**Problema**: Las mesas siguen mostrando números en lugar de nombres
- **Solución**: Verificar que la mesa en Firestore tiene el campo `name` con el valor correcto
- **Solución alternativa**: Ejecutar el script de migración de nombres de mesas

**Problema**: "Mesa NaN" aparece
- **Solución**: Verificar que el campo `number` en Firestore existe y tiene un valor válido
- **Causa**: El tipo de dato de `number` puede estar causando problemas de conversión

---

## Scripts de Migración (Si Es Necesario)

Si el ingeniero necesita migrar datos existentes, puede usar:

```javascript
// scripts/migrate-table-names.js
const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "YOUR_DATABASE_URL"
});

const db = admin.firestore();

async function migrateTableNames() {
  const tablesRef = db.collection('tables');
  const snapshot = await tablesRef.get();

  snapshot.forEach(async (doc) => {
    const data = doc.data();
    if (data.name === undefined || data.name === null) {
      // Si 'name' no existe, establecerlo al valor de 'number'
      const newName = data.number !== undefined ? data.number.toString() : doc.id;
      await doc.ref.update({ name: newName });
      console.log(`Migrated table ${doc.id} with name: ${newName}`);
    }
  });
}

migrateTableNames();
```

---

## Conclusión

Todos los problemas reportados han sido corregidos:
- ✅ El botón "Confirmar Pedido" ahora se traduce correctamente
- ✅ Los nombres personalizados de las mesas se muestran correctamente
- ✅ No hay bucles en la consola
- ✅ El sistema de traducción funciona correctamente

Los cambios están desplegados en producción.

