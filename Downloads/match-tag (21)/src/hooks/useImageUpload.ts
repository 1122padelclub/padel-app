"use client"

import { useState } from "react"
import { toast } from "sonner"

interface UseImageUploadProps {
  barId: string
  onSuccess?: (imageUrl: string) => void
  onError?: (error: string) => void
}

export function useImageUpload({ barId, onSuccess, onError }: UseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
      const error = "No se seleccionó ningún archivo"
      onError?.(error)
      toast.error(error)
      return null
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      const error = "Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP"
      onError?.(error)
      toast.error(error)
      return null
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      const error = "El archivo es demasiado grande. Máximo 5MB"
      onError?.(error)
      toast.error(error)
      return null
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("barId", barId)

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch("/api/upload-announcement-image", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al subir la imagen")
      }

      const data = await response.json()
      
      if (data.success && data.imageUrl) {
        onSuccess?.(data.imageUrl)
        toast.success("Imagen subida exitosamente")
        return data.imageUrl
      } else {
        throw new Error("No se recibió URL de la imagen")
      }

    } catch (error: any) {
      console.error("Error uploading image:", error)
      const errorMessage = error.message || "Error al subir la imagen"
      onError?.(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return {
    uploadImage,
    isUploading,
    uploadProgress
  }
}





