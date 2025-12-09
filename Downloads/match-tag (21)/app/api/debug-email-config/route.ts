import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debugging email configuration...")
    
    // Verificar variables de entorno
    const envCheck = {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      NEXT_PUBLIC_RESEND_API_KEY: !!process.env.NEXT_PUBLIC_RESEND_API_KEY,
      FROM_EMAIL: !!process.env.FROM_EMAIL,
      NEXT_PUBLIC_FROM_EMAIL: !!process.env.NEXT_PUBLIC_FROM_EMAIL,
      APP_URL: !!process.env.APP_URL,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL
    }
    
    console.log("🔍 Environment variables check:", envCheck)
    
    // Verificar configuración de Resend
    const resendConfig = {
      apiKey: process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY || 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ',
      fromEmail: process.env.FROM_EMAIL || process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@gibracompany.com',
      baseUrl: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
    
    console.log("🔍 Resend config:", {
      apiKeyLength: resendConfig.apiKey?.length || 0,
      apiKeyPrefix: resendConfig.apiKey?.substring(0, 10) || 'none',
      fromEmail: resendConfig.fromEmail,
      baseUrl: resendConfig.baseUrl
    })
    
    // Probar conexión con Resend
    let resendTest = { success: false, error: null, details: null }
    
    try {
      console.log("🔍 Testing Resend API connection...")
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendConfig.fromEmail,
          to: ['diagnostic@example.com'], // Email de prueba que no se enviará realmente
          subject: 'Test Connection',
          html: '<p>This is a test email to verify Resend connection.</p>'
        })
      })
      
      const result = await response.json()
      
      resendTest = {
        success: response.ok,
        error: response.ok ? null : result,
        details: {
          status: response.status,
          response: result
        }
      }
      
      console.log("🔍 Resend test result:", resendTest)
      
    } catch (error: any) {
      resendTest.error = error.message
      console.error("🔍 Resend test error:", error)
    }
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      config: resendConfig,
      resendTest,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error("❌ Error debugging email config:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    )
  }
}
