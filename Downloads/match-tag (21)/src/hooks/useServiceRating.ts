"use client"

import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { ServiceRating } from "@/src/types"
import { useCRMContacts } from "./useCRMContacts"

export function useServiceRating() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitRating = async (ratingData: Omit<ServiceRating, "id" | "updatedAt">) => {
    try {
      setSubmitting(true)
      setError(null)
      
      console.log("📝 Enviando calificación:", ratingData)
      
      // Agregar a la colección de reseñas
      const reviewsRef = collection(db, "bars", ratingData.barId, "reviews")
      const { createdAt, ...ratingDataWithoutTimestamp } = ratingData
      const reviewDoc = await addDoc(reviewsRef, {
        ...ratingDataWithoutTimestamp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      console.log("✅ Reseña guardada con ID:", reviewDoc.id)

      // Si no es anónimo y tiene datos de contacto, agregar al CRM
      console.log("🔍 Verificando datos para CRM:", {
        anonymous: ratingData.anonymous,
        customerData: ratingData.customerData
      })
      
      if (!ratingData.anonymous && ratingData.customerData) {
        const { name, email, phone } = ratingData.customerData
        
        console.log("🔍 Datos del cliente:", { name, email, phone })
        
        // Solo agregar al CRM si tiene al menos un dato de contacto
        if (name || email || phone) {
          console.log("📝 Agregando contacto al CRM...")
          
          try {
            const crmRef = collection(db, "bars", ratingData.barId, "crm_contacts")
            const crmData = {
              name: name || "Cliente",
              email: email || "",
              phone: phone || "",
              source: "service_rating",
              tableNumber: ratingData.tableNumber,
              rating: ratingData.rating,
              comment: ratingData.comment || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
            
            console.log("📝 Datos CRM a guardar:", crmData)
            
            const crmDoc = await addDoc(crmRef, crmData)
            
            console.log("✅ Contacto agregado al CRM con ID:", crmDoc.id)
          } catch (crmError) {
            console.error("❌ Error específico al guardar en CRM:", crmError)
          }
        } else {
          console.log("⚠️ No hay datos de contacto suficientes para CRM")
        }
      } else {
        console.log("⚠️ No se agrega al CRM - anónimo o sin datos de cliente")
      }

      return reviewDoc.id
      
    } catch (err: any) {
      console.error("❌ Error enviando calificación:", err)
      setError(err.message || "Error desconocido al enviar la calificación")
      return null
    } finally {
      setSubmitting(false)
    }
  }

  return { submitRating, submitting, error }
}