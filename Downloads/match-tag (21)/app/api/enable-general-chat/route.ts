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

    const adminDb = getAdminDb()
    const barRef = adminDb.collection("bars").doc(barId)
    
    await barRef.update({
      generalChatEnabled: true,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "General chat enabled successfully"
    })
  } catch (error: any) {
    console.error("Error enabling general chat:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Endpoint para habilitar en todos los bares
export async function PUT(request: NextRequest) {
  try {
    const adminDb = getAdminDb()
    const barsSnapshot = await adminDb.collection("bars").get()
    
    const updatePromises = barsSnapshot.docs.map(doc => 
      doc.ref.update({
        generalChatEnabled: true,
        updatedAt: new Date()
      })
    )
    
    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `General chat enabled in ${barsSnapshot.size} bars`,
      count: barsSnapshot.size
    })
  } catch (error: any) {
    console.error("Error enabling general chat in all bars:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}






