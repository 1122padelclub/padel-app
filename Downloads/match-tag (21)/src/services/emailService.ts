import type { ReportData, EmailReport, EmailAttachment, ReportType } from "@/src/types"

// Configuración del servicio de email
const EMAIL_CONFIG = {
  // Usar Resend como servicio de email (gratis hasta 3,000 emails/mes)
  apiKey: process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY || "re_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ",
  fromEmail: process.env.FROM_EMAIL || process.env.NEXT_PUBLIC_FROM_EMAIL || "noreply@gibracompany.com",
  baseUrl: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // Email de prueba mientras configuramos el dominio personalizado
  testFromEmail: "onboarding@resend.dev",
  // Email personalizado con dominio verificado
  customFromEmail: "noreply@gibracompany.com"
}

export class EmailService {
  private static instance: EmailService
  private apiKey: string
  private fromEmail: string
  private baseUrl: string

  constructor() {
    this.apiKey = EMAIL_CONFIG.apiKey
    this.fromEmail = EMAIL_CONFIG.fromEmail
    this.baseUrl = EMAIL_CONFIG.baseUrl
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendReportEmail(
    recipients: string[],
    reportData: ReportData,
    reportTypes: ReportType[],
    barName: string,
    scheduleName: string,
    barId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log("📧 Starting email send process...")
      console.log("📧 Method called with recipients:", recipients)
      console.log("📧 API Key available:", !!this.apiKey)
      console.log("📧 API Key length:", this.apiKey?.length || 0)
      console.log("📧 API Key starts with:", this.apiKey?.substring(0, 10) || "none")
      
      const emailContent = this.generateEmailContent(reportData, reportTypes, barName, scheduleName)
      const attachments = await this.generateAttachments(reportData, reportTypes, barName, barId)

      // Intentar usar el email personalizado, fallback al de prueba
      const fromEmail = EMAIL_CONFIG.customFromEmail || EMAIL_CONFIG.testFromEmail

      console.log("📧 Enviando reporte con Resend:")
      console.log("📧 Recipients:", recipients)
      console.log("📧 Recipients type:", typeof recipients, Array.isArray(recipients))
      console.log("📧 Bar Name:", barName)
      console.log("📧 Schedule Name:", scheduleName)
      console.log("📧 From:", fromEmail)
      console.log("📧 API Key (first 10 chars):", this.apiKey?.substring(0, 10))
      console.log("📧 Email content length:", emailContent.html.length)
      console.log("📧 Attachments count:", attachments.length)

      // Enviar email directamente a Resend (sin usar API route interna)
      console.log("📧 Calling Resend API directly...")
      
      const emailPayload: any = {
        from: fromEmail,
        to: recipients,
        subject: `📊 Reporte CRM - ${barName} - ${reportData.period.label}`,
        html: emailContent.html,
        text: emailContent.text,
      }

      // Agregar attachments si existen
      if (attachments.length > 0) {
        emailPayload.attachments = attachments
        console.log("📧 Including", attachments.length, "attachment(s)")
      }
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      })

      const result = await response.json()
      
      console.log("📧 Resend API Response Status:", response.status)
      console.log("📧 Resend API Response:", JSON.stringify(result, null, 2))
      console.log("📧 Response OK:", response.ok)

      if (!response.ok) {
        console.error("❌ Resend API Error:", result)
        console.error("❌ Error details:", {
          status: response.status,
          statusText: response.statusText,
          result: result
        })
        return { success: false, error: result.message || `HTTP ${response.status}: Error sending email` }
      }

      console.log("✅ Email enviado exitosamente:", result)
      console.log("✅ MessageId:", result.id)

