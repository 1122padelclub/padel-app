"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCRMContacts } from "@/src/hooks/useCRMContacts"
import { useReviews } from "@/src/hooks/useReviews"
import { useOrders } from "@/src/hooks/useOrders"
import { useCRM } from "@/src/hooks/useCRM"
import { useThemeConfig } from "@/src/hooks/useThemeConfig"
import type { CRMContact } from "@/src/hooks/useCRMContacts"
import type { ServiceRating } from "@/src/types"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useT } from "@/src/hooks/useTranslation"
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
  ChevronDown,
  FileText,
  Table,
  ShoppingCart,
} from "lucide-react"

interface AdminCRMPanelProps {
  barId: string
}

export function AdminCRMPanelNew({ barId }: AdminCRMPanelProps) {
  const t = useT()
  const { contacts, loading: contactsLoading, error: contactsError } = useCRMContacts(barId)
  const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews(barId)
  const { orders, loading: ordersLoading, error: ordersError } = useOrders(barId)
  const { stats: crmStats } = useCRM(barId)
  const { themeConfig } = useThemeConfig(barId)
  
  const loading = contactsLoading || reviewsLoading || ordersLoading
  const error = contactsError || reviewsError || ordersError
  
  const [searchTerm, setSearchTerm] = useState("")

  // Función para detectar clientes únicos basándose en email o teléfono
  const getUniqueCustomers = (contacts: CRMContact[]) => {
    const uniqueCustomers = new Map<string, CRMContact>()
    
    contacts.forEach(contact => {
      // Usar email como clave principal si existe, sino usar teléfono
      const key = contact.email || contact.phone
      
      if (key && !uniqueCustomers.has(key)) {
        uniqueCustomers.set(key, contact)
      } else if (key && uniqueCustomers.has(key)) {
        // Si ya existe, mantener el que tenga más información (email + teléfono)
        const existing = uniqueCustomers.get(key)!
        if (contact.email && contact.phone && (!existing.email || !existing.phone)) {
          uniqueCustomers.set(key, contact)
        }
      }
    })
    
    return Array.from(uniqueCustomers.values())
  }

  // Calcular estadísticas con clientes únicos
  const uniqueCustomers = getUniqueCustomers(contacts)
  const totalCustomers = uniqueCustomers.length
  
  const newThisMonth = uniqueCustomers.filter(contact => {
    const contactDate = new Date(contact.createdAt)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return contactDate >= startOfMonth
  }).length
  
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  // Calcular ticket promedio basado en pedidos reales
  const averageTicket = orders.length > 0 
    ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length
    : 0

  // Obtener configuración de moneda
  const currency = themeConfig?.i18n?.currency || "EUR"
  const priceFormat = themeConfig?.i18n?.priceFormat || "€{amount}"
  
  // Calcular gasto promedio por persona
  const averageSpentPerPerson = crmStats?.averageSpentPerCustomer || 0
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    if (currency === "COP") {
      return `$${amount.toLocaleString('es-CO')}`
    } else if (currency === "USD") {
      return `$${amount.toFixed(2)}`
    } else {
      return `$${amount.toFixed(2)}`
    }
  }

  // Funciones de exportación
  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = convertToCSV(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${filename}.csv`)
  }

  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `${filename}.xlsx`)
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  const handleExport = (format: 'csv' | 'excel') => {
    console.log('🚀 Iniciando exportación:', format)
    console.log('📊 Contactos disponibles:', contacts.length)
    console.log('⭐ Reseñas disponibles:', reviews.length)
    
    try {
      const timestamp = new Date().toISOString().split('T')[0]
      
      // Exportar clientes
      const customersData = filteredContacts.map(contact => ({
        'Nombre': contact.name,
        'Email': contact.email,
        'Teléfono': contact.phone,
        'Fuente': contact.source,
        'Mesa': contact.tableNumber || 'N/A',
        'Calificación': contact.rating || 'N/A',
        'Comentario': contact.comment || '',
        'Pedido ID': contact.orderId || 'N/A',
        'Resumen Pedido': contact.orderSummary || '',
        'Fecha Creación': new Date(contact.createdAt).toLocaleDateString('es-ES'),
        'Última Actualización': new Date(contact.updatedAt).toLocaleDateString('es-ES')
      }))

      console.log('👥 Datos de clientes preparados:', customersData.length)

      // Exportar reseñas
      const reviewsData = reviews.map(review => ({
        'ID': review.id,
        'Cliente': review.customerName || 'Anónimo',
        'Calificación': review.rating,
        'Comentario': review.comment || '',
        'Fecha': new Date(review.createdAt).toLocaleDateString('es-ES'),
        'Hora': new Date(review.createdAt).toLocaleTimeString('es-ES')
      }))

      console.log('⭐ Datos de reseñas preparados:', reviewsData.length)

      if (format === 'csv') {
        console.log('📄 Exportando como CSV...')
        exportToCSV(customersData, `clientes_crm_${timestamp}`)
        if (reviewsData.length > 0) {
          setTimeout(() => {
            exportToCSV(reviewsData, `reseñas_crm_${timestamp}`)
          }, 500)
        }
      } else {
        console.log('📊 Exportando como Excel...')
        exportToExcel(customersData, `clientes_crm_${timestamp}`)
        if (reviewsData.length > 0) {
          setTimeout(() => {
            exportToExcel(reviewsData, `reseñas_crm_${timestamp}`)
          }, 500)
        }
      }
      
      console.log('✅ Exportación completada')
    } catch (error) {
      console.error('❌ Error en exportación:', error)
    }
  }

  const filteredContacts = uniqueCustomers.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `mesa ${review.tableNumber}`.includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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
        <CardContent className="p-6 text-center text-red-500">
          Error cargando CRM: {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("admin.totalCustomers")}</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("admin.newThisMonth")}</p>
                <p className="text-2xl font-bold">{newThisMonth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("admin.averageReviews")}</p>
                <p className="text-2xl font-bold">{averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("admin.averageTicket")}</p>
                <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
              </div>
              {currency === "COP" ? (
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  $
                </div>
              ) : currency === "USD" ? (
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  $
                </div>
              ) : (
                <ShoppingCart className="h-8 w-8 text-purple-500" />
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Gestión CRM */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>{t("admin.crmManagement")}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="rounded-xl"
                onClick={() => handleExport('csv')}
              >
                <FileText className="h-4 w-4 mr-2" />
                {t("admin.exportCSV")}
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl"
                onClick={() => handleExport('excel')}
              >
                <Table className="h-4 w-4 mr-2" />
                {t("admin.exportExcel")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl mb-6">
              <TabsTrigger value="customers">{t("admin.customers")}</TabsTrigger>
              <TabsTrigger value="reviews">{t("admin.reviews")}</TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("common.search")}
                    className="pl-9 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t("common.filter")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    <SelectItem value="new">Nuevos</SelectItem>
                    <SelectItem value="with-rating">Con calificación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? t("common.noResults") : t("admin.noCustomers")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContacts.map((contact) => (
                    <Card key={contact.id} className="rounded-xl bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium">{contact.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {contact.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {contact.email}
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {contact.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(contact.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="rounded-full mb-2">
                              {contact.source}
                            </Badge>
                            <div className="space-y-1">
                              {contact.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span className="text-sm">{contact.rating}/5</span>
                                </div>
                              )}
                              {contact.source === "order" && contact.orderSummary && (
                                <div className="text-xs text-muted-foreground">
                                  Pedido: {contact.orderSummary}
                                </div>
                              )}
                              {contact.totalAmount && (
                                <div className="text-xs text-green-500 font-medium">
                                  Total: ${contact.totalAmount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {contact.comment && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg">
                            <p className="text-sm text-muted-foreground">"{contact.comment}"</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("common.search")}
                    className="pl-9 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? t("common.noResults") : t("admin.noReviews")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review.id} className="rounded-xl bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                              Mesa {review.tableNumber}
                            </span>
                          </div>
                          <Badge variant={review.anonymous ? "secondary" : "default"} className="rounded-full">
                            {review.anonymous ? t("chat.anonymous") : t("common.identified")}
                          </Badge>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground mb-2">"{review.comment}"</p>
                        )}
                        <p className="text-xs text-gray-500 text-right">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
