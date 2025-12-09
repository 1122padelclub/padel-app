import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      )
    }

    console.log("🔍 Debug email sending to:", to)

    const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'
    const fromEmail = 'noreply@gibracompany.com'

    // Paso 1: Verificar API key
    console.log("Step 1: Verifying API key...")
    console.log("API Key:", RESEND_API_KEY.substring(0, 10) + "...")

    // Paso 2: Verificar dominios
    console.log("Step 2: Checking domains...")
    const domainsResponse = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    console.log("Domains API Status:", domainsResponse.status)
    
    let domainsData = null
    if (domainsResponse.ok) {
      domainsData = await domainsResponse.json()
      console.log("Available domains:", domainsData)
    } else {
      const errorData = await domainsResponse.json()
      console.error("Domains API Error:", errorData)
    }

    // Paso 3: Intentar enviar email
    console.log("Step 3: Attempting to send email...")
    console.log("From:", fromEmail)
    console.log("To:", to)

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: "🔍 Debug Email - Match Tag",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #374151;">🔍 Debug Email</h2>
              <p><strong>From:</strong> ${fromEmail}</p>
              <p><strong>To:</strong> ${to}</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString('es-ES')}</p>
              <p><strong>Status:</strong> Email sent successfully!</p>
            </div>
            <p>Si recibiste este email, el sistema de Resend está funcionando correctamente.</p>
          </div>
        `,
        text: `Debug Email - From: ${fromEmail}, To: ${to}, Timestamp: ${new Date().toLocaleString('es-ES')}`
      })
    })

    console.log("Email API Status:", emailResponse.status)
    
    const emailResult = await emailResponse.json()
    console.log("Email API Response:", emailResult)

    // Determinar el resultado
    const isSuccess = emailResponse.ok
    const gibraDomain = domainsData?.data?.find((domain: any) => domain.name === 'gibracompany.com')

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess ? "Email sent successfully!" : "Email sending failed",
      details: {
        apiKey: {
          present: !!RESEND_API_KEY,
          format: RESEND_API_KEY.startsWith('re_'),
          length: RESEND_API_KEY.length
        },
        domains: {
          available: domainsData?.data?.length || 0,
          gibraCompany: gibraDomain ? {
            status: gibraDomain.status,
            verified: gibraDomain.status === 'verified'
          } : null
        },
        email: {
          from: fromEmail,
          to: to,
          status: emailResponse.status,
          response: emailResult
        }
      },
      recommendations: !isSuccess ? [
        gibraDomain?.status !== 'verified' ? "Verify gibracompany.com domain in Resend dashboard" : null,
        emailResult.message ? `Error: ${emailResult.message}` : "Unknown error occurred",
        "Check Resend API key permissions",
        "Verify DNS records for gibracompany.com"
      ].filter(Boolean) : []
    })

  } catch (error: any) {
    console.error("❌ Debug email error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.name || "Error",
      stack: error.stack
    }, { status: 500 })
  }
}
