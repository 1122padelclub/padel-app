import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { emailService } from "@/src/services/emailService"
import type { ReportData, ReportSchedule, EmailReport } from "@/src/types"

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Starting report send process...")
    const { scheduleId, barId } = await request.json()
    console.log(`📋 Schedule ID: ${scheduleId}, Bar ID: ${barId}`)

    if (!scheduleId || !barId) {
      console.error("❌ Missing required parameters")
      return NextResponse.json(
        { error: "scheduleId and barId are required" },
        { status: 400 }
      )
    }

    // Obtener la configuración del reporte programado usando Admin SDK
    const adminDb = getAdminDb()
    const scheduleRef = adminDb.collection("bars").doc(barId).collection("reportSchedules").doc(scheduleId)
    const scheduleDoc = await scheduleRef.get()
    
    if (!scheduleDoc.exists) {
      console.error(`❌ Report schedule not found: ${scheduleId} for bar: ${barId}`)
      return NextResponse.json(
        { error: "Report schedule not found" },
        { status: 404 }
      )
    }

    const schedule = scheduleDoc.data() as ReportSchedule
    console.log(`📋 Found schedule: ${schedule.name}`)

    if (!schedule.isActive) {
      return NextResponse.json(
        { error: "Report schedule is not active" },
        { status: 400 }
      )
    }

    // Obtener datos del CRM
    console.log("📊 Getting report data...")
    const reportData = await getReportData(barId, schedule.reportTypes, schedule.dataPeriod || "day")
    console.log(`📊 Report data retrieved: ${reportData.reviews.length} reviews, ${reportData.orders.length} orders, ${reportData.reservations.length} reservations`)

    // Obtener información del bar usando Admin SDK
    const barRef = adminDb.collection("bars").doc(barId)
    const barDoc = await barRef.get()
    const barName = !barDoc.exists ? "Bar" : barDoc.data()?.name || "Bar"
    console.log(`🏪 Bar name: ${barName}`)

    // Enviar email
    console.log("📧 About to send report email...")
    console.log("📧 Recipients:", schedule.recipients)
    console.log("📧 Bar Name:", barName)
    console.log("📧 Schedule Name:", schedule.name)
    console.log("📧 Report Types:", schedule.reportTypes)
    
    const emailResult = await emailService.sendReportEmail(
      schedule.recipients,
      reportData,
      schedule.reportTypes,
      barName,
      schedule.name,
      barId
    )
    
    console.log("📧 Email result:", emailResult)

    // Registrar el envío en la base de datos
    const emailReport: Omit<EmailReport, 'id'> = {
      scheduleId,
      barId,
      sentAt: new Date(),
      recipients: schedule.recipients,
      reportTypes: schedule.reportTypes,
      status: emailResult.success ? "sent" : "failed",
      errorMessage: emailResult.error || null, // Asegurar que no sea undefined
      attachments: [] // Se llenaría con los archivos adjuntos reales
    }

    await adminDb.collection("bars").doc(barId).collection("emailReports").add({
      ...emailReport,
      createdAt: new Date()
    })

    // Actualizar la fecha del último envío y calcular la próxima
    const nextScheduled = calculateNextScheduled(schedule)
    await scheduleRef.update({
      lastSent: new Date(),
      nextScheduled: nextScheduled,
      updatedAt: new Date()
    })

    console.log("📧 Report send completed successfully")
    console.log("📧 MessageId:", emailResult.messageId)
    console.log("📧 Next scheduled:", nextScheduled.toISOString())

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      nextScheduled: nextScheduled.toISOString(),
      recipients: schedule.recipients,
      emailSent: emailResult.success
    })

  } catch (error: any) {
    console.error("Error sending report:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

async function getReportData(barId: string, reportTypes: any[], dataPeriod: string = "day"): Promise<ReportData> {
  console.log(`📊 Getting report data for bar: ${barId}, period: ${dataPeriod}`)
  
  const adminDb = getAdminDb()
  
  // Calcular fechas según el período
  const now = new Date()
  let startDate: Date
  let endDate: Date = now
  
  switch (dataPeriod) {
    case "day":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case "week":
      const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000))
      startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  
  console.log(`📊 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
  
  // Obtener datos de reseñas usando Admin SDK
  console.log("📊 Getting reviews...")
  const reviewsSnapshot = await adminDb.collection("bars").doc(barId).collection("reviews").get()
  const allReviews = reviewsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date()
  }))
  
  // Filtrar reseñas por período
  const reviews = allReviews.filter(review => {
    const reviewDate = review.createdAt
    return reviewDate >= startDate && reviewDate <= endDate
  })
  
  console.log(`📊 Found ${allReviews.length} total reviews, ${reviews.length} in period`)

  // Obtener datos de pedidos desde Realtime Database (como hace el dashboard)
  console.log("📊 ===== GETTING ORDERS FROM REALTIME DB =====")
  console.log("📊 Bar ID:", barId)
  let orders: any[] = []
  
  try {
    // Importar y forzar inicialización
    const { getAdminApp, getAdminRealtimeDb } = await import('@/lib/firebaseAdmin')
    
    // Forzar que la app se inicialice PRIMERO
    console.log("📊 Getting Admin App...")
    const app = getAdminApp()
    console.log("📊 Admin App initialized:", app.name)
    
    // Ahora obtener Realtime DB
    console.log("📊 Getting Realtime DB instance...")
    const realtimeDb = getAdminRealtimeDb()
    console.log("📊 Realtime DB instance created:", !!realtimeDb)
    
    const ordersRef = realtimeDb.ref(`orders/${barId}`)
    console.log("📊 Orders ref path:", `orders/${barId}`)
    
    console.log("📊 Fetching snapshot...")
    const snapshot = await ordersRef.once('value')
    console.log("📊 Snapshot exists:", snapshot.exists())
    console.log("📊 Snapshot numChildren:", snapshot.numChildren())
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      const orderKeys = Object.keys(data || {})
      console.log("📊 Raw data keys count:", orderKeys.length)
      console.log("📊 First 5 order IDs:", orderKeys.slice(0, 5))
      
      const allOrders = Object.entries(data).map(([id, orderData]: [string, any]) => {
        const order = {
          id,
          ...orderData,
          createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date()
        }
        return order
      })
      
      // Filtrar pedidos por período
      orders = allOrders.filter(order => {
        const orderDate = order.createdAt
        return orderDate >= startDate && orderDate <= endDate
      })
      
      console.log(`📊 Found ${allOrders.length} total orders, ${orders.length} in period`)
      
      // Ordenar por fecha de creación (más reciente primero)
      orders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
      
      console.log(`📊 Sorted ${orders.length} orders`)
      
      // Calcular revenue total
      const totalRevenueAll = orders.reduce((sum, o) => sum + (o.total || 0), 0)
      console.log(`📊 Total revenue from all ${orders.length} orders: $${totalRevenueAll}`)
      
      // Mostrar primeros 3 pedidos
      console.log("📊 First 3 orders:")
      orders.slice(0, 3).forEach((o, i) => {
        console.log(`  ${i + 1}. ID: ${o.id}, Total: $${o.total}, Status: ${o.status}, Date: ${o.createdAt}`)
      })
    } else {
      console.log("📊 ⚠️ Snapshot does not exist - No orders found")
    }
    
    console.log(`📊 ===== FINAL COUNT: ${orders.length} ORDERS =====`)
    
  } catch (error: any) {
    console.error("❌ ===== ERROR GETTING ORDERS =====")
    console.error("❌ Error:", error)
    console.error("❌ Message:", error.message)
    console.error("❌ Stack:", error.stack)
    orders = []
  }

  // Obtener datos de reservas usando Admin SDK
  console.log("📊 Getting reservations...")
  const reservationsSnapshot = await adminDb.collection("bars").doc(barId).collection("reservations").get()
  const allReservations = reservationsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    reservationDate: doc.data().reservationDate?.toDate?.() || new Date()
  }))
  
  // Filtrar reservas por período
  const reservations = allReservations.filter(reservation => {
    const reservationDate = reservation.reservationDate
    return reservationDate >= startDate && reservationDate <= endDate
  })
  
  console.log(`📊 Found ${allReservations.length} total reservations, ${reservations.length} in period`)

  // Calcular resumen
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews : 0
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalReservations = reservations.length
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length
  const confirmationRate = totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0

  console.log(`📊 Summary calculated: ${totalOrders} orders, $${totalRevenue} revenue`)

  // Generar etiqueta del período
  const periodLabel = dataPeriod === "day" ? "Del Día" : 
                     dataPeriod === "week" ? "De la Semana" : 
                     dataPeriod === "month" ? "Del Mes" : "Personalizado"

  return {
    reviews,
    orders,
    reservations,
    period: {
      start: startDate,
      end: endDate,
      label: periodLabel
    },
    summary: {
      totalReviews,
      averageRating,
      totalOrders,
      totalRevenue,
      totalReservations,
      confirmationRate
    }
  }
}

function calculateNextScheduled(schedule: ReportSchedule): Date {
  const now = new Date()
  const [hours, minutes] = schedule.time.split(":").map(Number)
  
  let nextDate = new Date(now)
  nextDate.setUTCHours(hours, minutes, 0, 0)

  // Si ya pasó la hora de hoy, programar para mañana
  if (nextDate <= now) {
    nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  }

  switch (schedule.frequency) {
    case "daily":
      return nextDate

    case "weekly":
      const targetDay = schedule.dayOfWeek || 0
      const currentDay = nextDate.getUTCDay()
      const daysUntilTarget = (targetDay - currentDay + 7) % 7
      nextDate.setUTCDate(nextDate.getUTCDate() + daysUntilTarget)
      return nextDate

    case "monthly":
      const targetDayOfMonth = schedule.dayOfMonth || 1
      nextDate.setUTCDate(targetDayOfMonth)
      
      if (nextDate <= now) {
        nextDate.setUTCMonth(nextDate.getUTCMonth() + 1)
      }
      return nextDate

    default:
      return nextDate
  }
}
