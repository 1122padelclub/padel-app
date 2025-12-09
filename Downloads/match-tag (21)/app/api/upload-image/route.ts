import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

// Verificar que Firebase Storage esté disponible
if (!storage) {
  console.error('Firebase Storage not initialized')
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route called: /api/upload-image')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    console.log('File received:', file ? { name: file.name, size: file.size, type: file.type } : 'No file')
    
    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Verificar que storage esté disponible
    if (!storage) {
      console.error('Firebase Storage not configured')
      return NextResponse.json({ error: 'Firebase Storage not configured' }, { status: 500 })
    }

    console.log('Firebase Storage available:', !!storage)

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

    // Convertir File a Buffer
    console.log('Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('Buffer created, size:', buffer.length)

    // Generar nombre único
    const fileName = `${uuidv4()}-${file.name}`
    console.log('Generated fileName:', fileName)
    
    const storageRef = ref(storage, `bar-assets/${fileName}`)
    console.log('Storage ref created:', storageRef.fullPath)

    // Subir archivo
    console.log('Uploading to Firebase Storage...')
    await uploadBytes(storageRef, buffer)
    console.log('Upload successful, getting download URL...')
    
    const downloadURL = await getDownloadURL(storageRef)
    console.log('Download URL obtained:', downloadURL)

    return NextResponse.json({ 
      success: true, 
      url: downloadURL,
      fileName: fileName
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
