import * as XLSX from 'xlsx'
import type { ReportData } from '@/src/types'

export class ExcelGeneratorService {
  /**
   * Genera un archivo Excel con los datos del reporte
   * @returns Buffer del archivo Excel
   */
  async generateReportExcel(reportData: ReportData, barName: string, barId: string): Promise<Buffer> {
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new()

    // 1. Hoja de Resumen
    this.addSummarySheet(workbook, reportData, barName)

    // 2. Hoja de Reseñas
    if (reportData.reviews.length > 0) {
      this.addReviewsSheet(workbook, reportData.reviews)
    }

    // 3. Hoja de Pedidos
    if (reportData.orders.length > 0) {
      this.addOrdersSheet(workbook, reportData.orders)
    }

    // 4. Hoja de Reservas
    if (reportData.reservations.length > 0) {
      this.addReservationsSheet(workbook, reportData.reservations)
    }

    // 5. Hojas de Inventario
    await this.addInventorySheets(workbook, barId)

    // Convertir a buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    return excelBuffer as Buffer
  }

  private addSummarySheet(workbook: XLSX.WorkBook, reportData: ReportData, barName: string) {
    const summaryData = [
      ['REPORTE CRM - ' + barName],
      [''],
      ['Período', reportData.period.label],
      ['Desde', reportData.period.start.toLocaleDateString()],
      ['Hasta', reportData.period.end.toLocaleDateString()],
      [''],
      ['MÉTRICAS PRINCIPALES'],
      [''],
      ['Total de Reseñas', reportData.summary.totalReviews],
      ['Calificación Promedio', reportData.summary.averageRating.toFixed(2) + ' / 5'],
      ['Total de Pedidos', reportData.summary.totalOrders],
      ['Ingresos Totales', '$' + reportData.summary.totalRevenue.toFixed(2)],
      ['Total de Reservas', reportData.summary.totalReservations],
      ['Tasa de Confirmación', reportData.summary.confirmationRate.toFixed(2) + '%'],
      [''],
      ['MÉTRICAS ADICIONALES'],
      [''],
      ['Ticket Promedio', reportData.summary.totalOrders > 0 
        ? '$' + (reportData.summary.totalRevenue / reportData.summary.totalOrders).toFixed(2)
        : '$0.00'],
      ['Pedidos por Día', reportData.summary.totalOrders > 0
        ? (reportData.summary.totalOrders / Math.ceil((reportData.period.end.getTime() - reportData.period.start.getTime()) / (1000 * 60 * 60 * 24))).toFixed(2)
        : '0'],
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 30 }, // Columna A
      { wch: 20 }  // Columna B
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen')
  }

