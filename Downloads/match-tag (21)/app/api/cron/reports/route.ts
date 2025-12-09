import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ReportSchedule } from "@/src/types"

// Configurar la ruta como dinámica para permitir el uso de request.headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar que la request viene de Vercel Cron
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🕐 Ejecutando cron job para reportes programados...")

    // Obtener todos los reportes programados activos
    const schedulesQuery = query(
      collection(db, "bars"),
      where("reportSchedules", "!=", null)
    )

    const barsSnapshot = await getDocs(schedulesQuery)
    let processedSchedules = 0
    let sentReports = 0
    let errors = 0

    for (const barDoc of barsSnapshot.docs) {
      const barId = barDoc.id
      
      // Obtener reportes programados de este bar
      const schedulesRef = collection(db, "bars", barId, "reportSchedules")
      const activeSchedulesQuery = query(
        schedulesRef,
        where("isActive", "==", true)
      )

      const schedulesSnapshot = await getDocs(activeSchedulesQuery)
      
      for (const scheduleDoc of schedulesSnapshot.docs) {
        const schedule = { id: scheduleDoc.id, ...scheduleDoc.data() } as ReportSchedule
        processedSchedules++

        try {
          // Verificar si es hora de enviar el reporte
          if (shouldSendReport(schedule)) {
            console.log(`📧 Enviando reporte: ${schedule.name} para bar ${barId}`)
            
            // Llamar a la API de envío de reportes
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

            if (response.ok) {
              sentReports++
              console.log(`✅ Reporte enviado exitosamente: ${schedule.name}`)
            } else {
              errors++
              const errorData = await response.json()
              console.error(`❌ Error enviando reporte ${schedule.name}:`, errorData.error)
            }
          } else {
            console.log(`⏰ Reporte ${schedule.name} no es hora de enviar aún`)
          }
        } catch (error: any) {
          errors++
          console.error(`❌ Error procesando reporte ${schedule.name}:`, error.message)
        }
      }
    }

    const result = {
      success: true,
      processedSchedules,
      sentReports,
      errors,
      timestamp: new Date().toISOString()
    }

    console.log("📊 Resumen del cron job:", result)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error("❌ Error en cron job de reportes:", error)
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    )
  }
}

function shouldSendReport(schedule: ReportSchedule): boolean {
  const now = new Date()
  const nextScheduled = schedule.nextScheduled ? new Date(schedule.nextScheduled) : null

  if (!nextScheduled) {
    console.log(`⚠️ No nextScheduled date for schedule: ${schedule.name}`)
    return false
  }

  // Verificar si es hora de enviar (con una tolerancia de 30 minutos)
  const timeDiff = now.getTime() - nextScheduled.getTime()
  const thirtyMinutes = 30 * 60 * 1000

  const shouldSend = timeDiff >= 0 && timeDiff <= thirtyMinutes
  
  console.log(`🕐 Schedule: ${schedule.name}`)
  console.log(`   - Next scheduled: ${nextScheduled.toISOString()}`)
  console.log(`   - Current time: ${now.toISOString()}`)
  console.log(`   - Time diff: ${Math.round(timeDiff / 60000)} minutes`)
  console.log(`   - Should send: ${shouldSend}`)

  return shouldSend
}
