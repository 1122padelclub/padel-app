import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const barId = formData.get("barId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!barId) {
      return NextResponse.json({ error: "No barId provided" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Convert File to base64 for temporary storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // For now, return the data URL as a temporary solution
    // In production, you should upload to a proper storage service
    return NextResponse.json({ 
      url: dataUrl,
      temporary: true // Indicate this is a temporary solution
    })
  } catch (error) {
    console.error("Error uploading bar logo:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
