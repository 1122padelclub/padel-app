import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const { barId } = await request.json()

    if (!barId) {
      return NextResponse.json(
        { error: "barId is required" },
        { status: 400 }
      )
    }

    console.log(`📊 Getting debug data for bar: ${barId}`)
    
    const adminDb = getAdminDb()
    const debugData: any = {
      barId,
      timestamp: new Date().toISOString()
    }

    // 1. Reviews
    console.log("📊 Getting reviews...")
    const reviewsSnapshot = await adminDb.collection("bars").doc(barId).collection("reviews").get()
    debugData.reviews = {
      total: reviewsSnapshot.size,
      docs: reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }

    // 2. Orders (desde Realtime Database)
    console.log("📊 Getting orders from Realtime Database...")
    console.log("📊 Bar ID:", barId)
    let ordersData: any[] = []
    
    try {
      const { getAdminApp, getAdminRealtimeDb } = await import('@/lib/firebaseAdmin')
      
      // Forzar inicialización de la app primero
      const app = getAdminApp()
      console.log("📊 Admin App initialized:", app.name)
      
      const realtimeDb = getAdminRealtimeDb()
      console.log("📊 Got Realtime DB instance:", !!realtimeDb)
      
      const ordersRef = realtimeDb.ref(`orders/${barId}`)
      console.log("📊 Orders ref path:", `orders/${barId}`)
      
      const snapshot = await ordersRef.once('value')
      console.log("📊 Snapshot exists:", snapshot.exists())
      console.log("📊 Snapshot size:", snapshot.numChildren())
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        console.log("📊 Raw data keys count:", Object.keys(data || {}).length)
        
        ordersData = Object.entries(data).map(([id, orderData]: [string, any]) => ({
          id,
          createdAt: orderData.createdAt ? new Date(orderData.createdAt).toISOString() : 'No date',
          total: orderData.total,
          status: orderData.status,
          items: orderData.items?.length || 0
        }))
        
        console.log("📊 Processed orders count:", ordersData.length)
      } else {
        console.log("📊 No orders found in Realtime DB")
      }
    } catch (error: any) {
      console.error("❌ Error getting orders from Realtime DB:", error)
      console.error("❌ Error message:", error.message)
      console.error("❌ Error stack:", error.stack)
      ordersData = []
    }
    
    debugData.orders = {
      total: ordersData.length,
      docs: ordersData
    }

    // También verificar en Firestore para comparar
    console.log("📊 Checking orders in Firestore for comparison...")
    try {
      const ordersSnapshot = await adminDb.collection("bars").doc(barId).collection("orders").get()
      const firestoreOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || 'No date',
        total: doc.data().total,
        status: doc.data().status,
        items: doc.data().items?.length || 0
      }))
      console.log(`📊 Found ${firestoreOrders.length} orders in Firestore`)
      
      debugData.ordersFirestore = {
        total: firestoreOrders.length,
        docs: firestoreOrders
      }
    } catch (error: any) {
      console.error("❌ Error getting orders from Firestore:", error)
      debugData.ordersFirestore = {
        total: 0,
        docs: []
      }
    }

    // 3. Reservations
    console.log("📊 Getting reservations...")
    const reservationsSnapshot = await adminDb.collection("bars").doc(barId).collection("reservations").get()
    debugData.reservations = {
      total: reservationsSnapshot.size,
      docs: reservationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }

    // 4. Inventory Items
    console.log("📊 Getting inventory items...")
    const inventorySnapshot = await adminDb.collection("inventoryItems").where("barId", "==", barId).get()
    debugData.inventory = {
      total: inventorySnapshot.size,
      docs: inventorySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          sku: data.sku,
          currentStockBase: data.currentStockBase,
          minStockBase: data.minStockBase,
          baseUnit: data.baseUnit
        }
      })
    }

    // 5. Inventory Movements (sin orderBy para evitar índice)
    console.log("📊 Getting inventory movements...")
    const movementsSnapshot = await adminDb
      .collection("inventoryMovements")
      .where("barId", "==", barId)
      .limit(10)
      .get()
    
    debugData.movements = {
      total: movementsSnapshot.size,
      docs: movementsSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          type: data.type,
          itemSku: data.itemSku,
          itemName: data.itemName,
          quantityBase: data.quantityBase,
          balanceAfter: data.balanceAfter,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || 'No date'
        }
      })
    }

    // 6. Calcular período y filtros
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    
    debugData.period = {
      start: startDate.toISOString(),
      end: now.toISOString(),
      label: "Últimos 3 meses"
    }

    // Filtrar orders por período
    const ordersInPeriod = debugData.orders.docs.filter((o: any) => {
      if (!o.createdAt || o.createdAt === 'No date') return false
      return new Date(o.createdAt) >= startDate
    })

    debugData.ordersInPeriod = ordersInPeriod.length
    debugData.totalRevenueInPeriod = ordersInPeriod.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

    console.log("✅ Debug data collected:", debugData)

    return NextResponse.json({
      success: true,
      data: debugData
    })

  } catch (error: any) {
    console.error("❌ Error getting debug data:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}

