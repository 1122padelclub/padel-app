"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, Users } from "@/src/components/icons/Icons"
import { useT } from "@/src/hooks/useTranslation"
import { useTableT } from "@/src/hooks/useTableTranslation"

interface CustomerInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (customerInfo: CustomerInfo) => void
  tableNumber: number
}

export interface CustomerInfo {
  name: string
  phone?: string
  accountType: "shared" | "individual"
}

export function CustomerInfoModal({ isOpen, onClose, onConfirm, tableNumber }: CustomerInfoModalProps) {
  const t = useT()
  const tableT = useTableT()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [accountType, setAccountType] = useState<"shared" | "individual">("shared")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)

    const customerInfo: CustomerInfo = {
      name: name.trim(),
      phone: phone.trim() || "", // Always provide empty string instead of undefined
      accountType,
    }

    onConfirm(customerInfo)

    // Reset form
    setName("")
    setPhone("")
    setAccountType("shared")
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setName("")
    setPhone("")
    setAccountType("shared")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-md"
        style={{
          backgroundColor: "var(--mt-surface)",
          borderColor: "var(--mt-secondary)",
          color: "var(--mt-text)",
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-xl font-bold text-center"
            style={{ color: "var(--mt-text)" }}
          >
            {tableT.t("customer.customerInformation")} - {tableT.t("table.table")} {tableNumber}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium" style={{ color: "var(--mt-text)" }}>
                {tableT.t("customer.name")} *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tableT.t("customer.customerNamePlaceholder")}
                className=""
                style={{
                  backgroundColor: "var(--mt-surface)",
                  borderColor: "var(--mt-secondary)",
                  color: "var(--mt-text)",
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium" style={{ color: "var(--mt-text)" }}>
                {tableT.t("customer.phone")} ({tableT.t("common.optional")})
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={tableT.t("customer.phoneNumberPlaceholder")}
                className=""
                style={{
                  backgroundColor: "var(--mt-surface)",
                  borderColor: "var(--mt-secondary)",
                  color: "var(--mt-text)",
                }}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block" style={{ color: "var(--mt-text)" }}>Tipo de Cuenta</Label>
              <RadioGroup
                value={accountType}
                onValueChange={(value: "shared" | "individual") => setAccountType(value)}
                className="space-y-3"
              >
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: "var(--mt-surface)",
                    borderColor: "var(--mt-secondary)",
                  }}
                >
                  <RadioGroupItem value="shared" id="shared" />
                  <Label htmlFor="shared" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Users className="h-5 w-5" style={{ color: "var(--mt-primary)" }} />
                    <div>
                      <div className="font-medium" style={{ color: "var(--mt-text)" }}>{tableT.t("customer.sharedAccount")}</div>
                      <div className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>{tableT.t("customer.sharedAccountDescription")}</div>
                    </div>
                  </Label>
                </div>

                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: "var(--mt-surface)",
                    borderColor: "var(--mt-secondary)",
                  }}
                >
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer flex-1">
                    <User className="h-5 w-5" style={{ color: "var(--mt-primary)" }} />
                    <div>
                      <div className="font-medium" style={{ color: "var(--mt-text)" }}>{tableT.t("customer.individualAccount")}</div>
                      <div className="text-sm" style={{ color: "var(--mt-text)", opacity: 0.7 }}>{tableT.t("customer.individualAccountDescription")}</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              style={{
                backgroundColor: "transparent",
                borderColor: "var(--mt-secondary)",
                color: "var(--mt-text)",
              }}
            >
              {tableT.t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1"
              style={{
                backgroundColor: "var(--mt-primary)",
                color: "var(--mt-text)",
              }}
            >
              {isSubmitting ? tableT.t("common.loading") : tableT.t("common.next")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
