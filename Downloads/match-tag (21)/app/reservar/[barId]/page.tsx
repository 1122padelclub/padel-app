"use client"

import { useParams } from "next/navigation"
import { ReservationPageClient } from "@/src/components/ReservationPageClient"

export const dynamic = "force-dynamic"

export default function ReservationPage() {
  const params = useParams()
  const barId = params.barId as string

  if (!barId) {
    return <div className="p-6 text-center">ID de bar no válido</div>
  }

  return <ReservationPageClient barId={barId} />
}