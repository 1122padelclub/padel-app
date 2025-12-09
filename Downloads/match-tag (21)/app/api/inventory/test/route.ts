import { NextResponse } from 'next/server'

/**
 * API de prueba para verificar la configuración de Firebase
 * GET /api/inventory/test
 */
export async function GET() {
  try {
    // Verificar si la variable de entorno está configurada
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT
    
    if (!serviceAccountEnv) {
      return NextResponse.json({
        success: false,
        error: 'FIREBASE_SERVICE_ACCOUNT environment variable is not set',
        solution: 'Configure the FIREBASE_SERVICE_ACCOUNT environment variable in Vercel'
      }, { status: 500 })
    }
    
    // Intentar parsear el JSON
    let serviceAccount
    try {
      serviceAccount = JSON.parse(serviceAccountEnv)
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format in FIREBASE_SERVICE_ACCOUNT',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        solution: 'Ensure the JSON is properly formatted and escaped'
      }, { status: 500 })
    }
    
    // Verificar campos requeridos
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email']
    const missingFields = requiredFields.filter(field => !serviceAccount[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields in service account',
        missingFields,
        solution: 'Ensure all required fields are present in the service account JSON'
      }, { status: 500 })
    }
    
    // Verificar formato de private key
    if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid private key format',
        solution: 'Ensure the private key includes proper headers'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Firebase configuration is valid',
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      hasValidPrivateKey: true
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
