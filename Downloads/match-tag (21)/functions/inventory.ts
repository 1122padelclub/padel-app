import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

const db = admin.firestore()

/**
 * Cloud Function: Descuento automático de inventario al confirmar un pedido
 * Trigger: onUpdate de orders cuando status cambia a "confirmed" o "delivered"
 */
export const onOrderConfirmed = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    const orderId = context.params.orderId

    // Solo ejecutar si el estado cambió a confirmed o delivered
    const statusChanged = before.status !== after.status
    const isConfirmedOrDelivered = after.status === 'confirmed' || after.status === 'delivered'
    
    if (!statusChanged || !isConfirmedOrDelivered) {
      return null
    }

    // Verificar si ya se procesó este pedido
    const movementsRef = db.collection('inventoryMovements')
    const existingMovements = await movementsRef
      .where('barId', '==', after.barId)
      .where('reference', '==', orderId)
      .where('type', '==', 'sale')
      .get()

    if (!existingMovements.empty) {
      console.log(`Order ${orderId} already processed for inventory`)
      return null
    }

    console.log(`Processing inventory deduction for order ${orderId}`)

    try {
      const batch = db.batch()
      const items = after.items || []

      for (const orderItem of items) {
        // Buscar la receta para este ítem del menú
        const recipesSnapshot = await db.collection('recipes')
          .where('barId', '==', after.barId)
          .where('menuItemId', '==', orderItem.menuItemId)
          .limit(1)
          .get()

        if (recipesSnapshot.empty) {
          console.log(`No recipe found for menu item ${orderItem.menuItemId}`)
          continue
        }

        const recipeId = recipesSnapshot.docs[0].id

        // Obtener componentes de la receta
        const componentsSnapshot = await db.collection('recipes')
          .doc(recipeId)
          .collection('components')
          .get()

        for (const compDoc of componentsSnapshot.docs) {
          const component = compDoc.data()
          
          // Buscar el item de inventario
          const inventorySnapshot = await db.collection('inventoryItems')
            .where('barId', '==', after.barId)
            .where('sku', '==', component.ingredientSku)
            .limit(1)
            .get()

          if (inventorySnapshot.empty) {
            console.log(`Inventory item ${component.ingredientSku} not found`)
            continue
          }

          const inventoryDoc = inventorySnapshot.docs[0]
          const inventoryData = inventoryDoc.data()

          // Calcular consumo: cantidad por ítem × cantidad vendida × (1 + % de merma)
          const consumptionBase = component.qtyPerItemBase * orderItem.quantity * (1 + (component.wastePct || 0) / 100)
          const newStock = inventoryData.currentStockBase - consumptionBase

          // Actualizar stock
          batch.update(inventoryDoc.ref, {
            currentStockBase: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })

          // Registrar movimiento
          const movementRef = db.collection('inventoryMovements').doc()
          batch.set(movementRef, {
            barId: after.barId,
            itemId: inventoryDoc.id,
            itemSku: component.ingredientSku,
            itemName: component.ingredientName,
            type: 'sale',
            quantityBase: -consumptionBase,
            reason: `Venta de ${orderItem.name}`,
            reference: orderId,
            performedBy: 'system',
            performedByName: 'Sistema Automático',
            balanceAfter: newStock,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          })

          console.log(`Deducted ${consumptionBase} of ${component.ingredientSku} for order ${orderId}`)
        }
      }

      await batch.commit()
      console.log(`Inventory updated successfully for order ${orderId}`)
      
      return null
    } catch (error) {
      console.error(`Error processing inventory for order ${orderId}:`, error)
      throw error
    }
  })

/**
 * Cloud Function: Reversar inventario al cancelar un pedido
 * Trigger: onUpdate de orders cuando status cambia a "cancelled"
 */
