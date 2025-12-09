"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit, GripVertical, ExternalLink, Phone, Mail, Globe } from "lucide-react"
import { useButtonConfiguration } from "@/src/hooks/useButtonConfiguration"
import { SocialIcon, SOCIAL_PLATFORMS } from "@/src/components/SocialMediaIcons"
import type { CustomButton } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface ButtonConfigurationPanelProps {
  barId: string
}

const getButtonTypes = (t: any) => [
  { value: "social", label: t("admin.socialNetwork"), icon: "📱" },
  { value: "website", label: t("admin.website"), icon: "🌐" },
  { value: "phone", label: t("admin.phone"), icon: "📞" },
  { value: "email", label: t("admin.email"), icon: "📧" },
  { value: "custom", label: t("admin.custom"), icon: "🔗" }
]

const SOCIAL_PLATFORMS = {
  facebook: { label: "Facebook", url: "https://facebook.com/", icon: "📘" },
  instagram: { label: "Instagram", url: "https://instagram.com/", icon: "📷" },
  twitter: { label: "Twitter", url: "https://twitter.com/", icon: "🐦" },
  tiktok: { label: "TikTok", url: "https://tiktok.com/@", icon: "🎵" },
  youtube: { label: "YouTube", url: "https://youtube.com/@", icon: "📺" },
  whatsapp: { label: "WhatsApp", url: "https://wa.me/", icon: "💬" }
}

