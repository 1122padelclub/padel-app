import { NextRequest, NextResponse } from "next/server"
import { getAdminApp } from "@/lib/firebaseAdmin"
import { getStorage } from "firebase-admin/storage"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    console.log('API route called: /api/upload-announcement-image')
    
    const formData = await request.formData()
    const file = formData.get("image") as File
    const barId = formData.get("barId") as string

    console.log('File received:', file ? { name: file.name, size: file.size, type: file.type } : 'No file')
    console.log('Bar ID:', barId)

    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    if (!barId) {
      console.log('No barId provided')
      return NextResponse.json({ error: "Bar ID es requerido" }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP" 
      }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "El archivo es demasiado grande. Máximo 5MB" 
      }, { status: 400 })
    }

    // Inicializar Firebase Admin
    const adminApp = getAdminApp()
    const bucket = getStorage(adminApp).bucket()

    // Crear referencia única para el archivo
    const fileName = `announcements/${barId}/${uuidv4()}-${file.name}`
    const fileBuffer = await file.arrayBuffer()

    console.log('Uploading to Firebase Storage:', fileName)

    // Subir archivo
    const fileUpload = bucket.file(fileName)
    
    await fileUpload.save(Buffer.from(fileBuffer), {
      metadata: {
        contentType: file.type,
        metadata: {
          barId: barId,
          uploadedAt: new Date().toISOString(),
        }
      }
    })

    // Hacer el archivo público
    await fileUpload.makePublic()

    // Obtener URL pública
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`
    console.log('Download URL:', downloadURL)

    return NextResponse.json({ 
      success: true, 
      imageUrl: downloadURL,
      fileName: fileName
    })

  } catch (error: any) {
    console.error("Error uploading announcement image:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