  private addReviewsSheet(workbook: XLSX.WorkBook, reviews: any[]) {
    const reviewsData = [
      ['RESEÑAS'],
      [''],
      ['Fecha', 'Cliente', 'Calificación', 'Comentario']
    ]

    reviews.forEach(review => {
      reviewsData.push([
        new Date(review.createdAt).toLocaleDateString(),
        review.customerName || 'Anónimo',
        review.rating + ' / 5',
        review.comment || ''
      ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(reviewsData)

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 20 }, // Cliente
      { wch: 12 }, // Calificación
      { wch: 50 }  // Comentario
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reseñas')
  }

  private addOrdersSheet(workbook: XLSX.WorkBook, orders: any[]) {
    const ordersData = [
      ['PEDIDOS'],
      [''],
      ['Fecha', 'Mesa', 'Estado', 'Total', 'Items']
    ]

    orders.forEach(order => {
      const itemsCount = order.items?.length || 0
      const itemsDescription = order.items?.map((item: any) => 
        `${item.quantity}x ${item.name}`
      ).join(', ') || ''

      ordersData.push([
        new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString(),
        order.tableNumber || order.tableName || 'N/A',
        order.status || 'pending',
        '$' + (order.total || 0).toFixed(2),
        itemsDescription
      ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(ordersData)

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 20 }, // Fecha
      { wch: 10 }, // Mesa
      { wch: 12 }, // Estado
      { wch: 12 }, // Total
      { wch: 60 }  // Items
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos')
  }

  private addReservationsSheet(workbook: XLSX.WorkBook, reservations: any[]) {
    const reservationsData = [
      ['RESERVAS'],
      [''],
      ['Fecha Creación', 'Fecha Reserva', 'Nombre', 'Personas', 'Estado', 'Teléfono', 'Email']
    ]

    reservations.forEach(reservation => {
      reservationsData.push([
        new Date(reservation.createdAt).toLocaleDateString(),
        new Date(reservation.reservationDate).toLocaleDateString() + ' ' + (reservation.reservationTime || ''),
        reservation.customerName || '',
        reservation.partySize || 0,
        reservation.status || 'pending',
        reservation.customerPhone || '',
        reservation.customerEmail || ''
      ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(reservationsData)

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 15 }, // Fecha Creación
      { wch: 20 }, // Fecha Reserva
      { wch: 25 }, // Nombre
      { wch: 10 }, // Personas
      { wch: 12 }, // Estado
      { wch: 15 }, // Teléfono
      { wch: 30 }  // Email
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas')
  }

  /**
   * Agrega las hojas de inventario al libro de trabajo
   */
  private async addInventorySheets(workbook: XLSX.WorkBook, barId: string) {
    try {
      console.log('📊 ===== STARTING INVENTORY SHEETS =====')
      console.log('📊 Bar ID:', barId)
      
      // Importar el Admin SDK para acceder a Firestore
      const { getAdminDb } = await import('@/lib/firebaseAdmin')
      const adminDb = getAdminDb()

      console.log('📊 Admin DB initialized')

      // 1. Obtener Items de Inventario
      console.log('📊 Fetching inventory items...')
      const inventorySnapshot = await adminDb
        .collection('inventoryItems')
        .where('barId', '==', barId)
        .get()

      console.log('📊 Inventory snapshot size:', inventorySnapshot.size)

      const inventoryItems = inventorySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('📊 Inventory item:', doc.id, data.name, 'stock:', data.currentStockBase)
        return {
          id: doc.id,
          ...data
        }
      })

      console.log('📊 Found', inventoryItems.length, 'inventory items')

      if (inventoryItems.length > 0) {
        console.log('📊 Adding inventory items sheet...')
        this.addInventoryItemsSheet(workbook, inventoryItems)
        console.log('📊 ✅ Inventory items sheet added')
      } else {
        console.log('📊 ⚠️ No inventory items found, skipping inventory sheet')
      }

      // 2. Obtener Movimientos de Inventario (sin orderBy para evitar índice)
      console.log('📊 Fetching inventory movements...')
      const movementsSnapshot = await adminDb
        .collection('inventoryMovements')
        .where('barId', '==', barId)
        .limit(100)
        .get()

      console.log('📊 Movements snapshot size:', movementsSnapshot.size)

      const movements = movementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }))

      console.log('📊 Found', movements.length, 'inventory movements')

      if (movements.length > 0) {
        console.log('📊 Adding inventory movements sheet...')
        this.addInventoryMovementsSheet(workbook, movements)
        console.log('📊 ✅ Inventory movements sheet added')
      } else {
        console.log('📊 ⚠️ No inventory movements found, skipping movements sheet')
      }

      // 3. Obtener Alertas de Stock Bajo
      const alerts = inventoryItems.filter((item: any) => 
        item.currentStockBase <= (item.minStockBase || 0)
      )

      console.log('📊 Found', alerts.length, 'low stock alerts')

      if (alerts.length > 0) {
        console.log('📊 Adding inventory alerts sheet...')
        this.addInventoryAlertsSheet(workbook, alerts)
        console.log('📊 ✅ Inventory alerts sheet added')
      } else {
        console.log('📊 ⚠️ No low stock alerts, skipping alerts sheet')
      }

      console.log('📊 ===== INVENTORY SHEETS COMPLETED =====')

    } catch (error: any) {
      console.error('❌ Error fetching inventory data:', error)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      // Si hay error, simplemente no agregamos las hojas de inventario
    }
  }

  private addInventoryItemsSheet(workbook: XLSX.WorkBook, items: any[]) {
    const inventoryData = [
      ['INVENTARIO ACTUAL'],
      [''],
      ['SKU', 'Nombre', 'Categoría', 'Stock Actual', 'Unidad Base', 'Stock Mínimo', 'Costo Unitario', 'Proveedor', 'Estado']
    ]

    items.forEach((item: any) => {
      const stockStatus = item.currentStockBase <= (item.minStockBase || 0) ? '⚠️ BAJO' : '✓ OK'
      
      inventoryData.push([
        item.sku || '',
        item.name || '',
        item.category || '',
        (item.currentStockBase || 0).toFixed(2),
        item.baseUnit || '',
        (item.minStockBase || 0).toFixed(2),
        '$' + (item.costPerBaseUnit || 0).toFixed(2),
        item.supplier || '',
        stockStatus
      ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(inventoryData)

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 15 }, // SKU
      { wch: 30 }, // Nombre
      { wch: 15 }, // Categoría
      { wch: 12 }, // Stock Actual
      { wch: 12 }, // Unidad Base
      { wch: 12 }, // Stock Mínimo
      { wch: 12 }, // Costo Unitario
      { wch: 20 }, // Proveedor
      { wch: 10 }  // Estado
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario')
  }

  private addInventoryMovementsSheet(workbook: XLSX.WorkBook, movements: any[]) {
    const movementsData = [
      ['MOVIMIENTOS DE INVENTARIO (ÚLTIMOS 100)'],
      [''],
      ['Fecha', 'SKU', 'Insumo', 'Tipo', 'Cantidad', 'Balance Después', 'Costo Total', 'Orden ID', 'Notas']
    ]

    movements.forEach((movement: any) => {
      const typeLabels: Record<string, string> = {
        'sale': 'Venta',
        'purchase': 'Compra',
        'adjustment': 'Ajuste',
        'waste': 'Merma',
        'cancel': 'Cancelación'
      }

      movementsData.push([
        new Date(movement.createdAt).toLocaleDateString() + ' ' + new Date(movement.createdAt).toLocaleTimeString(),
        movement.itemSku || '',
        movement.itemName || '',
        typeLabels[movement.type] || movement.type,
        (movement.quantityBase || 0).toFixed(2),
        (movement.balanceAfter || 0).toFixed(2),
        '$' + (movement.totalCost || 0).toFixed(2),
        movement.orderId || '',
        movement.notes || ''
      ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(movementsData)

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 20 }, // Fecha
      { wch: 15 }, // SKU
      { wch: 25 }, // Insumo
      { wch: 12 }, // Tipo
      { wch: 12 }, // Cantidad
      { wch: 15 }, // Balance Después
      { wch: 12 }, // Costo Total
      { wch: 15 }, // Orden ID
      { wch: 30 }  // Notas
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos')
  }

  private addInventoryAlertsSheet(workbook: XLSX.WorkBook, alerts: any[]) {
    const alertsData = [
      ['⚠️ ALERTAS DE STOCK BAJO'],
      [''],
      ['SKU', 'Nombre', 'Stock Actual', 'Stock Mínimo', 'Unidad', 'Faltante', 'Proveedor']
    ]

    alerts.forEach((item: any) => {
      const shortage = (item.minStockBase || 0) - (item.currentStockBase || 0)
      
      alertsData.push([
        item.sku || '',
        item.name || '',
        (item.currentStockBase || 0).toFixed(2),
        (item.minStockBase || 0).toFixed(2),
        item.baseUnit || '',
        shortage.toFixed(2),
        item.supplier || ''
      ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(alertsData)

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 15 }, // SKU
      { wch: 30 }, // Nombre
      { wch: 12 }, // Stock Actual
      { wch: 12 }, // Stock Mínimo
      { wch: 12 }, // Unidad
      { wch: 12 }, // Faltante
      { wch: 20 }  // Proveedor
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alertas Stock')
  }

  /**
   * Genera el nombre del archivo Excel basado en el bar y la fecha
   */
  generateFileName(barName: string, reportData: ReportData): string {
    const date = new Date().toISOString().split('T')[0]
    const sanitizedBarName = barName.replace(/[^a-z0-9]/gi, '_')
    return `Reporte_CRM_${sanitizedBarName}_${date}.xlsx`
  }
}

export const excelGenerator = new ExcelGeneratorService()

