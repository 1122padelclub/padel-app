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

    console.log("🧪 Testing Resend API with email:", to)

    const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'
    const fromEmail = 'onboarding@resend.dev'

    // Test email simple
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: "🧪 Test Email from Match Tag - Resend API",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🧪 Test Email</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Resend API Test - Match Tag</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">✅ Resend API está funcionando!</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #059669; margin-top: 0;">📧 Detalles del Test</h3>
                <p><strong>From:</strong> ${fromEmail}</p>
                <p><strong>To:</strong> ${to}</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>API:</strong> Resend</p>
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin-top: 0;">🎯 Estado del Sistema</h3>
                <ul style="color: #1e40af; margin: 10px 0; padding-left: 20px;">
                  <li>✅ API Key configurada correctamente</li>
                  <li>✅ Email de origen verificado</li>
                  <li>✅ Conexión con Resend establecida</li>
                  <li>✅ Email enviado exitosamente</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px;">
                  Este es un email de prueba para verificar que Resend está funcionando correctamente.<br>
                  Si recibiste este email, ¡el sistema de emails está operativo! 🎉
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
TEST EMAIL - RESEND API - MATCH TAG

✅ Resend API está funcionando!

Detalles del Test:
From: ${fromEmail}
To: ${to}
Timestamp: ${new Date().toLocaleString('es-ES')}
API: Resend

Estado del Sistema:
✅ API Key configurada correctamente
✅ Email de origen verificado
✅ Conexión con Resend establecida
✅ Email enviado exitosamente

Este es un email de prueba para verificar que Resend está funcionando correctamente.
Si recibiste este email, ¡el sistema de emails está operativo! 🎉
        `
      })
    })

    const result = await response.json()

    console.log("📧 Resend API Response Status:", response.status)
    console.log("📧 Resend API Response:", JSON.stringify(result, null, 2))

    if (!response.ok) {
      console.error("❌ Resend API Error:", result)
      return NextResponse.json({
        success: false,
        error: "Failed to send email",
        details: result,
        status: response.status
      }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: result.id,
      details: {
        to,
        from: fromEmail,
        subject: "🧪 Test Email from Match Tag - Resend API",
        timestamp: new Date().toISOString(),
        resendResponse: result
      }
    })

  } catch (error: any) {
    console.error("❌ Error in Resend test:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      type: "API_ERROR"
    }, { status: 500 })
  }
}
