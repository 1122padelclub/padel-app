"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, Filter, Search, MessageSquare, User, Mail, Phone, Calendar } from "lucide-react"
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { ServiceRating } from "@/src/types"
import { useReviews } from "@/src/hooks/useReviews"
import { useT } from "@/src/hooks/useTranslation"

interface AdminReviewsPanelProps {
  barId: string
}

export function AdminReviewsPanel({ barId }: AdminReviewsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [anonymousFilter, setAnonymousFilter] = useState<string>("all")

  const { reviews, loading, error } = useReviews(barId)
  const t = useT()

  // Filtrar reseñas
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customerData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customerData?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `mesa ${review.tableNumber}`.includes(searchTerm.toLowerCase())

    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    const matchesAnonymous = 
      anonymousFilter === "all" || 
      (anonymousFilter === "anonymous" && review.anonymous) ||
      (anonymousFilter === "with-data" && !review.anonymous)

    return matchesSearch && matchesRating && matchesAnonymous
  })

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
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
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.totalReviews")}</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.averageRating")}</p>
                <p className="text-2xl font-bold">{averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.withData")}</p>
                <p className="text-2xl font-bold">{reviews.filter(r => !r.anonymous).length}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.anonymous")}</p>
                <p className="text-2xl font-bold">{reviews.filter(r => r.anonymous).length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">{t("admin.search")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t("admin.searchReviewsPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label>{t("admin.rating")}</Label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todas las calificaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2)</SelectItem>
                  <SelectItem value="1">⭐ (1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("admin.type")}</Label>
              <Select value={anonymousFilter} onValueChange={setAnonymousFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="with-data">Con datos</SelectItem>
                  <SelectItem value="anonymous">Anónimas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setRatingFilter("all")
                  setAnonymousFilter("all")
                }}
                className="rounded-xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("admin.clear")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reseñas */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>{t("admin.reviews")} ({filteredReviews.length})</CardTitle>
          <CardDescription>
            {t("admin.latestCustomerReviews")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay reseñas que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{t("admin.table")} {review.tableNumber}</Badge>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {review.createdAt.toLocaleDateString()}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm mb-3">{review.comment}</p>
                      )}

                      {!review.anonymous && review.customerData && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {review.customerData.name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {review.customerData.name}
                            </div>
                          )}
                          {review.customerData.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {review.customerData.email}
                            </div>
                          )}
                          {review.customerData.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {review.customerData.phone}
                            </div>
                          )}
                        </div>
                      )}

                      {review.anonymous && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Reseña anónima
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
