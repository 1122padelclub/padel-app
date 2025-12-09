import { NextRequest, NextResponse } from "next/server"
import { emailService } from "@/src/services/emailService"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { error: "testEmail is required" },
        { status: 400 }
      )
    }

    console.log("📧 Testing emailService directly...")
    console.log("📧 Test email:", testEmail)

    // Crear datos de prueba
    const testReportData = {
      reviews: [],
      orders: [],
      reservations: [],
      period: {
        start: new Date(),
        end: new Date(),
        label: "Test Period"
      },
      summary: {
        totalReviews: 0,
        averageRating: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalReservations: 0,
        confirmationRate: 0
      }
    }

    const testReportTypes = [
      { type: "consolidated", includeCharts: true, includeRawData: true }
    ]

    console.log("📧 Calling emailService.sendReportEmail...")
    
    const result = await emailService.sendReportEmail(
      [testEmail],
      testReportData,
      testReportTypes,
      "Test Bar",
      "Test Report",
      "test-bar-id" // Bar ID de prueba
    )

    console.log("📧 EmailService result:", result)

    return NextResponse.json({
      success: true,
      emailServiceResult: result,
      message: "EmailService test completed"
    })

  } catch (error: any) {
    console.error("❌ Error testing emailService:", error)
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
