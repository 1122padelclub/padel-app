"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Star, CheckCircle, X } from "lucide-react"
import { useServiceRating } from "@/src/hooks/useServiceRating"
import { useT } from "@/src/hooks/useTranslation"
import { useTableT } from "@/src/hooks/useTableTranslation"
import type { ServiceRating } from "@/src/types"

interface ServiceRatingFormProps {
  tableId: string
  barId: string
  tableNumber: number | string
  onClose: () => void
}

export function ServiceRatingForm({ tableId, barId, tableNumber, onClose }: ServiceRatingFormProps) {
  const t = useT()
  const tableT = useTableT()
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState("")
  const [anonymous, setAnonymous] = useState(true)
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [submitted, setSubmitted] = useState(false)
  
  const { submitRating, submitting, error } = useServiceRating()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    try {
      const ratingData: Omit<ServiceRating, "id" | "updatedAt"> = {
        barId,
        tableId,
        tableNumber,
        rating,
        comment: comment.trim(),
        anonymous,
        customerData: anonymous ? undefined : (customerData.name || customerData.email || customerData.phone ? customerData : undefined),
        createdAt: new Date(),
      }
      
      console.log("📝 Enviando calificación:", ratingData)
      
      const result = await submitRating(ratingData)
      
      if (result) {
        console.log("✅ Calificación enviada exitosamente:", result)
        setSubmitted(true)
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        alert("Error al enviar la calificación. Por favor, intenta de nuevo.")
      }
      
    } catch (error) {
      console.error("❌ Error submitting rating:", error)
      alert("Error al enviar la calificación. Por favor, intenta de nuevo.")
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("table.thanksForRating")}</h3>
            <p className="text-muted-foreground">
              {t("table.yourOpinionHelpsUsImprove")}
            </p>
            <Button 
              onClick={onClose}
              className="mt-4 rounded-xl"
            >
              {t("common.close")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg rounded-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-serif">{tableT.t("table.rateService")}</CardTitle>
          <CardDescription>
            {tableT.t("table.table")} {tableNumber} - {tableT.t("table.yourOpinionMatters")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Stars */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{tableT.t("rating.howWouldYouRateOurService")}</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-colors hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating === 0 ? tableT.t("rating.selectRating") : `${rating}/5`}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">{tableT.t("table.comments")} ({tableT.t("common.optional")})</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={tableT.t("rating.tellUsAboutYourExperience")}
                className="rounded-xl min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/500 {tableT.t("rating.characters")}
              </p>
            </div>

            {/* Anonymous or with data */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{tableT.t("rating.howDoYouWantToSendYourRating")}</Label>
              <RadioGroup value={anonymous ? "anonymous" : "with-data"} onValueChange={(value) => setAnonymous(value === "anonymous")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anonymous" id="anonymous" />
                  <Label htmlFor="anonymous">{tableT.t("rating.anonymously")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="with-data" id="with-data" />
                  <Label htmlFor="with-data">{tableT.t("rating.leavingMyContactData")}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Customer Data (if not anonymous) */}
            {!anonymous && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
                <h4 className="font-medium">{t("table.contactData")}</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">{t("common.name")} ({t("common.optional")})</Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t("table.yourName")}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("common.email")} ({t("common.optional")})</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t("table.yourEmail")}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("common.phone")} ({t("common.optional")})</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={t("table.yourPhone")}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl"
                disabled={submitting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl"
                disabled={rating === 0 || submitting}
              >
                {submitting ? t("common.sending") : t("table.sendRating")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
