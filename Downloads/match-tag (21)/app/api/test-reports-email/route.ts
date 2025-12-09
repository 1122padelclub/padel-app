import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'

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

    console.log("📧 Testing reports email to:", testEmail)

    // Crear un email de prueba simple similar a los reportes
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Reporte CRM</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .kpi-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
          .kpi-value { font-size: 2em; font-weight: bold; color: #667eea; margin: 10px 0; }
          .kpi-label { color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Test Reporte CRM</h1>
            <h2>Bar de Prueba</h2>
            <p>Período: Último mes</p>
            <p>Programado: Test Manual</p>
          </div>
          
          <div class="content">
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-value">5</div>
                <div class="kpi-label">Reseñas</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">4.2</div>
                <div class="kpi-label">Calificación Promedio</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">12</div>
                <div class="kpi-label">Pedidos</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">$1,250.00</div>
                <div class="kpi-label">Revenue Total</div>
              </div>
            </div>
            
            <div style="margin: 30px 0;">
              <h3>📝 Reseñas Recientes</h3>
              <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: bold;">Cliente Test</span>
                  <span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">5 ⭐</span>
                </div>
                <p style="margin: 10px 0; font-style: italic;">"Excelente servicio y comida deliciosa. Muy recomendado!"</p>
                <small style="color: #666;">${new Date().toLocaleDateString('es-ES')}</small>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 0.9em;">
              <p>Este es un email de prueba para verificar el funcionamiento del sistema de reportes CRM</p>
              <p>Generado automáticamente por Match Tag CRM</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const testText = `
      TEST REPORTE CRM - Bar de Prueba
      ================================
      
      Período: Último mes
      Programado: Test Manual
      
      RESUMEN EJECUTIVO:
      - Reseñas: 5
      - Calificación Promedio: 4.2
      - Pedidos: 12
      - Revenue Total: $1,250.00
      - Reservas: 8
      - Tasa de Confirmación: 87.5%
      
      RESEÑAS RECIENTES:
      Cliente Test - 5 ⭐
      "Excelente servicio y comida deliciosa. Muy recomendado!"
      
      ---
      Este es un email de prueba para verificar el funcionamiento del sistema de reportes CRM
      Generado automáticamente por Match Tag CRM
    `

    // Enviar email usando la misma estructura que los reportes
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@gibracompany.com',
        to: [testEmail],
        subject: '📊 Test Reporte CRM - Bar de Prueba - Último mes',
        html: testHtml,
        text: testText
      })
    })

    const result = await response.json()

    console.log("📧 Test email API response:", result)
    console.log("📧 Test email status:", response.status)

    if (!response.ok) {
      console.error("❌ Test email API error:", result)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to send test email", 
          details: result,
          status: response.status
        },
        { status: response.status }
      )
    }

    console.log("✅ Test email sent successfully:", result.id)
    return NextResponse.json({ 
      success: true, 
      messageId: result.id,
      message: "Test email sent successfully"
    })

  } catch (error: any) {
    console.error("❌ Error sending test email:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    )
  }
}
