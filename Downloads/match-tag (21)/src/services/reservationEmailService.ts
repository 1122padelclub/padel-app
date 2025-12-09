import type { Reservation, Bar } from "@/src/types"

// Configuración del servicio de email para reservas
const RESERVATION_EMAIL_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_RESEND_API_KEY || "re_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ",
  fromEmail: process.env.NEXT_PUBLIC_FROM_EMAIL || "noreply@gibracompany.com",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // Email de prueba mientras configuramos el dominio personalizado
  testFromEmail: "onboarding@resend.dev"
}

export class ReservationEmailService {
  private static instance: ReservationEmailService
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = RESERVATION_EMAIL_CONFIG.apiKey
    this.fromEmail = RESERVATION_EMAIL_CONFIG.fromEmail
  }

  static getInstance(): ReservationEmailService {
    if (!ReservationEmailService.instance) {
      ReservationEmailService.instance = new ReservationEmailService()
    }
    return ReservationEmailService.instance
  }

  // Enviar confirmación de reserva
  async sendReservationConfirmation(
    reservation: Reservation,
    barConfig?: Bar['emailConfig']
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const businessName = barConfig?.businessName || "Nuestro Restaurante"
      
      console.log("📧 Enviando confirmación de reserva:")
      console.log("Reservation ID:", reservation.id)
      console.log("Customer Email:", reservation.customerEmail)
      console.log("Business Name:", businessName)

      const emailContent = this.generateReservationConfirmationHTML(reservation, barConfig)
      const textContent = this.generateReservationConfirmationText(reservation, barConfig)

      const response = await fetch('/api/send-reservation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: reservation.customerEmail,
          subject: `✅ Confirmación de Reserva - ${businessName}`,
          html: emailContent,
          text: textContent
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error sending email')
      }

      console.log("✅ Email de confirmación enviado:", result)
      return { success: true, messageId: result.id }

    } catch (error: any) {
      console.error("Error sending reservation confirmation:", error)
      return { success: false, error: error.message }
    }
  }

  // Enviar actualización de reserva
  async sendReservationUpdate(
    reservation: Reservation,
    barName: string = "Match Tag Bar",
    updateType: 'confirmed' | 'cancelled' | 'modified' = 'modified'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log("📧 Enviando actualización de reserva:")
      console.log("Reservation ID:", reservation.id)
      console.log("Update Type:", updateType)

      const emailContent = this.generateReservationUpdateHTML(reservation, barName, updateType)
      const textContent = this.generateReservationUpdateText(reservation, barName, updateType)

      const subject = this.getUpdateSubject(updateType, barName)

      const response = await fetch('/api/send-reservation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: reservation.customerEmail,
          subject: subject,
          html: emailContent,
          text: textContent
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error sending email')
      }

      console.log("✅ Email de actualización enviado:", result)
      return { success: true, messageId: result.id }

    } catch (error: any) {
      console.error("Error sending reservation update:", error)
      return { success: false, error: error.message }
    }
  }

  // Generar HTML para confirmación de reserva
  private generateReservationConfirmationHTML(reservation: Reservation, barConfig?: Bar['emailConfig']): string {
    const reservationDate = new Date(reservation.reservationDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const reservationTime = reservation.reservationTime || reservation.time || 'Por confirmar'
    const businessName = barConfig?.businessName || "Nuestro Restaurante"
    const businessAddress = barConfig?.businessAddress || ""
    const contactPhone = barConfig?.contactPhone || ""
    const contactEmail = barConfig?.contactEmail || ""
    const businessHours = barConfig?.businessHours || ""
    const policies = barConfig?.policies || ""

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✅ Reserva Confirmada</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${businessName}</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
          <h2 style="color: #1f2937; margin-bottom: 25px; font-size: 24px;">¡Gracias por tu reserva!</h2>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">📅 Detalles de tu Reserva</h3>
            <div style="color: #374151; line-height: 1.6;">
              <p style="margin: 8px 0;"><strong>👤 Nombre:</strong> ${reservation.customerName}</p>
              <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${reservationDate}</p>
              <p style="margin: 8px 0;"><strong>🕐 Hora:</strong> ${reservationTime}</p>
              <p style="margin: 8px 0;"><strong>👥 Personas:</strong> ${reservation.partySize}</p>
              <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${reservation.customerEmail}</p>
              ${reservation.customerPhone ? `<p style="margin: 8px 0;"><strong>📞 Teléfono:</strong> ${reservation.customerPhone}</p>` : ''}
              ${reservation.notes ? `<p style="margin: 8px 0;"><strong>📝 Notas:</strong> ${reservation.notes}</p>` : ''}
            </div>
          </div>

          ${businessAddress || contactPhone || contactEmail || businessHours ? `
          <div style="background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #0c4a6e; margin-top: 0; font-size: 18px;">🏪 Información del Restaurante</h3>
            <div style="color: #374151; line-height: 1.6;">
              ${businessAddress ? `<p style="margin: 8px 0;"><strong>📍 Dirección:</strong> ${businessAddress}</p>` : ''}
              ${contactPhone ? `<p style="margin: 8px 0;"><strong>📞 Teléfono:</strong> ${contactPhone}</p>` : ''}
              ${contactEmail ? `<p style="margin: 8px 0;"><strong>📧 Email:</strong> ${contactEmail}</p>` : ''}
              ${businessHours ? `<p style="margin: 8px 0;"><strong>🕒 Horarios:</strong> ${businessHours}</p>` : ''}
            </div>
          </div>
          ` : ''}

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">ℹ️ Información Importante</h3>
            <ul style="color: #1e40af; margin: 10px 0; padding-left: 20px;">
              <li>Tu reserva está <strong>confirmada</strong> y lista para el ${reservationDate}</li>
              <li>Por favor, llega 5-10 minutos antes de tu hora reservada</li>
              <li>Si necesitas cancelar o modificar, contáctanos con al menos 2 horas de anticipación</li>
              <li>Te enviaremos un recordatorio 24 horas antes de tu reserva</li>
            </ul>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">⚠️ Política de Cancelación</h3>
            <p style="color: #92400e; margin: 10px 0; font-size: 14px;">
              ${policies || "Las cancelaciones con menos de 2 horas de anticipación pueden estar sujetas a una tarifa de cancelación."}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong>ID de Reserva:</strong> ${reservation.id}<br>
                <strong>Estado:</strong> ${this.getStatusText(reservation.status)}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Este es un email automático de confirmación de reserva.<br>
            Si tienes preguntas, contáctanos directamente.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
            Enviado desde ${this.fromEmail} - ${new Date().toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    `
  }

  // Generar texto plano para confirmación de reserva
  private generateReservationConfirmationText(reservation: Reservation, barConfig?: Bar['emailConfig']): string {
    const reservationDate = new Date(reservation.reservationDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const businessName = barConfig?.businessName || "Nuestro Restaurante"
    const businessAddress = barConfig?.businessAddress || ""
    const contactPhone = barConfig?.contactPhone || ""
    const contactEmail = barConfig?.contactEmail || ""
    const businessHours = barConfig?.businessHours || ""
    const policies = barConfig?.policies || "Las cancelaciones con menos de 2 horas de anticipación pueden estar sujetas a una tarifa de cancelación."

    return `
✅ RESERVA CONFIRMADA - ${businessName}

¡Gracias por tu reserva!

DETALLES DE TU RESERVA:
👤 Nombre: ${reservation.customerName}
📅 Fecha: ${reservationDate}
🕐 Hora: ${reservation.reservationTime || reservation.time || 'Por confirmar'}
👥 Personas: ${reservation.partySize}
📧 Email: ${reservation.customerEmail}
${reservation.customerPhone ? `📞 Teléfono: ${reservation.customerPhone}` : ''}
${reservation.notes ? `📝 Notas: ${reservation.notes}` : ''}

${businessAddress || contactPhone || contactEmail || businessHours ? `
INFORMACIÓN DEL RESTAURANTE:
${businessAddress ? `📍 Dirección: ${businessAddress}` : ''}
${contactPhone ? `📞 Teléfono: ${contactPhone}` : ''}
${contactEmail ? `📧 Email: ${contactEmail}` : ''}
${businessHours ? `🕒 Horarios: ${businessHours}` : ''}
` : ''}

INFORMACIÓN IMPORTANTE:
• Tu reserva está confirmada y lista para el ${reservationDate}
• Por favor, llega 5-10 minutos antes de tu hora reservada
• Si necesitas cancelar o modificar, contáctanos con al menos 2 horas de anticipación
• Te enviaremos un recordatorio 24 horas antes de tu reserva

POLÍTICA DE CANCELACIÓN:
${policies}

ID de Reserva: ${reservation.id}
Estado: ${this.getStatusText(reservation.status)}

---
Este es un email automático de confirmación de reserva.
Si tienes preguntas, contáctanos directamente.

Enviado desde ${this.fromEmail} - ${new Date().toLocaleString('es-ES')}
    `.trim()
  }

  // Generar HTML para actualización de reserva
  private generateReservationUpdateHTML(reservation: Reservation, barName: string, updateType: string): string {
    const reservationDate = new Date(reservation.reservationDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const updateMessages = {
      confirmed: {
        title: "✅ Reserva Confirmada",
        message: "Tu reserva ha sido confirmada por nuestro equipo.",
        color: "#10b981"
      },
      cancelled: {
        title: "❌ Reserva Cancelada",
        message: "Tu reserva ha sido cancelada.",
        color: "#ef4444"
      },
      modified: {
        title: "📝 Reserva Modificada",
        message: "Los detalles de tu reserva han sido actualizados.",
        color: "#3b82f6"
      }
    }

    const updateInfo = updateMessages[updateType as keyof typeof updateMessages]

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${updateInfo.color} 0%, ${updateInfo.color}dd 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${updateInfo.title}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${barName}</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
          <h2 style="color: #1f2937; margin-bottom: 25px; font-size: 24px;">${updateInfo.message}</h2>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid ${updateInfo.color};">
            <h3 style="color: ${updateInfo.color}; margin-top: 0; font-size: 18px;">📅 Detalles Actualizados</h3>
            <div style="color: #374151; line-height: 1.6;">
              <p style="margin: 8px 0;"><strong>👤 Nombre:</strong> ${reservation.customerName}</p>
              <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${reservationDate}</p>
              <p style="margin: 8px 0;"><strong>🕐 Hora:</strong> ${reservation.reservationTime || reservation.time || 'Por confirmar'}</p>
              <p style="margin: 8px 0;"><strong>👥 Personas:</strong> ${reservation.partySize}</p>
              <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${reservation.customerEmail}</p>
              <p style="margin: 8px 0;"><strong>📊 Estado:</strong> ${this.getStatusText(reservation.status)}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong>ID de Reserva:</strong> ${reservation.id}<br>
                <strong>Actualizado:</strong> ${new Date().toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Este es un email automático de actualización de reserva.<br>
            Si tienes preguntas, contáctanos directamente.
          </p>
        </div>
      </div>
    `
  }

  // Generar texto plano para actualización de reserva
  private generateReservationUpdateText(reservation: Reservation, barName: string, updateType: string): string {
    const reservationDate = new Date(reservation.reservationDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const updateMessages = {
      confirmed: "✅ RESERVA CONFIRMADA",
      cancelled: "❌ RESERVA CANCELADA", 
      modified: "📝 RESERVA MODIFICADA"
    }

    return `
${updateMessages[updateType as keyof typeof updateMessages]} - ${barName}

DETALLES ACTUALIZADOS:
👤 Nombre: ${reservation.customerName}
📅 Fecha: ${reservationDate}
🕐 Hora: ${reservation.reservationTime || reservation.time || 'Por confirmar'}
👥 Personas: ${reservation.partySize}
📧 Email: ${reservation.customerEmail}
📊 Estado: ${this.getStatusText(reservation.status)}

ID de Reserva: ${reservation.id}
Actualizado: ${new Date().toLocaleString('es-ES')}

---
Este es un email automático de actualización de reserva.
Si tienes preguntas, contáctanos directamente.
    `.trim()
  }

  // Obtener asunto según tipo de actualización
  private getUpdateSubject(updateType: string, barName: string): string {
    const subjects = {
      confirmed: `✅ Reserva Confirmada - ${barName}`,
      cancelled: `❌ Reserva Cancelada - ${barName}`,
      modified: `📝 Reserva Actualizada - ${barName}`
    }
    return subjects[updateType as keyof typeof subjects] || `📝 Reserva Actualizada - ${barName}`
  }

  // Obtener texto del estado
  private getStatusText(status: string): string {
    const statusTexts = {
      pending: "Pendiente de confirmación",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
      no_show: "No se presentó",
      completed: "Completada"
    }
    return statusTexts[status as keyof typeof statusTexts] || status
  }
}
