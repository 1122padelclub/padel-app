import { NextRequest, NextResponse } from "next/server"
import { ReservationEmailService } from "@/src/services/reservationEmailService"
import type { Reservation } from "@/src/types"

export async function POST(request: NextRequest) {
  try {
    const { to, barName } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: "to email is required" },
        { status: 400 }
      )
    }

    console.log("📧 Enviando email de prueba de reserva:")
    console.log("To:", to)
    console.log("Bar Name:", barName || "Match Tag Bar")

    // Crear una reserva de prueba
    const testReservation: Reservation = {
      id: `test_${Date.now()}`,
      barId: "test_bar",
      customerName: "Cliente de Prueba",
      customerEmail: to,
      customerPhone: "+1234567890",
      partySize: 4,
      reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      time: "19:30",
      status: "confirmed",
      notes: "Esta es una reserva de prueba para verificar el sistema de emails.",
      assignedTable: "Mesa 5",
      createdAt: new Date()
    }

    // Enviar email de confirmación
    const emailService = ReservationEmailService.getInstance()
    const result = await emailService.sendReservationConfirmation(testReservation, barName || "Match Tag Bar")

    if (result.success) {
      console.log("✅ Email de confirmación de reserva enviado:", result)
      return NextResponse.json({
        success: true,
        message: "Email de confirmación de reserva enviado exitosamente",
        timestamp: new Date().toISOString(),
        messageId: result.messageId,
        details: {
          to,
          barName: barName || "Match Tag Bar",
          reservationId: testReservation.id,
          customerName: testReservation.customerName,
          reservationDate: testReservation.reservationDate.toISOString(),
          reservationTime: testReservation.time
        }
      })
    } else {
      console.error("❌ Error enviando email de confirmación:", result.error)
      return NextResponse.json(
        { error: `Error sending confirmation email: ${result.error}` },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error("Error en test de email de reserva:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
