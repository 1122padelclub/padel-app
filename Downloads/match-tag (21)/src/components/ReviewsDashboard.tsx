"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Star, Download, TrendingUp, Users, MessageSquare } from "lucide-react"
import { exportReviewsToExcel } from "@/src/utils/crmExports"
import type { Review } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface ReviewsDashboardProps {
  reviews: Review[]
  loading: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function ReviewsDashboard({ reviews, loading }: ReviewsDashboardProps) {
  const t = useT()
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all")
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all")

  const filteredReviews = useMemo(() => {
    let filtered = reviews

    // Filtrar por tiempo
    if (timeFilter !== "all") {
      const now = new Date()
      const cutoff = new Date()
      
      if (timeFilter === "week") {
        cutoff.setDate(now.getDate() - 7)
      } else if (timeFilter === "month") {
        cutoff.setMonth(now.getMonth() - 1)
      }
      
      filtered = filtered.filter(review => new Date(review.createdAt) >= cutoff)
    }

    // Filtrar por calificación
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter))
    }

    return filtered
  }, [reviews, timeFilter, ratingFilter])

  const stats = useMemo(() => {
    if (filteredReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        npsScore: 0,
        ratingDistribution: [],
        recentReviews: [],
        responseRate: 0
      }
    }

    const totalReviews = filteredReviews.length
    const averageRating = filteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    
    const promoters = filteredReviews.filter(r => r.rating >= 4).length
    const detractors = filteredReviews.filter(r => r.rating <= 2).length
    const npsScore = ((promoters - detractors) / totalReviews) * 100

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating: rating.toString(),
      count: filteredReviews.filter(r => r.rating === rating).length,
      percentage: ((filteredReviews.filter(r => r.rating === rating).length / totalReviews) * 100).toFixed(1)
    }))

    const recentReviews = filteredReviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    const respondedReviews = filteredReviews.filter(r => r.response).length
    const responseRate = (respondedReviews / totalReviews) * 100

    return {
      totalReviews,
      averageRating,
      npsScore,
      ratingDistribution,
      recentReviews,
      responseRate
    }
  }, [filteredReviews])

  const handleExport = () => {
    exportReviewsToExcel(filteredReviews, `reviews_${timeFilter}_${ratingFilter}`)
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
      {/* Header con filtros y exportación */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-serif flex items-center gap-2">
                <Star className="h-5 w-5" />
                {t("admin.reviewsDashboard")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("admin.detailedReviewsAndCustomerSatisfactionAnalysis")}
              </p>
            </div>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
{t("admin.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin.period")}</label>
              <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.all")}</SelectItem>
                  <SelectItem value="week">{t("admin.lastWeek")}</SelectItem>
                  <SelectItem value="month">{t("admin.lastMonth")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin.rating")}</label>
              <Select value={ratingFilter} onValueChange={(value: any) => setRatingFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.all")}</SelectItem>
                  <SelectItem value="5">5 {t("admin.stars")}</SelectItem>
                  <SelectItem value="4">4 {t("admin.stars")}</SelectItem>
                  <SelectItem value="3">3 {t("admin.stars")}</SelectItem>
                  <SelectItem value="2">2 {t("admin.stars")}</SelectItem>
                  <SelectItem value="1">1 {t("admin.star")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.totalReviews")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">{t("admin.inSelectedPeriod")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Star className="h-4 w-4" />
              {t("admin.averageRating")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(stats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              NPS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.npsScore >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.npsScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.npsScore >= 50 ? "Excelente" : stats.npsScore >= 0 ? "Bueno" : "Necesita mejora"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {t("admin.responseRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{t("admin.reviewsResponded")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-xl">
          <TabsTrigger value="distribution">{t("admin.distribution")}</TabsTrigger>
          <TabsTrigger value="recent">{t("admin.recent")}</TabsTrigger>
          <TabsTrigger value="analysis">{t("admin.analysis")}</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">{t("admin.ratingDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} reseñas`, "Cantidad"]} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-serif">Proporción de Calificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.ratingDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ rating, percentage }) => `${rating}★: ${percentage}%`}
                    >
                      {stats.ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} reseñas`, "Cantidad"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">Reseñas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="outline">{review.rating} estrellas</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm mb-2">{review.comment}</p>
                    )}
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{review.customerName || 'Anónimo'}</span>
                      {review.response && (
                        <Badge variant="secondary" className="text-xs">
                          Respondida
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">Análisis Detallado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Promotores (4-5 estrellas)</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.ratingDistribution.filter(r => parseInt(r.rating) >= 4).reduce((sum, r) => sum + r.count, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Clientes satisfechos</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Detractores (1-2 estrellas)</h4>
                    <div className="text-2xl font-bold text-red-600">
                      {stats.ratingDistribution.filter(r => parseInt(r.rating) <= 2).reduce((sum, r) => sum + r.count, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Clientes insatisfechos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
