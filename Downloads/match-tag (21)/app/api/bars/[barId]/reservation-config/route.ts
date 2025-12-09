import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function GET(request: NextRequest, { params }: { params: { barId: string } }) {
  try {
    const { barId } = params

    if (!barId) {
      return NextResponse.json({ error: "Bar ID is required" }, { status: 400 })
    }

    const adminDb = getAdminDb()

    // Try to read from new structure first
    const reservationRef = adminDb.collection("bars").doc(barId).collection("reservationSite").doc("config")
    const reservationDoc = await reservationRef.get()

    if (reservationDoc.exists) {
      return NextResponse.json(reservationDoc.data())
    }

    // Fallback to legacy structure
    const barRef = adminDb.collection("bars").doc(barId)
    const barDoc = await barRef.get()

    if (barDoc.exists) {
      const barData = barDoc.data()
      const legacyConfig = barData?.reservationSite || barData?.publicSite || {}
      return NextResponse.json(legacyConfig)
    }

    // Return default config
    return NextResponse.json({
      heroTitle: "Reserva tu Mesa",
      heroSubtitle: "Disfruta de una experiencia gastronómica única",
      colorPrimary: "#3b82f6",
      logoUrl: null,
      backgroundUrl: null,
      showAvailability: true,
      requirePhone: true,
      maxAdvanceDays: 30,
    })
  } catch (error) {
    console.error("Error reading reservation config:", error)
    return NextResponse.json({ error: "Failed to read reservation config" }, { status: 500 })
  }
}
