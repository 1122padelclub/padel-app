import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    
    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      )
    }

    console.log("📧 Checking email status for messageId:", messageId)

    // Verificar estado del email en Resend
    const response = await fetch(`https://api.resend.com/emails/${messageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    const result = await response.json()

    console.log("📧 Email status response:", result)

    if (!response.ok) {
      console.error("❌ Error checking email status:", result)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to check email status", 
          details: result 
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ 
      success: true, 
      emailStatus: result,
      message: "Email status retrieved successfully"
    })

  } catch (error: any) {
    console.error("❌ Error checking email status:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    )
  }
}

// Endpoint para listar emails recientes
export async function POST(request: NextRequest) {
  try {
    console.log("📧 Listing recent emails...")

    // Listar emails recientes de Resend
    const response = await fetch('https://api.resend.com/emails?limit=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    const result = await response.json()

    console.log("📧 Recent emails response:", result)

    if (!response.ok) {
      console.error("❌ Error listing emails:", result)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to list emails", 
          details: result 
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ 
      success: true, 
      emails: result.data || [],
      message: "Recent emails retrieved successfully"
    })

  } catch (error: any) {
    console.error("❌ Error listing emails:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    )
  }
}
