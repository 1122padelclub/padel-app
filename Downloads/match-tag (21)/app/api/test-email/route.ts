import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "to, subject, and message are required" },
        { status: 400 }
      )
    }

    console.log("📧 Enviando email con Resend:")
    console.log("To:", to)
    console.log("Subject:", subject)
    console.log("From: noreply@gibracompany.com")
    console.log("Timestamp:", new Date().toISOString())

    // Intentar usar email personalizado, fallback al de prueba
    const fromEmail = 'noreply@gibracompany.com' // Email personalizado de Gibra Company
    
    // Enviar email usando fetch directo a la API de Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: to,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">📊 Match Tag CRM</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Sistema de Reportes Automatizados</p>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #333; margin-bottom: 20px;">Reporte CRM - ${new Date().toLocaleDateString('es-ES')}</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin-top: 0;">Contenido del Reporte:</h3>
                <div style="white-space: pre-line; color: #374151;">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #0369a1; font-size: 14px;">
                  <strong>📧 Enviado desde:</strong> ${fromEmail}<br>
                  <strong>📅 Fecha:</strong> ${new Date().toLocaleString('es-ES')}<br>
                  <strong>🎯 Destinatario:</strong> ${to}
                </p>
              </div>
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  Este es un email automático del sistema Match Tag CRM.<br>
                  No responder a este mensaje.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Match Tag CRM - Reporte del ${new Date().toLocaleDateString('es-ES')}\n\n${message}\n\nEnviado desde: ${fromEmail}\nDestinatario: ${to}\nFecha: ${new Date().toLocaleString('es-ES')}\n\nEste es un email automático del sistema Match Tag CRM.`
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Error sending email')
    }

    console.log("✅ Email enviado exitosamente:", result)

    return NextResponse.json({
      success: true,
      message: "Email enviado exitosamente con Resend",
      timestamp: new Date().toISOString(),
      messageId: result.id,
      details: {
        to,
        subject,
        from: fromEmail,
        messageLength: message.length,
        resendResponse: result
      }
    })

  } catch (error: any) {
    console.error("Error en test de email:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
