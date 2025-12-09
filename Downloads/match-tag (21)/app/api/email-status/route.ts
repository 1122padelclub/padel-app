import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Checking email status...")

    const RESEND_API_KEY = 're_G47xQBpt_7YgFgbQ8JCLgmDURcsT2BsBJ'

    // Verificar dominios
    const domainsResponse = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    const domainsData = domainsResponse.ok ? await domainsResponse.json() : null
    const gibraDomain = domainsData?.data?.find((domain: any) => domain.name === 'gibracompany.com')

    return NextResponse.json({
      apiKey: {
        present: !!RESEND_API_KEY,
        format: RESEND_API_KEY.startsWith('re_'),
        length: RESEND_API_KEY.length
      },
      domains: {
        status: domainsResponse.status,
        available: domainsData?.data?.length || 0,
        list: domainsData?.data?.map((d: any) => ({
          name: d.name,
          status: d.status,
          verified: d.status === 'verified'
        })) || []
      },
      gibraCompany: gibraDomain ? {
        status: gibraDomain.status,
        verified: gibraDomain.status === 'verified',
        records: gibraDomain.records || []
      } : {
        status: 'not_found',
        verified: false,
        message: 'Domain not found in Resend'
      },
      recommendations: gibraDomain?.status !== 'verified' ? [
        'Go to https://resend.com/domains',
        'Click "Add Domain"',
        'Enter "gibracompany.com"',
        'Follow DNS verification steps',
        'Wait for verification to complete'
      ] : [
        'Domain is verified and ready to use!'
      ]
    })

  } catch (error: any) {
    console.error("❌ Email status error:", error)
    return NextResponse.json({
      error: error.message,
      type: error.name || "Error"
    }, { status: 500 })
  }
}
