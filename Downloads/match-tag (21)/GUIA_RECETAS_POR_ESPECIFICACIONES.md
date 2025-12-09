# 🎯 Guía: Sistema de Recetas por Especificaciones

## 📋 **Resumen**

Ahora puedes crear **recetas personalizadas** para cada opción de especificación de tus platos. Por ejemplo:

- **Hamburguesa con Papas Fritas** → Descuenta: carne, pan, papas, aceite
- **Hamburguesa con Ensalada** → Descuenta: carne, pan, lechuga, tomate, aderezo
- **Hamburguesa con Arroz** → Descuenta: carne, pan, arroz

---

## 🚀 **Cómo Funciona**

### **1. Estructura de Recetas**

Cada receta se compone de:

#### **A) Ingredientes Base**
Son los ingredientes que **siempre se usan**, sin importar qué opciones elija el cliente.

**Ejemplo:** Para una hamburguesa, los ingredientes base serían:
- Carne (150g)
- Pan (1 unidad)
- Queso (20g)
- Salsa (10ml)

#### **B) Ingredientes por Especificación**
Son ingredientes **específicos** que solo se usan cuando el cliente selecciona esa opción.

**Ejemplo:** Para el acompañamiento:
- **Si elige "Papas Fritas"**:
  - Papas (200g)
  - Aceite (50ml)

- **Si elige "Ensalada"**:
  - Lechuga (80g)
  - Tomate (50g)
  - Aderezo (20ml)

- **Si elige "Arroz"**:
  - Arroz (150g)
  - Mantequilla (10g)

---

## 📝 **Cómo Configurar Recetas**

### **Paso 1: Ve al Panel de Inventario**
1. Abre el **Panel de Administración**
2. Haz clic en la pestaña **"Inventario"**
3. Selecciona **"Recetas"**

### **Paso 2: Selecciona un Ítem del Menú**
1. Busca el plato que quieres configurar (ej: "Hamburguesa")
2. Haz clic en **"Crear Receta"** o **"Editar Receta"**

### **Paso 3: Configura la Receta Base**
1. En la pestaña **"Receta Base"**, haz clic en **"Agregar Ingrediente"**
2. Selecciona cada ingrediente que se usa siempre:
   - **Ingrediente**: Selecciona del inventario (ej: "Carne de res")
   - **Cantidad**: Cantidad en la unidad base (ej: 150 para 150g)
   - **Merma %**: Porcentaje de desperdicio (ej: 5%)
3. Repite para todos los ingredientes base

### **Paso 4: Configura Ingredientes por Especificación**
1. Haz clic en las pestañas de cada opción de especificación (ej: "Papas Fritas", "Ensalada", "Arroz")
2. Para cada opción, agrega los ingredientes específicos:
   - Haz clic en **"Agregar Ingrediente"**
   - Configura el ingrediente igual que en la receta base
3. El sistema muestra el **costo total** considerando ingredientes base + ingredientes de esa opción

### **Paso 5: Guarda la Receta**
1. Haz clic en **"Guardar Receta"**
2. ¡Listo! Tu receta está configurada

---

## 🎯 **Ejemplo Completo: Hamburguesa**

### **Configuración en el Menú**

**Ítem**: Hamburguesa - $15,000

**Especificaciones**:
- **Acompañamiento** (seleccionar 1):
  - Papas Fritas (+$0)
  - Ensalada (+$0)
  - Arroz (+$0)

### **Configuración de Receta**

#### **📦 Receta Base** (se usa siempre)
| Ingrediente | Cantidad | Merma % | Costo |
|-------------|----------|---------|-------|
| Carne de res | 150g | 5% | $3,150 |
| Pan hamburguesa | 1 unidad | 0% | $800 |
| Queso cheddar | 20g | 2% | $510 |
| Salsa especial | 10ml | 0% | $200 |
| **TOTAL BASE** | | | **$4,660** |

#### **🍟 Opción: Papas Fritas**
| Ingrediente | Cantidad | Merma % | Costo |
|-------------|----------|---------|-------|
| Papas | 200g | 10% | $440 |
| Aceite vegetal | 50ml | 0% | $125 |
| **TOTAL con Papas** | | | **$5,225** |

#### **🥗 Opción: Ensalada**
| Ingrediente | Cantidad | Merma % | Costo |
|-------------|----------|---------|-------|
| Lechuga | 80g | 15% | $184 |
| Tomate | 50g | 10% | $165 |
| Aderezo | 20ml | 0% | $180 |
| **TOTAL con Ensalada** | | | **$5,189** |

