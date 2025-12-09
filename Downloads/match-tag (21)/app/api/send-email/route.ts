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

    // Asegurar que 'to' sea un array
    const recipients = Array.isArray(to) ? to : [to]

    console.log("📧 Sending email via API route:")
    console.log("📧 To:", to)
    console.log("📧 To type:", typeof to, Array.isArray(to))
    console.log("📧 Recipients:", recipients)
    console.log("📧 Subject:", subject)
    console.log("📧 HTML length:", html.length)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@gibracompany.com',
        to: recipients,
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

    console.log("✅ Email sent successfully:", result.id)
    return NextResponse.json({ success: true, messageId: result.id })

  } catch (error: any) {
    console.error("❌ Error sending email:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}