      return { success: true, messageId: result.id }

    } catch (error: any) {
      console.error("❌ Error sending report email:", error)
      console.error("❌ Error stack:", error.stack)
      console.error("❌ Error details:", {
        message: error.message,
        name: error.name,
        cause: error.cause
      })
      return { success: false, error: error.message }
    }
  }

  private generateEmailContent(
    reportData: ReportData,
    reportTypes: ReportType[],
    barName: string,
    scheduleName: string
  ): { html: string; text: string } {
    const { summary, period } = reportData

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte CRM - ${barName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .kpi-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
          .kpi-value { font-size: 2em; font-weight: bold; color: #667eea; margin: 10px 0; }
          .kpi-label { color: #666; font-size: 0.9em; }
          .section { margin: 30px 0; }
          .section h3 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 0.9em; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
          .badge-success { background: #d4edda; color: #155724; }
          .badge-warning { background: #fff3cd; color: #856404; }
          .badge-danger { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Reporte CRM</h1>
            <h2>${barName}</h2>
            <p>Período: ${period.label}</p>
            <p>Programado: ${scheduleName}</p>
          </div>
          
          <div class="content">
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-value">${summary.totalReviews}</div>
                <div class="kpi-label">Reseñas</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">${summary.averageRating.toFixed(1)}</div>
                <div class="kpi-label">Calificación Promedio</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">${summary.totalOrders}</div>
                <div class="kpi-label">Pedidos</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">$${summary.totalRevenue.toFixed(2)}</div>
                <div class="kpi-label">Revenue Total</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">${summary.totalReservations}</div>
                <div class="kpi-label">Reservas</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-value">${summary.confirmationRate.toFixed(1)}%</div>
                <div class="kpi-label">Tasa de Confirmación</div>
              </div>
            </div>

            ${this.generateReportSections(reportData, reportTypes)}

            <div class="footer">
              <p>Este reporte fue generado automáticamente por Match Tag CRM</p>
              <p>Para más detalles, accede al panel de administración</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      REPORTE CRM - ${barName}
      ================================
      
      Período: ${period.label}
      Programado: ${scheduleName}
      
      RESUMEN EJECUTIVO:
      - Reseñas: ${summary.totalReviews}
      - Calificación Promedio: ${summary.averageRating.toFixed(1)}
      - Pedidos: ${summary.totalOrders}
      - Revenue Total: $${summary.totalRevenue.toFixed(2)}
      - Reservas: ${summary.totalReservations}
      - Tasa de Confirmación: ${summary.confirmationRate.toFixed(1)}%
      
      Para más detalles, revisa los archivos adjuntos o accede al panel de administración.
      
      ---
      Generado automáticamente por Match Tag CRM
    `

    return { html, text }
  }

  private generateReportSections(reportData: ReportData, reportTypes: ReportType[]): string {
    let sections = ""

    reportTypes.forEach(reportType => {
      switch (reportType.type) {
        case "reviews":
          sections += this.generateReviewsSection(reportData.reviews)
          break
        case "orders":
          sections += this.generateOrdersSection(reportData.orders)
          break
        case "reservations":
          sections += this.generateReservationsSection(reportData.reservations)
          break
        case "consolidated":
          sections += this.generateConsolidatedSection(reportData)
          break
      }
    })

    return sections
  }

  private generateReviewsSection(reviews: any[]): string {
    const recentReviews = reviews.slice(0, 5)
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    return `
      <div class="section">
        <h3>📝 Reseñas Recientes</h3>
        <p><strong>Calificación Promedio:</strong> ${avgRating.toFixed(1)}/5</p>
        <div style="margin: 15px 0;">
          ${recentReviews.map(review => `
            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
              <div style="display: flex; justify-content: between; align-items: center;">
                <span style="font-weight: bold;">${review.customerName || 'Anónimo'}</span>
                <span class="badge badge-success">${review.rating} ⭐</span>
              </div>
              <p style="margin: 10px 0; font-style: italic;">"${review.comment || 'Sin comentario'}"</p>
              <small style="color: #666;">${new Date(review.createdAt).toLocaleDateString('es-ES')}</small>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private generateOrdersSection(orders: any[]): string {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const avgOrderValue = totalRevenue / orders.length

    return `
      <div class="section">
        <h3>🛒 Análisis de Pedidos</h3>
        <p><strong>Revenue Total:</strong> $${totalRevenue.toFixed(2)}</p>
        <p><strong>Valor Promedio por Pedido:</strong> $${avgOrderValue.toFixed(2)}</p>
        <p><strong>Total de Pedidos:</strong> ${orders.length}</p>
      </div>
    `
  }

  private generateReservationsSection(reservations: any[]): string {
    const confirmed = reservations.filter(r => r.status === 'confirmed').length
    const cancelled = reservations.filter(r => r.status === 'cancelled').length
    const confirmationRate = (confirmed / reservations.length) * 100

    return `
      <div class="section">
        <h3>📅 Análisis de Reservas</h3>
        <p><strong>Total de Reservas:</strong> ${reservations.length}</p>
        <p><strong>Confirmadas:</strong> ${confirmed}</p>
        <p><strong>Canceladas:</strong> ${cancelled}</p>
        <p><strong>Tasa de Confirmación:</strong> ${confirmationRate.toFixed(1)}%</p>
      </div>
    `
  }

  private generateConsolidatedSection(reportData: ReportData): string {
    return `
      <div class="section">
        <h3>📊 Resumen Consolidado</h3>
        <p>Este reporte incluye un análisis completo de todas las métricas del CRM para el período seleccionado.</p>
        <p>Para análisis más detallados, revisa los archivos Excel adjuntos.</p>
      </div>
    `
  }

  private async generateAttachments(reportData: ReportData, reportTypes: ReportType[], barName: string, barId: string): Promise<any[]> {
    const attachments: any[] = []

    try {
      // Importar el generador de Excel
      const { excelGenerator } = await import("@/src/services/excelGenerator")
      
      console.log("📊 Generating Excel attachment with inventory data...")
      console.log("📊 Bar ID:", barId)
      
      // Generar el archivo Excel con todos los datos (incluyendo inventario)
      const excelBuffer = await excelGenerator.generateReportExcel(reportData, barName, barId)
      
      // Convertir buffer a base64
      const base64Excel = excelBuffer.toString('base64')
      
      // Generar nombre del archivo
      const filename = excelGenerator.generateFileName(barName, reportData)
      
      console.log("📊 Excel generated:", filename, "Size:", excelBuffer.length, "bytes")
      
      // Formato de attachment para Resend
      attachments.push({
        filename: filename,
        content: base64Excel
      })
      
      console.log("✅ Attachment ready:", filename)
    } catch (error) {
      console.error("❌ Error generating Excel attachment:", error)
    }

    return attachments
  }
}

export const emailService = EmailService.getInstance()
