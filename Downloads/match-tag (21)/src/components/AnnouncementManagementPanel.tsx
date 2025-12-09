"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAnnouncements } from "@/src/hooks/useAnnouncements"
import { useImageUpload } from "@/src/hooks/useImageUpload"
import { toast } from "sonner"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Calendar,
  Menu,
  Table,
  GripVertical,
  X
} from "lucide-react"
import type { Announcement } from "@/src/types"

interface AnnouncementManagementPanelProps {
  barId: string
}

export function AnnouncementManagementPanel({ barId }: AnnouncementManagementPanelProps) {
  const { 
    announcements, 
    loading, 
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement, 
    toggleAnnouncement 
  } = useAnnouncements(barId)

  const { uploadImage, isUploading } = useImageUpload({ 
    barId, 
    onSuccess: (imageUrl) => {
      setFormData(prev => ({ ...prev, imageUrl }))
    }
  })

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    description: "",
    imageUrl: "",
    isActive: true,
    showOnMenu: true,
    showOnTable: true,
    order: announcements.length
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      isActive: true,
      showOnMenu: true,
      showOnTable: true,
      order: announcements.length
    })
    setIsCreating(false)
    setEditingId(null)
    setSelectedFile(null)
    setImagePreview(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile) return
    
    const imageUrl = await uploadImage(selectedFile)
    if (imageUrl) {
      setImagePreview(null)
      setSelectedFile(null)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }))
    setImagePreview(null)
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.imageUrl) {
      toast.error("Por favor completa el título y la imagen")
      return
    }

    try {
      if (editingId) {
        await updateAnnouncement(editingId, formData as Announcement)
        toast.success("Anuncio actualizado exitosamente")
      } else {
        await createAnnouncement(formData as Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>)
        toast.success("Anuncio creado exitosamente")
      }
      resetForm()
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setFormData(announcement)
    setEditingId(announcement.id)
    setIsCreating(true)
  }

  const handleDelete = async (announcementId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este anuncio?")) {
      try {
        await deleteAnnouncement(announcementId)
        toast.success("Anuncio eliminado")
      } catch (error: any) {
        toast.error(`Error: ${error.message}`)
      }
    }
  }

  const handleToggle = async (announcementId: string, isActive: boolean) => {
    try {
      await toggleAnnouncement(announcementId, isActive)
      toast.success(`Anuncio ${isActive ? 'activado' : 'desactivado'}`)
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-serif flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gestión de Anuncios
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Crea anuncios que aparecerán cuando los clientes abran una mesa o el menú
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Anuncio
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de anuncios */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Imagen */}
                <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold truncate">{announcement.title}</h3>
                      {announcement.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {announcement.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant={announcement.isActive ? "default" : "secondary"}>
                          {announcement.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Menu className="h-4 w-4" />
                          <span>{announcement.showOnMenu ? "Menú" : "No menú"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Table className="h-4 w-4" />
                          <span>{announcement.showOnTable ? "Mesa" : "No mesa"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(announcement.id, !announcement.isActive)}
                      >
                        {announcement.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {announcements.length === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay anuncios</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer anuncio para promocionar eventos y ofertas especiales
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Anuncio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de creación/edición */}
      {isCreating && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>
              {editingId ? "Editar Anuncio" : "Nuevo Anuncio"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Nueva Promoción"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional del anuncio"
                />
              </div>

              <div>
                <Label>Imagen del Anuncio *</Label>
                
                {/* Preview de imagen actual */}
                {formData.imageUrl && (
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Imagen actual del anuncio
                    </p>
                  </div>
                )}

                {/* Preview de imagen seleccionada */}
                {imagePreview && !formData.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Vista previa de la imagen seleccionada
                    </p>
                  </div>
                )}

                {/* Controles de carga */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                      disabled={isUploading}
                    />
                    {selectedFile && (
                      <Button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={isUploading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: {selectedFile.name}
                    </p>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>Formatos permitidos: JPG, PNG, WebP</p>
                    <p>Tamaño máximo: 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showOnMenu"
                    checked={formData.showOnMenu || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnMenu: checked }))}
                  />
                  <Label htmlFor="showOnMenu">Mostrar en Menú</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showOnTable"
                    checked={formData.showOnTable || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnTable: checked }))}
                  />
                  <Label htmlFor="showOnTable">Mostrar en Mesa</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Anuncio Activo</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? "Actualizar" : "Crear"} Anuncio
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
