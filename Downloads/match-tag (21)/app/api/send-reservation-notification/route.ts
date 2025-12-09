import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      reservationDate, 
      reservationTime, 
      tableNumber, 
      partySize,
      barName = "Nuestro Restaurante",
      type = 'confirmation'
    } = await request.json()

    console.log("📧 Enviando notificación de reserva:", {
      customerName,
      customerEmail,
      customerPhone,
      reservationDate,
      reservationTime,
      tableNumber,
      partySize
    })

    // Formatear fecha y hora
    const date = new Date(reservationDate)
    const formattedDate = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Generar mensaje según el tipo
    const { message, subject, htmlContent } = generateNotificationContent({
      type,
      customerName,
      formattedDate,
      reservationTime,
      tableNumber,
      partySize,
      barName
    })

    const results = []

    // Enviar email si se proporciona
    if (customerEmail) {
      try {
        const emailResult = await sendEmail({
          to: customerEmail,
          subject: subject,
          text: message,
          html: htmlContent
        })
        results.push({ type: 'email', success: true, result: emailResult })
        console.log("✅ Email enviado exitosamente")
      } catch (error) {
        console.error("❌ Error enviando email:", error)
        results.push({ type: 'email', success: false, error: error.message })
      }
    }

    // Enviar SMS si se proporciona
    if (customerPhone) {
      try {
        const smsResult = await sendSMS({
          to: customerPhone,
          message: message
        })
        results.push({ type: 'sms', success: true, result: smsResult })
        console.log("✅ SMS enviado exitosamente")
      } catch (error) {
        console.error("❌ Error enviando SMS:", error)
        results.push({ type: 'sms', success: false, error: error.message })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notificaciones enviadas",
      results 
    })

  } catch (error) {
    console.error("❌ Error en API de notificaciones:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Función para enviar email usando Resend
async function sendEmail({ to, subject, text, html }: {
  to: string
  subject: string
  text: string
  html: string
}) {
  console.log("📧 Enviando email con Resend:", { to, subject })
  
  const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'
  const fromEmail = 'noreply@gibracompany.com'
  
  try {
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
        html: html,
        text: text
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Error sending email')
    }

    console.log("✅ Email enviado exitosamente:", result)
    return { messageId: result.id }
  } catch (error: any) {
    console.error("❌ Error enviando email:", error)
    throw error
  }
}

// Función para enviar SMS (usando Twilio o similar)
async function sendSMS({ to, message }: {
  to: string
  message: string
}) {
  // Por ahora simulamos el envío
  // En producción, integrar con Twilio, AWS SNS, o similar
  console.log("📱 Simulando envío de SMS:", { to, message: message.substring(0, 50) + "..." })
  
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return { messageId: `sms_${Date.now()}` }
}

// Función para generar contenido de notificaciones según el tipo
function generateNotificationContent({
  type,
  customerName,
  formattedDate,
  reservationTime,
  tableNumber,
  partySize,
  barName
}: {
  type: string
  customerName: string
  formattedDate: string
  reservationTime: string
  tableNumber: number | string
  partySize: number
  barName: string
}) {
  const baseInfo = `📅 Fecha: ${formattedDate}
🕐 Hora: ${reservationTime}
🪑 Mesa: ${tableNumber}
👥 Personas: ${partySize}`

  switch (type) {
    case 'confirmation':
      return {
        subject: `✅ Reserva Confirmada - ${barName}`,
        message: `¡Hola ${customerName}! 🎉

Tu reserva ha sido confirmada:

${baseInfo}

¡Esperamos verte pronto en ${barName}! 

Si necesitas hacer algún cambio, por favor contáctanos.

¡Gracias por elegirnos! 🙏`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">¡Reserva Confirmada! 🎉</h2>
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Tu reserva ha sido confirmada exitosamente:</p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🕐 Hora:</strong> ${reservationTime}</p>
              <p><strong>🪑 Mesa:</strong> ${tableNumber}</p>
              <p><strong>👥 Personas:</strong> ${partySize}</p>
            </div>
            <p>¡Esperamos verte pronto en <strong>${barName}</strong>!</p>
            <p>Si necesitas hacer algún cambio, por favor contáctanos.</p>
            <p>¡Gracias por elegirnos! 🙏</p>
          </div>
        `
      }

    case 'rejection':
    case 'cancelled':
      return {
        subject: `❌ Reserva Cancelada - ${barName}`,
        message: `Hola ${customerName},

Lamentamos informarte que tu reserva ha sido cancelada:

${baseInfo}

Si tienes alguna pregunta o deseas hacer una nueva reserva, por favor contáctanos.

¡Esperamos poder atenderte en otra ocasión! 🙏`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Reserva Cancelada ❌</h2>
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Lamentamos informarte que tu reserva ha sido cancelada:</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🕐 Hora:</strong> ${reservationTime}</p>
              <p><strong>🪑 Mesa:</strong> ${tableNumber}</p>
              <p><strong>👥 Personas:</strong> ${partySize}</p>
            </div>
            <p>Si tienes alguna pregunta o deseas hacer una nueva reserva, por favor contáctanos.</p>
            <p>¡Esperamos poder atenderte en otra ocasión! 🙏</p>
          </div>
        `
      }

    case 'completed':
      return {
        subject: `✅ Reserva Completada - ${barName}`,
        message: `¡Hola ${customerName}! 🎉

Tu reserva ha sido marcada como completada:

${baseInfo}

¡Gracias por visitarnos en ${barName}! 

Esperamos verte pronto de nuevo.

¡Gracias por elegirnos! 🙏`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">¡Reserva Completada! 🎉</h2>
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Tu reserva ha sido marcada como completada:</p>
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🕐 Hora:</strong> ${reservationTime}</p>
              <p><strong>🪑 Mesa:</strong> ${tableNumber}</p>
              <p><strong>👥 Personas:</strong> ${partySize}</p>
            </div>
            <p>¡Gracias por visitarnos en <strong>${barName}</strong>!</p>
            <p>Esperamos verte pronto de nuevo.</p>
            <p>¡Gracias por elegirnos! 🙏</p>
          </div>
        `
      }

    case 'no_show':
      return {
        subject: `⚠️ No se presentó - ${barName}`,
        message: `Hola ${customerName},

Notamos que no te presentaste a tu reserva:

${baseInfo}

Si tienes alguna pregunta o deseas hacer una nueva reserva, por favor contáctanos.

¡Esperamos poder atenderte en otra ocasión! 🙏`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">No se presentó ⚠️</h2>
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Notamos que no te presentaste a tu reserva:</p>
            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🕐 Hora:</strong> ${reservationTime}</p>
              <p><strong>🪑 Mesa:</strong> ${tableNumber}</p>
              <p><strong>👥 Personas:</strong> ${partySize}</p>
            </div>
            <p>Si tienes alguna pregunta o deseas hacer una nueva reserva, por favor contáctanos.</p>
            <p>¡Esperamos poder atenderte en otra ocasión! 🙏</p>
          </div>
        `
      }

    case 'reminder':
      return {
        subject: `⏰ Recordatorio de Reserva - ${barName}`,
        message: `¡Hola ${customerName}! ⏰

Te recordamos que tienes una reserva en 2 horas:

${baseInfo}

¡Te esperamos en ${barName}! 

Si necesitas hacer algún cambio, por favor contáctanos urgentemente.

¡Gracias por elegirnos! 🙏`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">⏰ Recordatorio de Reserva</h2>
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Te recordamos que tienes una reserva en <strong>2 horas</strong>:</p>
            <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🕐 Hora:</strong> ${reservationTime}</p>
              <p><strong>🪑 Mesa:</strong> ${tableNumber}</p>
              <p><strong>👥 Personas:</strong> ${partySize}</p>
            </div>
            <p>¡Te esperamos en <strong>${barName}</strong>!</p>
            <p>Si necesitas hacer algún cambio, por favor contáctanos urgentemente.</p>
            <p>¡Gracias por elegirnos! 🙏</p>
          </div>
        `
      }

    default:
      return {
        subject: `Reserva - ${barName}`,
        message: `Hola ${customerName},

Información de tu reserva:

${baseInfo}

¡Gracias por elegirnos! 🙏`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #374151;">Información de Reserva</h2>
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Información de tu reserva:</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🕐 Hora:</strong> ${reservationTime}</p>
              <p><strong>🪑 Mesa:</strong> ${tableNumber}</p>
              <p><strong>👥 Personas:</strong> ${partySize}</p>
            </div>
            <p>¡Gracias por elegirnos! 🙏</p>
          </div>
        `
      }
  }
}