export const onOrderCanceled = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    const orderId = context.params.orderId

    // Solo ejecutar si el estado cambió a cancelled
    const statusChanged = before.status !== after.status
    const isCancelled = after.status === 'cancelled'
    
    if (!statusChanged || !isCancelled) {
      return null
    }

    // Verificar si el pedido fue procesado anteriormente
    const salesMovementsRef = db.collection('inventoryMovements')
    const salesMovements = await salesMovementsRef
      .where('barId', '==', after.barId)
      .where('reference', '==', orderId)
      .where('type', '==', 'sale')
      .get()

    if (salesMovements.empty) {
      console.log(`No inventory movements found for order ${orderId}`)
      return null
    }

    console.log(`Reversing inventory for cancelled order ${orderId}`)

    try {
      const batch = db.batch()

      for (const movementDoc of salesMovements.docs) {
        const movement = movementDoc.data()

        // Buscar el item de inventario
        const inventoryDoc = await db.collection('inventoryItems').doc(movement.itemId).get()
        
        if (!inventoryDoc.exists) {
          console.log(`Inventory item ${movement.itemId} not found`)
          continue
        }

        const inventoryData = inventoryDoc.data()!
        
        // Revertir el stock (el movimiento de venta es negativo, así que sumamos su valor absoluto)
        const reversalQuantity = Math.abs(movement.quantityBase)
        const newStock = inventoryData.currentStockBase + reversalQuantity

        // Actualizar stock
        batch.update(inventoryDoc.ref, {
          currentStockBase: newStock,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })

        // Registrar movimiento de cancelación
        const cancelMovementRef = db.collection('inventoryMovements').doc()
        batch.set(cancelMovementRef, {
          barId: after.barId,
          itemId: movement.itemId,
          itemSku: movement.itemSku,
          itemName: movement.itemName,
          type: 'cancel',
          quantityBase: reversalQuantity,
          reason: `Cancelación de pedido`,
          reference: orderId,
          performedBy: 'system',
          performedByName: 'Sistema Automático',
          balanceAfter: newStock,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        })

        console.log(`Reversed ${reversalQuantity} of ${movement.itemSku} for cancelled order ${orderId}`)
      }

      await batch.commit()
      console.log(`Inventory reversed successfully for cancelled order ${orderId}`)
      
      return null
    } catch (error) {
      console.error(`Error reversing inventory for order ${orderId}:`, error)
      throw error
    }
  })

/**
 * Cloud Function: Actualizar alertas de inventario
 * Trigger: onWrite de inventoryItems
 */
export const updateInventoryAlerts = functions.firestore
  .document('inventoryItems/{itemId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) {
      // Item eliminado, no hacer nada
      return null
    }

    const item = change.after.data()!
    const itemId = context.params.itemId

    // Generar/actualizar alertas según el stock
    const alertsRef = db.collection('inventoryAlerts')
    
    // Eliminar alertas existentes para este item
    const existingAlerts = await alertsRef
      .where('itemId', '==', itemId)
      .get()

    const batch = db.batch()
    
    existingAlerts.docs.forEach(doc => {
      batch.delete(doc.ref)
    })

    // Crear nuevas alertas si es necesario
    if (item.currentStockBase <= 0) {
      const alertRef = alertsRef.doc()
      batch.set(alertRef, {
        barId: item.barId,
        itemId,
        itemSku: item.sku,
        itemName: item.name,
        alertType: 'out_of_stock',
        severity: 'critical',
        currentStock: item.currentStockBase,
        message: `${item.name} está agotado`,
        isResolved: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    } else if (item.currentStockBase <= item.minStockBase) {
      const alertRef = alertsRef.doc()
      batch.set(alertRef, {
        barId: item.barId,
        itemId,
        itemSku: item.sku,
        itemName: item.name,
        alertType: 'low_stock',
        severity: item.currentStockBase <= item.minStockBase * 0.5 ? 'high' : 'medium',
        currentStock: item.currentStockBase,
        minStock: item.minStockBase,
        message: `${item.name} tiene stock bajo`,
        isResolved: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }

    // Alertas de vencimiento
    if (item.expiryDate) {
      const expiryDate = item.expiryDate.toDate()
      const now = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 0) {
        const alertRef = alertsRef.doc()
        batch.set(alertRef, {
          barId: item.barId,
          itemId,
          itemSku: item.sku,
          itemName: item.name,
          alertType: 'expired',
          severity: 'critical',
          currentStock: item.currentStockBase,
          expiryDate: item.expiryDate,
          message: `${item.name} está vencido`,
          isResolved: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        })
      } else if (daysUntilExpiry <= 7) {
        const alertRef = alertsRef.doc()
        batch.set(alertRef, {
          barId: item.barId,
          itemId,
          itemSku: item.sku,
          itemName: item.name,
          alertType: 'near_expiry',
          severity: daysUntilExpiry <= 3 ? 'high' : 'medium',
          currentStock: item.currentStockBase,
          expiryDate: item.expiryDate,
          message: `${item.name} vence en ${daysUntilExpiry} días`,
          isResolved: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }
    }

    await batch.commit()
    return null
  })

