"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { useT } from "@/src/hooks/useTranslation"
// Removemos las importaciones de Firebase Storage ya que usaremos la API route

interface ImageUploadProps {
  label: string
  description?: string
  value?: string
  onChange: (url: string) => void
  accept?: string
  maxSize?: number // en MB
  className?: string
}

export function ImageUpload({
  label,
  description,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  className = ""
}: ImageUploadProps) {
  const t = useT()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Archivo seleccionado:", event.target.files)
    const file = event.target.files?.[0]
    if (!file) {
      console.log("No se seleccionó ningún archivo")
      return
    }

    console.log("Archivo válido:", file.name, file.type, file.size)

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo debe ser menor a ${maxSize}MB`)
      return
    }

    setError(null)
    setUploading(true)

    // Procesar imagen directamente en el cliente (solución temporal)
    console.log("Procesando imagen en el cliente...")
    
    // Verificar que FileReader esté disponible
    if (typeof FileReader === 'undefined') {
      setError("FileReader no está disponible en este navegador")
      setUploading(false)
      return
    }
    
    // Crear una URL de datos directamente
    const reader = new FileReader()
    
    // Timeout para evitar que se quede colgado
    const timeoutId = setTimeout(() => {
      console.warn("Timeout en FileReader")
      setError("Timeout al procesar la imagen")
      setUploading(false)
    }, 10000) // 10 segundos
    
    reader.onload = (e) => {
      try {
        clearTimeout(timeoutId)
        console.log("FileReader onload ejecutado, event:", e)
        
        if (!e || !e.target) {
          throw new Error("Evento de FileReader inválido")
        }
        
        const result = e.target.result
        if (!result) {
          throw new Error("No se pudo leer el archivo")
        }
        
        const dataUrl = result as string
        console.log("Imagen procesada exitosamente:", dataUrl.substring(0, 50) + "...")
        setPreview(dataUrl)
        onChange(dataUrl)
        setError(null)
        setUploading(false)
      } catch (err) {
        console.error("Error procesando imagen:", err)
        setError(`Error al procesar la imagen: ${err instanceof Error ? err.message : 'Error desconocido'}`)
        setPreview(null)
        setUploading(false)
      }
    }
    
    reader.onerror = (error) => {
      clearTimeout(timeoutId)
      console.error("Error de FileReader:", error)
      setError(`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      setPreview(null)
      setUploading(false)
    }
    
    try {
      reader.readAsDataURL(file)
    } catch (err) {
      clearTimeout(timeoutId)
      console.error("Error iniciando lectura:", err)
      setError(`Error al procesar el archivo: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    console.log("Botón clickeado, fileInputRef:", fileInputRef.current)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    } else {
      console.error("fileInputRef.current es null")
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div className="space-y-3">
        {/* Input oculto para seleccionar archivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {/* Botón de subida */}
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={uploading}
          className="w-full h-20 border-dashed border-2 hover:border-primary/50 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">{t("imageUpload.uploading")}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6" />
              <span className="text-sm">{t("imageUpload.clickToUploadImage")}</span>
            </div>
          )}
        </Button>

        {/* Preview de la imagen */}
        {preview && (
          <Card className="relative">
            <CardContent className="p-0">
              <div className="relative group">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input para URL manual (opcional) */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t("imageUpload.orPasteImageUrl")}:
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder={t("imageUpload.imageUrlPlaceholder")}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1"
            />
            {value && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  )
}