"use client"

import type React from "react"

import { useState } from "react"
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import { useMenu } from "@/src/hooks/useMenu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/src/components/ImageUpload"
import { MenuItemSpecifications } from "@/src/components/MenuItemSpecifications"
import { Trash2, Tag, Settings } from "lucide-react"
import type { MenuItemSpecification } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface AdminMenuListProps {
  barId: string
}

export function AdminMenuList({ barId }: AdminMenuListProps) {
  const { categories, items, loading, getItemsByCategory, refetch } = useMenu(barId)
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [isCreatingItem, setIsCreatingItem] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const t = useT()

  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isUpdatingItem, setIsUpdatingItem] = useState(false)

  const [newItemName, setNewItemName] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("")
  const [newItemImage, setNewItemImage] = useState("")
  const [newItemPromotion, setNewItemPromotion] = useState("")
  const [newItemPromotionPrice, setNewItemPromotionPrice] = useState("")
  const [newItemSpecifications, setNewItemSpecifications] = useState<MenuItemSpecification[]>([])
  // Badges
  const [newItemIsRecommended, setNewItemIsRecommended] = useState(false)
  const [newItemIsNew, setNewItemIsNew] = useState(false)
  const [newItemIsSpicy, setNewItemIsSpicy] = useState(false)
  const [newItemIsVegetarian, setNewItemIsVegetarian] = useState(false)
  const [newItemIsVegan, setNewItemIsVegan] = useState(false)
  const [newItemIsGlutenFree, setNewItemIsGlutenFree] = useState(false)

  const [newCategoryName, setNewCategoryName] = useState("")

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setNewItemName(item.name)
    setNewItemDescription(item.description || "")
    setNewItemPrice(item.price.toString())
    setNewItemCategory(item.categoryId)
    setNewItemImage(item.imageUrl || "")
    setNewItemPromotion(item.promotion || "")
    setNewItemPromotionPrice(item.promotionPrice?.toString() || "")
    setNewItemSpecifications(item.specifications || [])
    // Cargar badges
    setNewItemIsRecommended(item.isRecommended || false)
    setNewItemIsNew(item.isNew || false)
    setNewItemIsSpicy(item.isSpicy || false)
    setNewItemIsVegetarian(item.isVegetarian || false)
    setNewItemIsVegan(item.isVegan || false)
    setNewItemIsGlutenFree(item.isGlutenFree || false)
    setIsEditItemOpen(true)
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    setIsUpdatingItem(true)
    try {
      const itemRef = doc(db, "bars", barId, "menuItems", editingItem.id)
      const updateData: any = {
        name: newItemName.trim(),
        description: newItemDescription.trim() || null,
        price: Number.parseFloat(newItemPrice),
        categoryId: newItemCategory,
        imageUrl: newItemImage || null,
        updatedAt: new Date(),
      }

      if (newItemPromotion.trim()) {
        updateData.promotion = newItemPromotion.trim()
        updateData.promotionPrice = newItemPromotionPrice ? Number.parseFloat(newItemPromotionPrice) : null
      } else {
        updateData.promotion = null
        updateData.promotionPrice = null
      }

      if (newItemSpecifications.length > 0) {
        updateData.specifications = newItemSpecifications
      } else {
        updateData.specifications = null
      }

      // Actualizar badges
      updateData.isRecommended = newItemIsRecommended
      updateData.isNew = newItemIsNew
      updateData.isSpicy = newItemIsSpicy
      updateData.isVegetarian = newItemIsVegetarian
      updateData.isVegan = newItemIsVegan
      updateData.isGlutenFree = newItemIsGlutenFree

      await updateDoc(itemRef, updateData)

      console.log("[v0] Item actualizado exitosamente")
      setIsEditItemOpen(false)
      setEditingItem(null)
      resetForm()
      refetch()
    } catch (error) {
      console.error("[v0] Error updating item:", error)
      alert(t("admin.errorUpdatingItem"))
    } finally {
      setIsUpdatingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(t("admin.confirmDeleteItem", { name: itemName }))) {
      return
    }

    try {
      const itemRef = doc(db, "bars", barId, "menuItems", itemId)
      await deleteDoc(itemRef)
      console.log("[v0] Item eliminado exitosamente")
      refetch()
    } catch (error) {
      console.error("[v0] Error deleting item:", error)
      alert(t("admin.errorDeletingItem"))
    }
  }

  const resetForm = () => {
    setNewItemName("")
    setNewItemDescription("")
    setNewItemPrice("")
    setNewItemCategory("")
    setNewItemImage("")
    setNewItemPromotion("")
    setNewItemPromotionPrice("")
    setNewItemSpecifications([])
    // Resetear badges
    setNewItemIsRecommended(false)
    setNewItemIsNew(false)
    setNewItemIsSpicy(false)
    setNewItemIsVegetarian(false)
    setNewItemIsVegan(false)
    setNewItemIsGlutenFree(false)
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemCategory) {
      alert(t("admin.pleaseSelectCategory"))
      return
    }

    setIsCreatingItem(true)
    try {
      const itemsRef = collection(db, "bars", barId, "menuItems")
      const itemData: any = {
        barId,
        categoryId: newItemCategory,
        name: newItemName.trim(),
        description: newItemDescription.trim() || null,
        price: Number.parseFloat(newItemPrice),
        isAvailable: true,
        imageUrl: newItemImage || null,
        createdAt: new Date(),
      }

      if (newItemPromotion.trim()) {
        itemData.promotion = newItemPromotion.trim()
        itemData.promotionPrice = newItemPromotionPrice ? Number.parseFloat(newItemPromotionPrice) : null
      }

      if (newItemSpecifications.length > 0) {
        itemData.specifications = newItemSpecifications
      }

      // Agregar badges
      itemData.isRecommended = newItemIsRecommended
      itemData.isNew = newItemIsNew
      itemData.isSpicy = newItemIsSpicy
      itemData.isVegetarian = newItemIsVegetarian
      itemData.isVegan = newItemIsVegan
      itemData.isGlutenFree = newItemIsGlutenFree

      await addDoc(itemsRef, itemData)

      console.log("[v0] Item creado exitosamente")
      setIsCreateItemOpen(false)
      resetForm()
      refetch()
    } catch (error) {
      console.error("[v0] Error creating item:", error)
      alert("Error al crear el item. Por favor intenta de nuevo.")
    } finally {
      setIsCreatingItem(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingCategory(true)
    try {
      const categoriesRef = collection(db, "bars", barId, "menuCategories")
      await addDoc(categoriesRef, {
        barId,
        name: newCategoryName.trim(),
        order: categories.length,
        createdAt: new Date(),
      })

      console.log("[v0] Categoría creada exitosamente")
      setIsCreateCategoryOpen(false)
      setNewCategoryName("")
      refetch()
    } catch (error) {
      console.error("[v0] Error creating category:", error)
      alert("Error al crear la categoría. Por favor intenta de nuevo.")
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleToggleAvailability = async (itemId: string, currentAvailability: boolean) => {
    try {
      const itemRef = doc(db, "bars", barId, "menuItems", itemId)
      await updateDoc(itemRef, {
        isAvailable: !currentAvailability,
        updatedAt: new Date(),
      })
      console.log("[v0] Disponibilidad actualizada")
      refetch()
    } catch (error) {
      console.error("[v0] Error updating availability:", error)
      alert(t("admin.errorUpdatingAvailability"))
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
              <CardTitle className="font-serif">{t("admin.menuManagement")}</CardTitle>
              <CardDescription>{t("admin.manageCategoriesAndItems")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    {t("admin.newCategory")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("admin.createNewCategory")}</DialogTitle>
                    <DialogDescription>{t("admin.addNewCategoryToMenu")}</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">{t("admin.categoryName")}</Label>
                      <Input
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                        className="rounded-xl"
                        disabled={isCreatingCategory}
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-xl" disabled={isCreatingCategory}>
                      {isCreatingCategory ? t("admin.creating") : t("admin.createCategory")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateItemOpen} onOpenChange={setIsCreateItemOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl">{t("admin.newItem")}</Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("admin.createNewItem")}</DialogTitle>
                    <DialogDescription>{t("admin.addNewItemToMenu")}</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateItem} className="space-y-4">
                    <ImageUpload
                      label={t("admin.itemImage")}
                      description={t("admin.uploadImageForMenuItem")}
                      value={newItemImage}
                      onChange={setNewItemImage}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="itemName">{t("admin.itemName")}</Label>
                      <Input
                        id="itemName"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        required
                        className="rounded-xl"
                        disabled={isCreatingItem}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemDescription">{t("admin.description")}</Label>
                      <Textarea
                        id="itemDescription"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        className="rounded-xl resize-none"
                        rows={3}
                        disabled={isCreatingItem}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemPrice">{t("admin.price")}</Label>
                      <Input
                        id="itemPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        required
                        className="rounded-xl"
                        disabled={isCreatingItem}
                      />
                    </div>
                    <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <Label className="text-sm font-medium">{t("admin.promotionOptional")}</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="itemPromotion">{t("admin.promotionDescription")}</Label>
                        <Input
                          id="itemPromotion"
                          value={newItemPromotion}
                          onChange={(e) => setNewItemPromotion(e.target.value)}
                          placeholder={t("admin.promotionExample")}
                          className="rounded-xl"
                          disabled={isCreatingItem}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="itemPromotionPrice">{t("admin.promotionPrice")}</Label>
                        <Input
                          id="itemPromotionPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newItemPromotionPrice}
                          onChange={(e) => setNewItemPromotionPrice(e.target.value)}
                          placeholder={t("admin.promotionalPrice")}
                          className="rounded-xl"
                          disabled={isCreatingItem}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-700" />
                        <Label className="text-sm font-medium text-gray-700">{t("admin.specificationsOptional")}</Label>
                      </div>
                      <MenuItemSpecifications
                        specifications={newItemSpecifications}
                        onChange={setNewItemSpecifications}
                      />
                    </div>

                    {/* Badges */}
                    <div className="space-y-4 p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-700" />
                        <Label className="text-sm font-medium text-gray-700">{t("admin.badges")}</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isRecommended"
                            checked={newItemIsRecommended}
                            onCheckedChange={setNewItemIsRecommended}
                          />
                          <Label htmlFor="isRecommended" className="text-sm text-gray-700">{t("admin.recommended")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isNew"
                            checked={newItemIsNew}
                            onCheckedChange={setNewItemIsNew}
                          />
                          <Label htmlFor="isNew" className="text-sm text-gray-700">{t("admin.new")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isSpicy"
                            checked={newItemIsSpicy}
                            onCheckedChange={setNewItemIsSpicy}
                          />
                          <Label htmlFor="isSpicy" className="text-sm text-gray-700">{t("admin.spicy")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isVegetarian"
                            checked={newItemIsVegetarian}
                            onCheckedChange={setNewItemIsVegetarian}
                          />
                          <Label htmlFor="isVegetarian" className="text-sm text-gray-700">{t("admin.vegetarian")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isVegan"
                            checked={newItemIsVegan}
                            onCheckedChange={setNewItemIsVegan}
                          />
                          <Label htmlFor="isVegan" className="text-sm text-gray-700">{t("admin.vegan")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isGlutenFree"
                            checked={newItemIsGlutenFree}
                            onCheckedChange={setNewItemIsGlutenFree}
                          />
                          <Label htmlFor="isGlutenFree" className="text-sm text-gray-700">{t("admin.glutenFree")}</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="itemCategory">Categoría</Label>
                      <Select value={newItemCategory} onValueChange={setNewItemCategory} disabled={isCreatingItem}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {categories.length === 0 && (
                        <p className="text-sm text-muted-foreground">Primero debes crear una categoría</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl"
                      disabled={isCreatingItem || categories.length === 0}
                    >
                      {isCreatingItem ? t("admin.creating") : t("menuManagement.createItem")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
            <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Item</DialogTitle>
                <DialogDescription>Modificar la información del item</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateItem} className="space-y-4">
                <ImageUpload
                  label="Imagen del Item"
                  description="Sube una imagen para el item del menú"
                  value={newItemImage}
                  onChange={setNewItemImage}
                />

                <div className="space-y-2">
                  <Label htmlFor="editItemName">Nombre del Item</Label>
                  <Input
                    id="editItemName"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                    className="rounded-xl"
                    disabled={isUpdatingItem}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editItemDescription">{t("admin.description")}</Label>
                  <Textarea
                    id="editItemDescription"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    className="rounded-xl resize-none"
                    rows={3}
                    disabled={isUpdatingItem}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editItemPrice">{t("admin.price")}</Label>
                  <Input
                    id="editItemPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    required
                    className="rounded-xl"
                    disabled={isUpdatingItem}
                  />
                </div>
                <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <Label className="text-sm font-medium">{t("admin.promotionOptional")}</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editItemPromotion">{t("admin.promotionDescription")}</Label>
                    <Input
                      id="editItemPromotion"
                      value={newItemPromotion}
                      onChange={(e) => setNewItemPromotion(e.target.value)}
                      placeholder="ej: 2x1, 50% descuento"
                      className="rounded-xl"
                      disabled={isUpdatingItem}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editItemPromotionPrice">{t("admin.promotionPrice")}</Label>
                    <Input
                      id="editItemPromotionPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemPromotionPrice}
                      onChange={(e) => setNewItemPromotionPrice(e.target.value)}
                      placeholder={t("menuManagement.promotionalPrice")}
                      className="rounded-xl"
                      disabled={isUpdatingItem}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-700" />
                    <Label className="text-sm font-medium text-gray-700">Especificaciones (Opcional)</Label>
                  </div>
                  <MenuItemSpecifications
                    specifications={newItemSpecifications}
                    onChange={setNewItemSpecifications}
                  />
                </div>

                {/* Badges */}
                <div className="space-y-4 p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-700" />
                    <Label className="text-sm font-medium text-gray-700">Etiquetas (Badges)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editIsRecommended"
                        checked={newItemIsRecommended}
                        onCheckedChange={setNewItemIsRecommended}
                        disabled={isUpdatingItem}
                      />
                      <Label htmlFor="editIsRecommended" className="text-sm text-gray-700">⭐ Recomendado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editIsNew"
                        checked={newItemIsNew}
                        onCheckedChange={setNewItemIsNew}
                        disabled={isUpdatingItem}
                      />
                      <Label htmlFor="editIsNew" className="text-sm text-gray-700">✨ Nuevo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editIsSpicy"
                        checked={newItemIsSpicy}
                        onCheckedChange={setNewItemIsSpicy}
                        disabled={isUpdatingItem}
                      />
                      <Label htmlFor="editIsSpicy" className="text-sm text-gray-700">🌶️ Picante</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editIsVegetarian"
                        checked={newItemIsVegetarian}
                        onCheckedChange={setNewItemIsVegetarian}
                        disabled={isUpdatingItem}
                      />
                      <Label htmlFor="editIsVegetarian" className="text-sm text-gray-700">🥗 Vegetariano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editIsVegan"
                        checked={newItemIsVegan}
                        onCheckedChange={setNewItemIsVegan}
                        disabled={isUpdatingItem}
                      />
                      <Label htmlFor="editIsVegan" className="text-sm text-gray-700">🌿 Vegano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="editIsGlutenFree"
                        checked={newItemIsGlutenFree}
                        onCheckedChange={setNewItemIsGlutenFree}
                        disabled={isUpdatingItem}
                      />
                      <Label htmlFor="editIsGlutenFree" className="text-sm text-gray-700">🌾 Sin Gluten</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editItemCategory">Categoría</Label>
                  <Select value={newItemCategory} onValueChange={setNewItemCategory} disabled={isUpdatingItem}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isUpdatingItem}>
                  {isUpdatingItem ? "Actualizando..." : "Actualizar Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Tabs defaultValue={categories.length > 0 ? categories[0]?.id : "empty"} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-auto min-w-full rounded-xl">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="rounded-lg whitespace-nowrap">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                <div className="space-y-4">
                  {getItemsByCategory(category.id).map((item) => (
                    <Card key={item.id} className="rounded-xl">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            {item.description && <CardDescription>{item.description}</CardDescription>}
                            {item.promotion && (
                              <div className="mt-2">
                                <Badge
                                  variant="outline"
                                  className="rounded-lg bg-orange-100 text-orange-800 border-orange-200"
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {item.promotion}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end">
                              {item.promotionPrice ? (
                                <>
                                  <Badge variant="secondary" className="rounded-lg line-through text-xs">
                                    ${item.price.toFixed(2)}
                                  </Badge>
                                  <Badge variant="default" className="rounded-lg bg-green-600">
                                    ${item.promotionPrice.toFixed(2)}
                                  </Badge>
                                </>
                              ) : (
                                <Badge variant="secondary" className="rounded-lg">
                                  ${item.price.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                            <Badge variant={item.isAvailable ? "default" : "secondary"} className="rounded-lg">
                              {item.isAvailable ? t("menuManagement.available") : t("menuManagement.unavailable")}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                                className="rounded-lg p-2"
                              >
                                <Tag className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                className="rounded-lg p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`available-${item.id}`} className="text-sm">
                            {t("menuManagement.available")}
                          </Label>
                          <Switch
                            id={`available-${item.id}`}
                            checked={item.isAvailable}
                            onCheckedChange={() => handleToggleAvailability(item.id, item.isAvailable)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {getItemsByCategory(category.id).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <p>{t("menuManagement.noItemsInCategory")}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}

            <TabsContent value="empty" className="mt-4">
              <div className="text-center text-muted-foreground py-8">
                <p>No hay categorías creadas. Crea una categoría para empezar a agregar items al menú.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
