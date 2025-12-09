import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Simple upload API called')
    
    // Verificar que la request sea válida
    if (!request) {
      console.error('No request object')
      return NextResponse.json({ error: 'No request' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    console.log('File received:', file ? { name: file.name, size: file.size, type: file.type } : 'No file')
    
    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type)
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size)
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Crear una URL de datos simple
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`
    
    console.log('Returning data URL, length:', dataUrl.length)

    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      fileName: file.name,
      message: 'Image processed successfully'
    })

  } catch (error) {
    console.error('Error in simple upload:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return NextResponse.json({ 
      error: 'Failed to process image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
