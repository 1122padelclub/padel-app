"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "@/src/components/ThemeProvider"
import type { ThemeColors, ThemeMode, LayoutPreset, MenuCustomization } from "@/src/types/theme"
import { Palette, Type, ImageIcon, Settings, Eye, Menu, Building2 } from "lucide-react"
import { useT } from "@/src/hooks/useTranslation"

export function ThemeAdminPreview() {
  const { theme, setTheme, resetTheme } = useTheme()
  const [previewMode, setPreviewMode] = useState<"table" | "menu">("table")
  const t = useT()

  const handleMenuColorChange = (colorKey: keyof ThemeColors, value: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(value)) return

    setTheme({
      colors: {
        ...theme.colors,
        [colorKey]: value,
      },
    })
  }

  const handleMenuCustomizationChange = (key: keyof MenuCustomization, value: any) => {
    setTheme({
      menuCustomization: {
        ...theme.menuCustomization,
        [key]: value,
      },
    })
  }

  const handleTypographyChange = (key: keyof typeof theme.typography, value: string) => {
    setTheme({
      typography: {
        ...theme.typography,
        [key]: value,
      },
    })
  }

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    // Basic color validation
    if (!/^#[0-9A-F]{6}$/i.test(value)) return

    setTheme({
      colors: {
        ...theme.colors,
        [colorKey]: value,
      },
    })
  }

  const handleModeChange = (mode: ThemeMode) => {
    setTheme({ mode })
  }

  const handleLayoutChange = (layoutPreset: LayoutPreset) => {
    setTheme({ layoutPreset })
  }

  const handleBrandingChange = (key: keyof typeof theme.branding, value: string | boolean) => {
    setTheme({
      branding: {
        ...theme.branding,
        [key]: value,
      },
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Theme Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t("admin.tableDesignConfiguration")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="branding" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="branding">
                <Building2 className="w-4 h-4 mr-1" />
                {t("admin.brand")}
              </TabsTrigger>
              <TabsTrigger value="colors">
                <Palette className="w-4 h-4 mr-1" />
                {t("admin.colors")}
              </TabsTrigger>
              <TabsTrigger value="typography">
                <Type className="w-4 h-4 mr-1" />
                {t("admin.typography")}
              </TabsTrigger>
              <TabsTrigger value="assets">
                <ImageIcon className="w-4 h-4 mr-1" />
                {t("admin.assets")}
              </TabsTrigger>
              <TabsTrigger value="menu">
                <Menu className="w-4 h-4 mr-1" />
                {t("admin.menu")}
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Settings className="w-4 h-4 mr-1" />
                {t("admin.layout")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="branding" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("admin.restaurantName")}</Label>
                  <Input
                    type="text"
                    value={theme.branding?.restaurantName || t("admin.myRestaurant")}
                    onChange={(e) => handleBrandingChange("restaurantName", e.target.value)}
                    placeholder={t("admin.restaurantNamePlaceholder")}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("admin.restaurantNameDescription")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.taglineOptional")}</Label>
                  <Input
                    type="text"
                    value={theme.branding?.tagline || ""}
                    onChange={(e) => handleBrandingChange("tagline", e.target.value)}
                    placeholder={t("admin.taglinePlaceholder")}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">{t("admin.taglineDescription")}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("admin.showPoweredBy")}</Label>
                    <p className="text-xs text-muted-foreground">{t("admin.showPoweredByDescription")}</p>
                  </div>
                  <Switch
                    checked={theme.branding?.showPoweredBy ?? true}
                    onCheckedChange={(checked) => handleBrandingChange("showPoweredBy", checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Existing color controls */}
                <div className="space-y-2">
                  <Label>{t("admin.primary")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.primary}
                      onChange={(e) => handleColorChange("primary", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.primary}
                      onChange={(e) => handleColorChange("primary", e.target.value)}
                      className="flex-1"
                      placeholder="#0A84FF"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secondary</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.secondary}
                      onChange={(e) => handleColorChange("secondary", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.secondary}
                      onChange={(e) => handleColorChange("secondary", e.target.value)}
                      className="flex-1"
                      placeholder="#252525"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Accent</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.accent}
                      onChange={(e) => handleColorChange("accent", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.accent}
                      onChange={(e) => handleColorChange("accent", e.target.value)}
                      className="flex-1"
                      placeholder="#0A84FF"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.background}
                      onChange={(e) => handleColorChange("background", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.background}
                      onChange={(e) => handleColorChange("background", e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Surface</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.surface}
                      onChange={(e) => handleColorChange("surface", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.surface}
                      onChange={(e) => handleColorChange("surface", e.target.value)}
                      className="flex-1"
                      placeholder="#1C1C1C"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Success</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.success}
                      onChange={(e) => handleColorChange("success", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.success}
                      onChange={(e) => handleColorChange("success", e.target.value)}
                      className="flex-1"
                      placeholder="#34C759"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Warning</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.warning}
                      onChange={(e) => handleColorChange("warning", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.warning}
                      onChange={(e) => handleColorChange("warning", e.target.value)}
                      className="flex-1"
                      placeholder="#FF9500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Danger</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.danger}
                      onChange={(e) => handleColorChange("danger", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.danger}
                      onChange={(e) => handleColorChange("danger", e.target.value)}
                      className="flex-1"
                      placeholder="#FF3B30"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">{t("admin.menuColors")}</h4>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.menuBackground")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.menuBackground}
                      onChange={(e) => handleMenuColorChange("menuBackground", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.menuBackground}
                      onChange={(e) => handleMenuColorChange("menuBackground", e.target.value)}
                      className="flex-1"
                      placeholder="#F5F5DC"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.menuText")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.menuText}
                      onChange={(e) => handleMenuColorChange("menuText", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.menuText}
                      onChange={(e) => handleMenuColorChange("menuText", e.target.value)}
                      className="flex-1"
                      placeholder="#2D2D2D"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Borde de Categorías</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.categoryBorder}
                      onChange={(e) => handleMenuColorChange("categoryBorder", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.categoryBorder}
                      onChange={(e) => handleMenuColorChange("categoryBorder", e.target.value)}
                      className="flex-1"
                      placeholder="#4A9B8E"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fondo de Categorías</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.colors.categoryBackground}
                      onChange={(e) => handleMenuColorChange("categoryBackground", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={theme.colors.categoryBackground}
                      onChange={(e) => handleMenuColorChange("categoryBackground", e.target.value)}
                      className="flex-1"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              {/* Existing typography controls */}
              <div className="space-y-2">
                <Label>{t("admin.themeMode")}</Label>
                <Select value={theme.mode} onValueChange={handleModeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Escala de Fuente</Label>
                <Select
                  value={theme.typography.scale}
                  onValueChange={(scale: "small" | "medium" | "large") =>
                    setTheme({ typography: { ...theme.typography, scale } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeña</SelectItem>
                    <SelectItem value="medium">Mediana</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">{t("admin.specificTypography")}</h4>

                <div className="space-y-2">
                  <Label>Fuente del Header</Label>
                  <Select
                    value={theme.typography.headerFont}
                    onValueChange={(value) => handleTypographyChange("headerFont", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter (Sans-serif)</SelectItem>
                      <SelectItem value="Dancing Script">Dancing Script (Cursiva)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display (Serif)</SelectItem>
                      <SelectItem value="Montserrat">Montserrat (Sans-serif)</SelectItem>
                      <SelectItem value="Pacifico">Pacifico (Cursiva)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Sans-serif)</SelectItem>
                      <SelectItem value="Lora">Lora (Serif)</SelectItem>
                      <SelectItem value="Caveat">Caveat (Handwriting)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fuente de Categorías</Label>
                  <Select
                    value={theme.typography.categoryFont}
                    onValueChange={(value) => handleTypographyChange("categoryFont", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter (Sans-serif)</SelectItem>
                      <SelectItem value="Dancing Script">Dancing Script (Cursiva)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display (Serif)</SelectItem>
                      <SelectItem value="Montserrat">Montserrat (Sans-serif)</SelectItem>
                      <SelectItem value="Pacifico">Pacifico (Cursiva)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Sans-serif)</SelectItem>
                      <SelectItem value="Lora">Lora (Serif)</SelectItem>
                      <SelectItem value="Caveat">Caveat (Handwriting)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fuente de Precios</Label>
                  <Select
                    value={theme.typography.priceFont}
                    onValueChange={(value) => handleTypographyChange("priceFont", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter (Sans-serif)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Sans-serif)</SelectItem>
                      <SelectItem value="Montserrat">Montserrat (Sans-serif)</SelectItem>
                      <SelectItem value="Lato">Lato (Sans-serif)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              {/* Existing asset controls */}
              <div className="space-y-2">
                <Label>Logo del Restaurante</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const result = event.target?.result as string
                          setTheme({
                            assets: { ...theme.assets, logoUrl: result },
                          })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full"
                  />
                  <Input
                    value={theme.assets.logoUrl || ""}
                    onChange={(e) =>
                      setTheme({
                        assets: { ...theme.assets, logoUrl: e.target.value },
                      })
                    }
                    placeholder="O ingresa URL del logo: https://ejemplo.com/logo.png"
                  />
                  {theme.assets.logoUrl && (
                    <div className="mt-2">
                      <img
                        src={theme.assets.logoUrl || "/placeholder.svg"}
                        alt="Logo preview"
                        className="w-16 h-16 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Imagen de Fondo para Chats</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const result = event.target?.result as string
                          setTheme({
                            assets: { ...theme.assets, backgroundImageUrl: result },
                          })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full"
                  />
                  <Input
                    value={theme.assets.backgroundImageUrl || ""}
                    onChange={(e) =>
                      setTheme({
                        assets: { ...theme.assets, backgroundImageUrl: e.target.value },
                      })
                    }
                    placeholder="O ingresa URL del fondo: https://ejemplo.com/fondo.jpg"
                  />
                  {theme.assets.backgroundImageUrl && (
                    <div className="mt-2">
                      <img
                        src={theme.assets.backgroundImageUrl || "/placeholder.svg"}
                        alt="Background preview"
                        className="w-full h-24 object-cover border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Imagen de Fondo del Menú</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const result = event.target?.result as string
                          setTheme({
                            assets: { ...theme.assets, menuBackgroundUrl: result },
                          })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full"
                  />
                  <Input
                    value={theme.assets.menuBackgroundUrl || ""}
                    onChange={(e) =>
                      setTheme({
                        assets: { ...theme.assets, menuBackgroundUrl: e.target.value },
                      })
                    }
                    placeholder="O ingresa URL del fondo del menú: https://ejemplo.com/fondo-menu.jpg"
                  />
                  {theme.assets.menuBackgroundUrl && (
                    <div className="mt-2">
                      <img
                        src={theme.assets.menuBackgroundUrl || "/placeholder.svg"}
                        alt="Menu background preview"
                        className="w-full h-24 object-cover border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Imagen de Fondo del Header</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const result = event.target?.result as string
                          setTheme({
                            assets: { ...theme.assets, headerBackgroundUrl: result },
                          })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full"
                  />
                  <Input
                    value={theme.assets.headerBackgroundUrl || ""}
                    onChange={(e) =>
                      setTheme({
                        assets: { ...theme.assets, headerBackgroundUrl: e.target.value },
                      })
                    }
                    placeholder="O ingresa URL del fondo del header: https://ejemplo.com/header.jpg"
                  />
                  {theme.assets.headerBackgroundUrl && (
                    <div className="mt-2">
                      <img
                        src={theme.assets.headerBackgroundUrl || "/placeholder.svg"}
                        alt="Header background preview"
                        className="w-full h-16 object-cover border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="menu" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Estilo de Categorías</h4>

                <div className="space-y-2">
                  <Label>Forma de las Categorías</Label>
                  <Select
                    value={theme.menuCustomization.categoryStyle}
                    onValueChange={(value: "rounded" | "oval" | "square" | "custom") =>
                      handleMenuCustomizationChange("categoryStyle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oval">Ovaladas (como Guadalupe Café)</SelectItem>
                      <SelectItem value="rounded">Redondeadas</SelectItem>
                      <SelectItem value="square">Cuadradas</SelectItem>
                      <SelectItem value="custom">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Posición de Imágenes</Label>
                  <Select
                    value={theme.menuCustomization.categoryImagePosition}
                    onValueChange={(value: "left" | "right" | "background") =>
                      handleMenuCustomizationChange("categoryImagePosition", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Derecha</SelectItem>
                      <SelectItem value="left">Izquierda</SelectItem>
                      <SelectItem value="background">Fondo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estilo del Header</Label>
                  <Select
                    value={theme.menuCustomization.headerStyle}
                    onValueChange={(value: "overlay" | "solid" | "transparent" | "gradient") =>
                      handleMenuCustomizationChange("headerStyle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overlay">Con Overlay (como Guadalupe Café)</SelectItem>
                      <SelectItem value="solid">Sólido</SelectItem>
                      <SelectItem value="transparent">Transparente</SelectItem>
                      <SelectItem value="gradient">Degradado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Radio de Bordes: {theme.menuCustomization.borderRadius}px</Label>
                  <Slider
                    value={[theme.menuCustomization.borderRadius]}
                    onValueChange={([value]) => handleMenuCustomizationChange("borderRadius", value)}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opacidad del Fondo: {theme.menuCustomization.backgroundOpacity}%</Label>
                  <Slider
                    value={[theme.menuCustomization.backgroundOpacity]}
                    onValueChange={([value]) => handleMenuCustomizationChange("backgroundOpacity", value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intensidad de Sombra</Label>
                  <Select
                    value={theme.menuCustomization.shadowIntensity}
                    onValueChange={(value: "none" | "light" | "medium" | "strong") =>
                      handleMenuCustomizationChange("shadowIntensity", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin Sombra</SelectItem>
                      <SelectItem value="light">Ligera</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="strong">Fuerte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={theme.menuCustomization.showCategoryImages}
                    onCheckedChange={(checked) => handleMenuCustomizationChange("showCategoryImages", checked)}
                  />
                  <Label>Mostrar Imágenes en Categorías</Label>
                </div>
              </div>
            </TabsContent>

            {/* Existing layout tab */}
            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-2">
                <Label>Estilo de Mesa</Label>
                <Select value={theme.layoutPreset} onValueChange={handleLayoutChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Clásico</SelectItem>
                    <SelectItem value="glass">Cristal Moderno</SelectItem>
                    <SelectItem value="high-contrast">Alto Contraste</SelectItem>
                    <SelectItem value="event-skin">Evento Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={theme.soundPack.enabled}
                  onCheckedChange={(enabled) => setTheme({ soundPack: { ...theme.soundPack, enabled } })}
                />
                <Label>Sonidos de Notificación</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={theme.haptics.enabled}
                  onCheckedChange={(enabled) => setTheme({ haptics: { ...theme.haptics, enabled } })}
                />
                <Label>Vibración en Dispositivos Móviles</Label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6">
            <Button onClick={resetTheme} variant="outline" className="flex-1 bg-transparent">
              {t("admin.resetTheme")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {t("admin.tablePreview")}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={previewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("table")}
            >
              Interfaz Mesa
            </Button>
            <Button
              variant={previewMode === "menu" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("menu")}
            >
              {t("admin.customMenu")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="border rounded-lg p-4 min-h-[400px]"
            style={{
              backgroundColor: previewMode === "menu" ? theme.colors.menuBackground : theme.colors.background,
              backgroundImage:
                previewMode === "menu" && theme.assets.menuBackgroundUrl
                  ? `url(${theme.assets.menuBackgroundUrl})`
                  : theme.assets.backgroundImageUrl
                    ? `url(${theme.assets.backgroundImageUrl})`
                    : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: previewMode === "menu" ? theme.menuCustomization.backgroundOpacity / 100 : 1,
            }}
          >
            {previewMode === "table" ? <TableInterfacePreview /> : <CustomMenuPreview />}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TableInterfacePreview() {
  const { theme } = useTheme()

  return (
    <div className="space-y-4">
      {/* Header de Mesa */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          {theme.assets.logoUrl && (
            <img
              src={theme.assets.logoUrl || "/placeholder.svg"}
              alt="Logo"
              className="w-12 h-12 rounded-lg object-contain"
            />
          )}
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                color: theme.colors.primary,
                fontFamily: theme.typography.headerFont,
              }}
            >
              {theme.branding?.restaurantName || "Mi Restaurante"}
            </h1>
            {theme.branding?.tagline && (
              <p
                className="text-sm opacity-80"
                style={{
                  color: theme.colors.secondary,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                {theme.branding.tagline}
              </p>
            )}
          </div>
        </div>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <span className="font-semibold" style={{ color: theme.colors.primary }}>
            Tu mesa: 5
          </span>
        </div>

        {theme.branding?.showPoweredBy && (
          <p className="text-xs opacity-60 mt-2" style={{ color: theme.colors.secondary }}>
            Powered by Gibra
          </p>
        )}
      </div>

      {/* Chat de Mesa */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.colors.surface }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: theme.colors.primary, color: "white" }}
          >
            M
          </div>
          <div>
            <div className="font-medium" style={{ color: theme.colors.primary }}>
              Mesa 5
            </div>
            <div className="text-sm" style={{ color: theme.colors.secondary }}>
              ¡Hola! ¿Podrían traernos la carta?
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-lg ml-8"
          style={{ backgroundColor: theme.colors.accent + "20" }}
        >
          <div>
            <div className="font-medium text-right" style={{ color: theme.colors.accent }}>
              Personal
            </div>
            <div className="text-sm text-right" style={{ color: theme.colors.secondary }}>
              ¡Por supuesto! Enseguida se la llevamos.
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: theme.colors.accent, color: "white" }}
          >
            P
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Button
          className="w-full"
          style={{
            backgroundColor: theme.colors.primary,
            color: "white",
          }}
        >
          {t("admin.viewMenu")}
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          style={{
            borderColor: theme.colors.accent,
            color: theme.colors.accent,
          }}
        >
          Llamar Mesero
        </Button>
      </div>
    </div>
  )
}

function CustomMenuPreview() {
  const { theme } = useTheme()

  const getShadowClass = () => {
    switch (theme.menuCustomization.shadowIntensity) {
      case "light":
        return "shadow-sm"
      case "medium":
        return "shadow-md"
      case "strong":
        return "shadow-lg"
      default:
        return ""
    }
  }

  const getCategoryStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.categoryBackground,
      borderColor: theme.colors.categoryBorder,
      color: theme.colors.menuText,
      borderRadius:
        theme.menuCustomization.categoryStyle === "oval"
          ? "50px"
          : theme.menuCustomization.categoryStyle === "rounded"
            ? `${theme.menuCustomization.borderRadius}px`
            : theme.menuCustomization.categoryStyle === "square"
              ? "4px"
              : `${theme.menuCustomization.borderRadius}px`,
    }
    return baseStyle
  }

  return (
    <div className="space-y-4">
      {/* Header personalizado */}
      <div
        className="relative p-6 rounded-lg text-center"
        style={{
          backgroundImage: theme.assets.headerBackgroundUrl ? `url(${theme.assets.headerBackgroundUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {theme.menuCustomization.headerStyle === "overlay" && (
          <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: theme.colors.headerOverlay }} />
        )}
        <div className="relative z-10">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: theme.typography.headerFont,
              color: theme.menuCustomization.headerStyle === "overlay" ? "#FFFFFF" : theme.colors.primary,
            }}
          >
            {theme.branding?.restaurantName || "Mi Restaurante"}
          </h1>
          <p
            className="text-lg opacity-90"
            style={{
              fontFamily: theme.typography.bodyFont,
              color: theme.menuCustomization.headerStyle === "overlay" ? "#FFFFFF" : theme.colors.menuText,
            }}
          >
            {theme.branding?.tagline || "Menú Digital Personalizado"}
          </p>
        </div>
      </div>

      {/* Categorías personalizadas */}
      <div className="space-y-3">
        {["Entradas", "Platos Principales", "Postres", "Bebidas"].map((category, index) => (
          <div
            key={category}
            className={`flex items-center p-4 border-2 ${getShadowClass()} transition-all hover:scale-[1.02]`}
            style={getCategoryStyle()}
          >
            <div className="flex-1">
              <h3
                className="text-xl font-semibold"
                style={{
                  fontFamily: theme.typography.categoryFont,
                  color: theme.colors.menuText,
                }}
              >
                {category}
              </h3>
            </div>
            {theme.menuCustomization.showCategoryImages && (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center ml-4">
                <span className="text-2xl">🍽️</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ejemplo de item del menú */}
      <div
        className="border rounded-lg p-4 mt-6"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.categoryBorder,
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h4
            className="font-semibold"
            style={{
              fontFamily: theme.typography.bodyFont,
              color: theme.colors.menuText,
            }}
          >
            Plato Especial
          </h4>
          <span
            className="font-bold"
            style={{
              fontFamily: theme.typography.priceFont,
              color: theme.colors.accent,
            }}
          >
            €18.50
          </span>
        </div>
        <p
          className="text-sm mb-3"
          style={{
            fontFamily: theme.typography.bodyFont,
            color: theme.colors.menuText,
            opacity: 0.8,
          }}
        >
          Deliciosa combinación de ingredientes frescos con nuestra salsa especial
        </p>
      </div>

      {theme.branding?.showPoweredBy && (
        <div className="text-center mt-6">
          <p className="text-xs opacity-60" style={{ color: theme.colors.menuText }}>
            Powered by Gibra
          </p>
        </div>
      )}
    </div>
  )
}
