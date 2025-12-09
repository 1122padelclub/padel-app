import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Starting Resend diagnosis...")

    const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'
    const fromEmail = 'onboarding@resend.dev'

    // Verificar que la API key esté presente
    if (!RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "API Key not found",
        step: "API_KEY_CHECK"
      })
    }

    console.log("✅ API Key found:", RESEND_API_KEY.substring(0, 10) + "...")

    // Verificar formato de la API key
    if (!RESEND_API_KEY.startsWith('re_')) {
      return NextResponse.json({
        success: false,
        error: "Invalid API Key format. Should start with 're_'",
        step: "API_KEY_FORMAT",
        apiKey: RESEND_API_KEY.substring(0, 10) + "..."
      })
    }

    console.log("✅ API Key format is correct")

    // Test simple: intentar obtener dominios (esto verifica que la API key funciona)
    console.log("🔍 Testing API key validity...")
    
    const domainsResponse = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    console.log("📧 Domains API Response Status:", domainsResponse.status)

    if (!domainsResponse.ok) {
      const errorData = await domainsResponse.json()
      console.error("❌ Domains API Error:", errorData)
      
      return NextResponse.json({
        success: false,
        error: "API Key authentication failed",
        step: "API_KEY_AUTH",
        status: domainsResponse.status,
        details: errorData
      })
    }

    const domainsData = await domainsResponse.json()
    console.log("✅ API Key is valid, domains:", domainsData)

    // Verificar si el dominio personalizado está disponible
    console.log("🔍 Checking custom domain status...")
    
    const customDomain = domainsData.data?.find((domain: any) => 
      domain.name === 'gibracompany.com'
    )

    // Test de envío simple
    console.log("🔍 Testing email sending...")
    
    const testEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: customDomain?.status === 'verified' ? 'noreply@gibracompany.com' : fromEmail,
        to: ['test@example.com'], // Email de prueba que no se enviará realmente
        subject: "Test Email - Diagnosis",
        html: "<p>This is a test email for diagnosis purposes.</p>",
        text: "This is a test email for diagnosis purposes."
      })
    })

    console.log("📧 Email API Response Status:", testEmailResponse.status)
    
    const emailResult = await testEmailResponse.json()
    console.log("📧 Email API Response:", emailResult)

    if (!testEmailResponse.ok) {
      return NextResponse.json({
        success: false,
        error: "Email sending failed",
        step: "EMAIL_SEND",
        status: testEmailResponse.status,
        details: emailResult
      })
    }

    return NextResponse.json({
      success: true,
      message: "Resend API is working correctly",
      steps: {
        apiKeyFound: true,
        apiKeyFormat: true,
        apiKeyAuth: true,
        emailSend: true
      },
      details: {
        apiKey: RESEND_API_KEY.substring(0, 10) + "...",
        fromEmail,
        domains: domainsData,
        customDomain: customDomain || null,
        customDomainVerified: customDomain?.status === 'verified',
        testEmail: emailResult
      }
    })

  } catch (error: any) {
    console.error("❌ Diagnosis error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      step: "UNKNOWN_ERROR",
      type: error.name || "Error"
    }, { status: 500 })
  }
}
