import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      )
    }

    console.log("📧 Sending reservation email via API route:", { to, subject })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@gibracompany.com',
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("❌ Resend API error:", result)
      return NextResponse.json(
        { error: "Failed to send email", details: result },
        { status: response.status }
      )
    }

    console.log("✅ Reservation email sent successfully:", result.id)
    return NextResponse.json({ success: true, messageId: result.id })

  } catch (error: any) {
    console.error("❌ Error sending reservation email:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}






