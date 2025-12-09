import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * API Route: Procesar descuento de inventario al confirmar pedido
 * POST /api/inventory/process-order
 */
export async function POST(request: Request) {
  try {
    const { orderId, barId, orderItems, action = 'deduct' } = await request.json()

    if (!orderId || !barId || !orderItems) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`Processing inventory ${action} for order ${orderId}`)

    const db = getAdminDb()
    
    // Verificar si ya se procesó este pedido
    const existingMovements = await db
      .collection('inventoryMovements')
      .where('barId', '==', barId)
      .where('orderId', '==', orderId)
      .where('type', '==', action === 'deduct' ? 'sale' : 'cancel')
      .get()

    if (!existingMovements.empty) {
      return NextResponse.json(
        { message: 'Order already processed', alreadyProcessed: true },
        { status: 200 }
      )
    }

    const batch = db.batch()
    const processed: any[] = []

    for (const orderItem of orderItems) {
      // Buscar la receta para este ítem del menú
      const recipesSnapshot = await db
        .collection('recipes')
        .where('barId', '==', barId)
        .where('menuItemId', '==', orderItem.menuItemId)
        .get()

      if (recipesSnapshot.empty) {
        console.log(`No recipe found for menu item ${orderItem.menuItemId}`)
        continue
      }

      const recipeId = recipesSnapshot.docs[0].id

      // Obtener componentes de la receta
      const componentsSnapshot = await db
        .collection('recipes')
        .doc(recipeId)
        .collection('components')
        .get()

      // Procesar ingredientes de la receta
      for (const compDoc of componentsSnapshot.docs) {
        const component = compDoc.data()

        // Determinar si este componente debe usarse
        let shouldUseComponent = false

        if (!component.forSpecification) {
          // Ingrediente base - siempre se usa
          shouldUseComponent = true
        } else {
          // Ingrediente específico - solo se usa si la especificación está seleccionada
          const selectedModifiers = orderItem.selectedModifiers || []
          
          // Buscar si el cliente seleccionó esta especificación
          const hasSelectedSpec = selectedModifiers.some(mod => 
            mod.groupId === component.forSpecification.specificationId &&
            mod.modifiers.some(m => m.id === component.forSpecification.optionId)
          )

          shouldUseComponent = hasSelectedSpec
        }

        if (!shouldUseComponent) {
          console.log(`Skipping ingredient ${component.ingredientSku} - specification not selected`)
          continue
        }

        // Buscar el item de inventario
        const inventorySnapshot = await db
          .collection('inventoryItems')
          .where('barId', '==', barId)
          .where('sku', '==', component.ingredientSku)
          .get()

        if (inventorySnapshot.empty) {
          console.log(`Inventory item ${component.ingredientSku} not found`)
          continue
        }

        const inventoryDoc = inventorySnapshot.docs[0]
        const inventoryData = inventoryDoc.data()

        // Calcular consumo
        const consumptionBase = component.qtyPerItemBase * orderItem.quantity * (1 + (component.wastePct || 0) / 100)
        const quantityChange = action === 'deduct' ? -consumptionBase : consumptionBase
        const newStock = inventoryData.currentStockBase + quantityChange

        // Actualizar stock
        const inventoryRef = db.collection('inventoryItems').doc(inventoryDoc.id)
        batch.update(inventoryRef, {
          currentStockBase: newStock,
          updatedAt: FieldValue.serverTimestamp()
        })

        // Preparar nota para el movimiento
        let notes = action === 'deduct' ? `Venta de ${orderItem.name}` : `Cancelación de pedido`
        if (component.forSpecification) {
          notes += ` (${component.forSpecification.optionName})`
        }

        // Registrar movimiento
        const movementRef = db.collection('inventoryMovements').doc()
        batch.set(movementRef, {
          barId,
          inventoryItemId: inventoryDoc.id,
          itemSku: component.ingredientSku,
          itemName: component.ingredientName,
          type: action === 'deduct' ? 'sale' : 'cancel',
          quantityBase: quantityChange, // Mantener signo negativo para ventas
          balanceAfter: newStock,
          unitCost: inventoryData.costPerBaseUnit || 0,
          totalCost: Math.abs(quantityChange) * (inventoryData.costPerBaseUnit || 0),
          orderId: orderId,
          notes: notes,
          createdAt: FieldValue.serverTimestamp()
        })

        processed.push({
          ingredient: component.ingredientName,
          consumed: Math.abs(quantityChange),
          newStock,
          specification: component.forSpecification?.optionName || 'Base'
        })

        console.log(`${action === 'deduct' ? 'Deducted' : 'Reversed'} ${Math.abs(quantityChange)} of ${component.ingredientSku}` + 
                   (component.forSpecification ? ` (${component.forSpecification.optionName})` : ''))
      }
    }

    await batch.commit()
    
    return NextResponse.json({
      success: true,
      message: `Inventory ${action === 'deduct' ? 'deducted' : 'reversed'} successfully`,
      processed,
      orderId
    })

  } catch (error) {
    console.error('Error processing inventory:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