#### **🍚 Opción: Arroz**
| Ingrediente | Cantidad | Merma % | Costo |
|-------------|----------|---------|-------|
| Arroz blanco | 150g | 5% | $525 |
| Mantequilla | 10g | 0% | $180 |
| **TOTAL con Arroz** | | | **$5,365** |

### **Resultado en el Sistema**

**Cuando un cliente ordena:**

1. **"Hamburguesa con Papas Fritas"**
   - ✅ Se descuenta: Carne, Pan, Queso, Salsa, Papas, Aceite
   - 💰 Costo total: $5,225
   - 📊 Margen: 65.2%

2. **"Hamburguesa con Ensalada"**
   - ✅ Se descuenta: Carne, Pan, Queso, Salsa, Lechuga, Tomate, Aderezo
   - 💰 Costo total: $5,189
   - 📊 Margen: 65.4%

3. **"Hamburguesa con Arroz"**
   - ✅ Se descuenta: Carne, Pan, Queso, Salsa, Arroz, Mantequilla
   - 💰 Costo total: $5,365
   - 📊 Margen: 64.2%

---

## 📊 **Visualización en el Panel**

### **Vista de Recetas**
El RecipeManager ahora muestra:
- **Pestaña "Receta Base"**: Ingredientes que siempre se usan
- **Pestañas por Opción**: Una pestaña para cada opción de especificación
- **Badges**: Indica cuántos ingredientes tiene cada sección
- **Costo por Opción**: Muestra el costo total incluyendo base + opción específica

### **Movimientos de Inventario**
Cuando se vende un producto, los movimientos incluyen:
- Nombre del producto
- Opción seleccionada (si aplica)
- Cantidad descontada
- Costo del movimiento

**Ejemplo de movimiento:**
```
Tipo: Venta
Producto: Hamburguesa
Nota: Venta de Hamburguesa (Papas Fritas)
Ingredientes descontados:
- Carne de res: -150g
- Pan: -1 unidad
- Queso: -20g
- Salsa: -10ml
- Papas: -200g
- Aceite: -50ml
```

---

## ⚠️ **Notas Importantes**

### **1. Ingredientes Base vs. Específicos**
- **Base**: Se usan SIEMPRE, sin importar la especificación
- **Específicos**: Solo se usan si el cliente selecciona esa opción

### **2. Costos y Márgenes**
- El **costo base** solo considera ingredientes base
- El **costo real** se calcula según la opción seleccionada por el cliente
- Los **márgenes varían** según la especificación elegida

### **3. Especificaciones Múltiples**
Si un plato tiene múltiples especificaciones (ej: Acompañamiento + Bebida):
- Cada especificación puede tener sus propios ingredientes
- El sistema descuenta la suma de: Base + todos los ingredientes de las opciones seleccionadas

### **4. Compatibilidad**
- ✅ Funciona con el sistema de pedidos existente
- ✅ Compatible con selectedModifiers del frontend
- ✅ Se integra automáticamente con movimientos de inventario

---

## 🔧 **Casos de Uso Comunes**

### **Caso 1: Platos con Diferentes Acompañantes**
**Ejemplo**: Carnes a la parrilla
- Base: Carne + condimentos
- Opciones: Papas, arroz, vegetales, ensalada

### **Caso 2: Bebidas con Opciones**
**Ejemplo**: Café
- Base: Café + azúcar
- Opciones: Leche entera, leche descremada, leche de almendras

### **Caso 3: Tamaños Diferentes**
**Ejemplo**: Pizza
- Pequeña: 200g masa, 100g queso, 50g salsa
- Mediana: 300g masa, 150g queso, 75g salsa
- Grande: 400g masa, 200g queso, 100g salsa

### **Caso 4: Extras Opcionales**
**Ejemplo**: Hamburguesa
- Base: Carne + pan + vegetales
- Extras: +Tocino, +Huevo, +Queso extra

---

## 🎉 **¡Listo para Usar!**

Ahora puedes:
1. **Crear insumos** en el inventario
2. **Configurar especificaciones** en tus platos del menú
3. **Crear recetas base** con ingredientes comunes
4. **Agregar ingredientes específicos** para cada opción
5. **Vender productos** y que el inventario se descuente automáticamente según la opción elegida

¡El sistema de inventario ahora refleja con precisión lo que realmente se consume en cada venta!

