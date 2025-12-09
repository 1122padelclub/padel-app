"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"

export interface CRMContact {
  id: string
  name: string
  email: string
  phone: string
  source: string
  tableNumber?: number | string
  rating?: number
  comment?: string
  // Campos específicos de pedidos
  orderId?: string
  orderSummary?: string
  totalAmount?: number
  accountType?: string
  createdAt: Date
  updatedAt: Date
}

export function useCRMContacts(barId: string) {
  const [contacts, setContacts] = useState<CRMContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    console.log("📊 Cargando contactos CRM para barId:", barId)

    const contactsRef = collection(db, "bars", barId, "crm_contacts")
    const q = query(contactsRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const contactsData: CRMContact[] = []
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          contactsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as CRMContact)
        })

        console.log("📊 Contactos CRM cargados:", contactsData.length)
        setContacts(contactsData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("❌ Error cargando contactos CRM:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  const addContact = async (contactData: Omit<CRMContact, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("📝 Agregando contacto CRM:", contactData)
      
      const contactsRef = collection(db, "bars", barId, "crm_contacts")
      const docRef = await addDoc(contactsRef, {
        ...contactData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      console.log("✅ Contacto CRM agregado con ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("❌ Error agregando contacto CRM:", error)
      throw error
    }
  }

  return { contacts, loading, error, addContact }
}
