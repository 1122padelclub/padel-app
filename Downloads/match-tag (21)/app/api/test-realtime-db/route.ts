import { NextRequest, NextResponse } from "next/server"
import { getAdminRealtimeDb } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const { barId } = await request.json()
    
    console.log("🔍 ===== TEST REALTIME DB =====")
    console.log("🔍 Bar ID:", barId)
    
    const realtimeDb = getAdminRealtimeDb()
    console.log("🔍 Realtime DB instance created:", !!realtimeDb)
    
    const ordersRef = realtimeDb.ref(`orders/${barId}`)
    console.log("🔍 Orders ref path:", `orders/${barId}`)
    
    const snapshot = await ordersRef.once('value')
    console.log("🔍 Snapshot exists:", snapshot.exists())
    console.log("🔍 Snapshot numChildren:", snapshot.numChildren())
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      console.log("🔍 Data keys:", Object.keys(data))
      console.log("🔍 First order:", Object.values(data)[0])
      
      return NextResponse.json({
        success: true,
        exists: true,
        count: Object.keys(data).length,
        firstOrder: Object.values(data)[0],
        allOrderIds: Object.keys(data)
      })
    } else {
      console.log("🔍 No data found at path:", `orders/${barId}`)
      
      // Intentar listar todos los paths bajo "orders"
      const ordersRootRef = realtimeDb.ref('orders')
      const rootSnapshot = await ordersRootRef.once('value')
      
      if (rootSnapshot.exists()) {
        const allBars = Object.keys(rootSnapshot.val())
        console.log("🔍 Available bar IDs under 'orders':", allBars)
        
        return NextResponse.json({
          success: true,
          exists: false,
          message: "No orders found for this barId",
          availableBarIds: allBars,
          requestedBarId: barId
        })
      } else {
        console.log("🔍 No orders data at all in database")
        return NextResponse.json({
          success: true,
          exists: false,
          message: "No orders data at all in Realtime Database"
        })
      }
    }
    
  } catch (error: any) {
    console.error("❌ Error testing Realtime DB:", error)
    console.error("❌ Error message:", error.message)
    console.error("❌ Error stack:", error.stack)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