export function ButtonConfigurationPanel({ barId }: ButtonConfigurationPanelProps) {
  const t = useT()
  const {
    configuration,
    loading,
    error,
    addButton,
    updateButton,
    deleteButton,
    toggleButtonsVisibility,
    updateButtonStyle
  } = useButtonConfiguration(barId)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingButton, setEditingButton] = useState<CustomButton | null>(null)
  const [newButton, setNewButton] = useState<Partial<CustomButton>>({
    label: "",
    url: "",
    type: "custom",
    isActive: true
  })

  const handleAddButton = async () => {
    if (!newButton.label || !newButton.url) return

    const success = await addButton({
      label: newButton.label,
      url: newButton.url,
      type: newButton.type as any,
      icon: newButton.icon,
      color: newButton.color,
      backgroundColor: newButton.backgroundColor,
      isActive: newButton.isActive ?? true
    })

    if (success) {
      setNewButton({ label: "", url: "", type: "custom", isActive: true })
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateButton = async (buttonId: string, updates: Partial<CustomButton>) => {
    await updateButton(buttonId, updates)
    setEditingButton(null)
  }

  const handleDeleteButton = async (buttonId: string) => {
    if (confirm(t("admin.areYouSureDeleteButton"))) {
      await deleteButton(buttonId)
    }
  }

  const handleSocialPlatformSelect = (platform: string) => {
    const socialData = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]
    setNewButton(prev => ({
      ...prev,
      type: "social",
      label: socialData.label,
      url: socialData.url,
      icon: "" // No usar emoji, el logo real se mostrará automáticamente
    }))
  }

  const getButtonIcon = (type: string, customIcon?: string, button?: CustomButton) => {
    // Si hay un icono personalizado (emoji), usarlo
    if (customIcon) return customIcon
    
    // Para botones de redes sociales, usar el logo real
    if (type === "social" && button?.label) {
      const platform = Object.keys(SOCIAL_PLATFORMS).find(key => 
        SOCIAL_PLATFORMS[key as keyof typeof SOCIAL_PLATFORMS].label === button.label
      )
      if (platform) {
        return <SocialIcon platform={platform} size={16} />
      }
    }
    
    // Iconos por defecto para otros tipos
    switch (type) {
      case "social": return "📱"
      case "website": return "🌐"
      case "phone": return "📞"
      case "email": return "📧"
      default: return "🔗"
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

  if (error) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 {t("admin.customizableButtons")}
          <Badge variant="outline" className="ml-auto">
            {configuration.buttons.length} {t("admin.buttons")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle de visibilidad */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">{t("admin.showButtonsOnTables")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("admin.buttonsWillAppearInTables")}
            </p>
          </div>
          <Switch
            checked={configuration.showButtons}
            onCheckedChange={toggleButtonsVisibility}
          />
        </div>

        {/* Configuración de estilo */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("admin.buttonStyle")}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{t("admin.layout")}</Label>
              <Select
                value={configuration.buttonStyle.layout}
                onValueChange={(value: any) => updateButtonStyle({ layout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">{t("admin.horizontal")}</SelectItem>
                  <SelectItem value="vertical">{t("admin.vertical")}</SelectItem>
                  <SelectItem value="grid">{t("admin.grid")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("admin.size")}</Label>
              <Select
                value={configuration.buttonStyle.size}
                onValueChange={(value: any) => updateButtonStyle({ size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t("admin.small")}</SelectItem>
                  <SelectItem value="medium">{t("admin.medium")}</SelectItem>
                  <SelectItem value="large">{t("admin.large")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("admin.spacing")}</Label>
              <Select
                value={configuration.buttonStyle.spacing}
                onValueChange={(value: any) => updateButtonStyle({ spacing: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tight">{t("admin.tight")}</SelectItem>
                  <SelectItem value="normal">{t("admin.normal")}</SelectItem>
                  <SelectItem value="loose">{t("admin.loose")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Lista de botones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{t("admin.configuredButtons")}</h3>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t("admin.addButton")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("admin.addNewButton")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Selección rápida de redes sociales */}
                  <div>
                    <Label>{t("admin.socialNetworks")}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSocialPlatformSelect(key)}
                          className="flex items-center gap-2"
                        >
                          <SocialIcon platform={platform.icon} size={16} />
                          {platform.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="label">{t("admin.buttonLabel")} *</Label>
                    <Input
                      id="label"
                      value={newButton.label || ""}
                      onChange={(e) => setNewButton(prev => ({ ...prev, label: e.target.value }))}
                      placeholder={t("admin.buttonLabelPlaceholder")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="url">{t("admin.url")} *</Label>
                    <Input
                      id="url"
                      value={newButton.url || ""}
                      onChange={(e) => setNewButton(prev => ({ ...prev, url: e.target.value }))}
                      placeholder={t("admin.urlPlaceholder")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">{t("admin.type")}</Label>
                    <Select
                      value={newButton.type || "custom"}
                      onValueChange={(value: any) => setNewButton(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getButtonTypes(t).map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="icon">{t("admin.customIcon")}</Label>
                    <Input
                      id="icon"
                      value={newButton.icon || ""}
                      onChange={(e) => setNewButton(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder={t("admin.customIconPlaceholder")}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddButton} className="flex-1">
                      {t("admin.addButton")}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      {t("admin.cancel")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {configuration.buttons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("admin.noButtonsConfigured")}</p>
                <p className="text-sm">{t("admin.addButtonsToAppearOnTables")}</p>
              </div>
            ) : (
              configuration.buttons
                .sort((a, b) => a.order - b.order)
                .map((button) => (
                  <div
                    key={button.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center justify-center w-6 h-6">
                        {getButtonIcon(button.type, button.icon, button)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{button.label}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {button.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={button.isActive ? "default" : "secondary"}>
                        {button.isActive ? t("admin.active") : t("admin.inactive")}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingButton(button)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteButton(button.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Dialog para editar botón */}
        {editingButton && (
          <Dialog open={!!editingButton} onOpenChange={() => setEditingButton(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("admin.editButton")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("admin.buttonLabel")}</Label>
                  <Input
                    value={editingButton.label}
                    onChange={(e) => setEditingButton(prev => prev ? { ...prev, label: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>{t("admin.url")}</Label>
                  <Input
                    value={editingButton.url}
                    onChange={(e) => setEditingButton(prev => prev ? { ...prev, url: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>{t("admin.customIcon")}</Label>
                  <Input
                    value={editingButton.icon || ""}
                    onChange={(e) => setEditingButton(prev => prev ? { ...prev, icon: e.target.value } : null)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingButton.isActive}
                    onCheckedChange={(checked) => setEditingButton(prev => prev ? { ...prev, isActive: checked } : null)}
                  />
                  <Label>{t("admin.buttonActive")}</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateButton(editingButton.id, editingButton)} className="flex-1">
                    {t("admin.saveChanges")}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingButton(null)}>
                    {t("admin.cancel")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
