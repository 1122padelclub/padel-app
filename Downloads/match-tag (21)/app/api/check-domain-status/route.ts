import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Checking domain status for gibracompany.com...")

    const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'

    // Verificar dominios disponibles
    const domainsResponse = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    if (!domainsResponse.ok) {
      const errorData = await domainsResponse.json()
      return NextResponse.json({
        success: false,
        error: "Failed to fetch domains",
        details: errorData
      })
    }

    const domainsData = await domainsResponse.json()
    console.log("📧 Available domains:", domainsData)

    // Buscar si gibracompany.com está en la lista
    const gibraDomain = domainsData.data?.find((domain: any) => 
      domain.name === 'gibracompany.com'
    )

    if (gibraDomain) {
      return NextResponse.json({
        success: true,
        domain: 'gibracompany.com',
        status: gibraDomain.status,
        verified: gibraDomain.status === 'verified',
        details: gibraDomain,
        message: gibraDomain.status === 'verified' 
          ? "Domain is verified and ready to use!" 
          : `Domain status: ${gibraDomain.status}`
      })
    } else {
      return NextResponse.json({
        success: false,
        domain: 'gibracompany.com',
        status: 'not_found',
        verified: false,
        message: "Domain not found in Resend. You need to add and verify it first.",
        availableDomains: domainsData.data?.map((d: any) => ({
          name: d.name,
          status: d.status
        })) || [],
        instructions: {
          step1: "Go to Resend dashboard: https://resend.com/domains",
          step2: "Click 'Add Domain'",
          step3: "Enter 'gibracompany.com'",
          step4: "Follow DNS verification steps",
          step5: "Wait for verification to complete"
        }
      })
    }

  } catch (error: any) {
    console.error("❌ Error checking domain status:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.name || "Error"
    }, { status: 500 })
  }
}
