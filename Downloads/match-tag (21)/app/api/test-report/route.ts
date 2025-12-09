import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    const barId = request.nextUrl.searchParams.get("barId")
    
    if (!barId) {
      return NextResponse.json({ error: "Bar ID is required" }, { status: 400 })
    }

    console.log(`🧪 Testing report for bar: ${barId}`)

    // Obtener reportes programados activos
    const schedulesRef = collection(db, "bars", barId, "reportSchedules")
    const activeSchedulesQuery = query(
      schedulesRef,
      where("isActive", "==", true)
    )

    const schedulesSnapshot = await getDocs(activeSchedulesQuery)
    
    if (schedulesSnapshot.empty) {
      return NextResponse.json({ 
        message: "No active report schedules found",
        barId 
      })
    }

    const results = []

    for (const scheduleDoc of schedulesSnapshot.docs) {
      const schedule = { id: scheduleDoc.id, ...scheduleDoc.data() }
      
      console.log(`📋 Processing schedule: ${schedule.name}`)
      console.log(`   - Frequency: ${schedule.frequency}`)
      console.log(`   - Time: ${schedule.time}`)
      console.log(`   - Next Scheduled: ${schedule.nextScheduled}`)
      console.log(`   - Is Active: ${schedule.isActive}`)

      // Llamar a la API de envío de reportes
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reports/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduleId: schedule.id,
            barId: barId
          })
        })

        const responseData = await response.json()
        
        results.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          success: response.ok,
          status: response.status,
          data: responseData
        })

        console.log(`✅ Report ${schedule.name} processed:`, responseData)
      } catch (error: any) {
        console.error(`❌ Error processing report ${schedule.name}:`, error.message)
        results.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          success: false,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      barId,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error("❌ Error testing reports:", error)
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    )
  }
}





