"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCRMContacts } from "@/src/hooks/useCRMContacts"
import { useReviews } from "@/src/hooks/useReviews"
import type { CRMContact } from "@/src/hooks/useCRMContacts"
import type { ServiceRating } from "@/src/types"
import {
  Users,
  Star,
  TrendingUp,
  Download,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Euro,
  MessageSquare,
  Reply,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Textarea } from "@/components/ui/textarea"
import { useT } from "@/src/hooks/useTranslation"

interface AdminCRMPanelProps {
  barId: string
}

export function AdminCRMPanel({ barId }: AdminCRMPanelProps) {
  const t = useT()
  const { contacts, loading: contactsLoading, error: contactsError } = useCRMContacts(barId)
  const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews(barId)
  
  const loading = contactsLoading || reviewsLoading
  const error = contactsError || reviewsError
  
  const [searchTerm, setSearchTerm] = useState("")
  const [customerFilter, setCustomerFilter] = useState<"all" | "vip" | "regular" | "new">("all")
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all")

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      customerFilter === "all" ||
      (customerFilter === "vip" && customer.tags.includes("VIP")) ||
      (customerFilter === "regular" && customer.visitsCount >= 5) ||
      (customerFilter === "new" && customer.visitsCount === 1)

    return matchesSearch && matchesFilter
  })

  const filteredReviews = reviews.filter((review) => {
    return reviewFilter === "all" || review.stars.toString() === reviewFilter
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t("common.loading")}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.totalCustomers")}</p>
                <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.newThisMonth")}</p>
                <p className="text-2xl font-bold text-success">{stats?.newCustomersThisMonth || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.averageReviews")}</p>
                <p className="text-2xl font-bold text-warning">{(stats?.averageRating || 0).toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main CRM Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t("admin.crmManagement")}
            </span>
            <Button onClick={exportCustomersCSV} variant="outline" size="sm" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              {t("admin.exportCSV")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customers">{t("admin.customers")}</TabsTrigger>
              <TabsTrigger value="reviews">{t("admin.reviews")}</TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="space-y-4">
              {/* Customer Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={customerFilter} onValueChange={(value: any) => setCustomerFilter(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="regular">Regulares (5+ visitas)</SelectItem>
                    <SelectItem value="new">Nuevos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customers List */}
              <div className="space-y-4">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron clientes con los filtros aplicados
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <CustomerCard key={customer.id} customer={customer} onUpdateTags={updateCustomerTags} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {/* Review Filters */}
              <div className="flex gap-4">
                <Select value={reviewFilter} onValueChange={(value: any) => setReviewFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <Star className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las reseñas</SelectItem>
                    <SelectItem value="5">5 estrellas</SelectItem>
                    <SelectItem value="4">4 estrellas</SelectItem>
                    <SelectItem value="3">3 estrellas</SelectItem>
                    <SelectItem value="2">2 estrellas</SelectItem>
                    <SelectItem value="1">1 estrella</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron reseñas con los filtros aplicados
                  </div>
                ) : (
                  filteredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} onRespond={respondToReview} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function CustomerCard({
  customer,
  onUpdateTags,
}: {
  customer: Customer
  onUpdateTags: (customerId: string, tags: string[]) => void
}) {
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (newTag.trim() && !customer.tags.includes(newTag.trim())) {
      onUpdateTags(customer.id, [...customer.tags, newTag.trim()])
      setNewTag("")
      setIsEditingTags(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(
      customer.id,
      customer.tags.filter((tag) => tag !== tagToRemove),
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Customer Header */}
            <div className="flex items-center gap-4 flex-wrap">
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <div className="flex gap-2">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
                {isEditingTags ? (
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder={t("admin.newTag")}
                      className="w-32 h-6 text-xs"
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button size="sm" onClick={handleAddTag} className="h-6 px-2 text-xs">
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingTags(true)}
                    className="h-6 px-2 text-xs bg-transparent"
                  >
                    + {t("admin.addTag")}
                  </Button>
                )}
              </div>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{customer.visitsCount} visitas</span>
              </div>

              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <span>€{customer.totalSpent.toFixed(2)} total</span>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span>€{customer.averageOrderValue.toFixed(2)} promedio</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{format(new Date(customer.lastVisitAt), "dd/MM/yyyy", { locale: es })}</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>

              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="text-sm">
                <span className="font-medium">Notas: </span>
                <span className="text-muted-foreground">{customer.notes}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewCard({
  review,
  onRespond,
}: { review: Review; onRespond: (id: string, response: string, by: string) => void }) {
  const [isResponding, setIsResponding] = useState(false)
  const [responseText, setResponseText] = useState("")

  const handleSubmitResponse = () => {
    if (responseText.trim()) {
      onRespond(review.id, responseText.trim(), "Admin") // In real app, use actual admin name
      setResponseText("")
      setIsResponding(false)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Review Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {renderStars(review.stars)}
                <span className="text-sm text-muted-foreground">
                  {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </span>
                {review.isPublic && <Badge variant="secondary">Pública</Badge>}
              </div>

              {!review.isAnonymous && review.customerName && <p className="font-medium">{review.customerName}</p>}
            </div>

            {!review.response && (
              <Button variant="outline" size="sm" onClick={() => setIsResponding(true)} className="bg-transparent">
                <Reply className="w-4 h-4 mr-2" />
                {t("admin.respond")}
              </Button>
            )}
          </div>

          {/* Category Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Comida: </span>
              {renderStars(review.categories.food)}
            </div>
            <div>
              <span className="text-muted-foreground">Servicio: </span>
              {renderStars(review.categories.service)}
            </div>
            <div>
              <span className="text-muted-foreground">Ambiente: </span>
              {renderStars(review.categories.ambiance)}
            </div>
            <div>
              <span className="text-muted-foreground">Valor: </span>
              {renderStars(review.categories.value)}
            </div>
          </div>

          {/* Review Comment */}
          {review.comment && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{review.comment}</p>
              </div>
            </div>
          )}

          {/* Existing Response */}
          {review.response && (
            <div className="bg-primary/10 p-3 rounded-lg border-l-4 border-primary">
              <div className="flex items-start gap-2">
                <Reply className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{review.response.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Respondido por {review.response.respondedBy} el{" "}
                    {format(new Date(review.response.respondedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Response Form */}
          {isResponding && (
            <div className="space-y-3 border-t pt-4">
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitResponse} size="sm">
                  Enviar Respuesta
                </Button>
                <Button variant="outline" onClick={() => setIsResponding(false)} size="sm" className="bg-transparent">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
