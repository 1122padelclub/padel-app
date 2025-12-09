"use client"

import { useState, useEffect } from "react"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  increment,
} from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import type { Customer, Review, CustomerStats } from "@/src/types/crm"

export function useCRM(barId?: string) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setIsLoading(false)
      return
    }

    const setupListeners = async () => {
      try {
        // Listen to customers
        const customersQuery = query(collection(db, `bars/${barId}/customers`), orderBy("lastVisitAt", "desc"))

        const unsubscribeCustomers = onSnapshot(
          customersQuery,
          (snapshot) => {
            const customersList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Customer[]

            setCustomers(customersList)
            calculateStats(customersList)
            setError(null)
          },
          (err) => {
            console.error("Error loading customers:", err)
            if (err.code === "permission-denied") {
              console.warn("Permisos insuficientes para customers, continuando sin datos de CRM")
              setCustomers([])
              setError(null) // No mostrar error al usuario, solo log interno
            } else {
              setError(err.message)
            }
          },
        )

        // Listen to reviews
        const reviewsQuery = query(collection(db, `bars/${barId}/reviews`), orderBy("createdAt", "desc"))

        const unsubscribeReviews = onSnapshot(
          reviewsQuery,
          (snapshot) => {
            const reviewsList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Review[]

            setReviews(reviewsList)
            setIsLoading(false)
            setError(null)
          },
          (err) => {
            console.error("Error loading reviews:", err)
            if (err.code === "permission-denied") {
              console.warn("Permisos insuficientes para reviews, continuando sin datos de reseñas")
              setReviews([])
              setError(null) // No mostrar error al usuario, solo log interno
            } else {
              setError(err.message)
            }
            setIsLoading(false)
          },
        )

        return () => {
          unsubscribeCustomers()
          unsubscribeReviews()
        }
      } catch (err) {
        console.error("Error setting up listeners:", err)
        setError("Error al configurar la conexión con la base de datos")
        setIsLoading(false)
      }
    }

    const cleanup = setupListeners()

    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.())
    }
  }, [barId])

  const calculateStats = (customersList: Customer[]) => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const newCustomersThisMonth = customersList.filter((c) => new Date(c.firstVisitAt) >= thisMonth).length

    const returningCustomers = customersList.filter((c) => c.visitsCount > 1).length

    const totalSpent = customersList.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalVisits = customersList.reduce((sum, c) => sum + c.visitsCount, 0)

    const topSpenders = [...customersList].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)

    const frequentVisitors = [...customersList].sort((a, b) => b.visitsCount - a.visitsCount).slice(0, 5)

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews : 0

    const ratingDistribution = reviews.reduce(
      (acc, review) => {
        acc[review.stars] = (acc[review.stars] || 0) + 1
        return acc
      },
      {} as { [key: number]: number },
    )

    setStats({
      totalCustomers: customersList.length,
      newCustomersThisMonth,
      returningCustomers,
      averageVisitsPerCustomer: customersList.length > 0 ? totalVisits / customersList.length : 0,
      averageSpentPerCustomer: customersList.length > 0 ? totalSpent / customersList.length : 0,
      topSpenders,
      frequentVisitors,
      averageRating,
      totalReviews,
      ratingDistribution,
    })
  }

  const createOrUpdateCustomer = async (customerData: Partial<Customer>) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      // Check if customer exists by phone
      if (customerData.phone) {
        const existingQuery = query(collection(db, `bars/${barId}/customers`), where("phone", "==", customerData.phone))
        const existingDocs = await getDocs(existingQuery)

        if (!existingDocs.empty) {
          // Update existing customer
          const existingDoc = existingDocs.docs[0]
          const existingData = existingDoc.data() as Customer

          const updatedData = {
            ...existingData,
            ...customerData,
            visitsCount: increment(1),
            lastVisitAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          await updateDoc(existingDoc.ref, updatedData)
          return existingDoc.id
        }
      }

      // Create new customer
      const newCustomer = {
        ...customerData,
        barId,
        visitsCount: 1,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteItems: [],
        tags: [],
        firstVisitAt: new Date().toISOString(),
        lastVisitAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, `bars/${barId}/customers`), newCustomer)
      return docRef.id
    } catch (err) {
      console.error("Error creating/updating customer:", err)
      throw err
    }
  }

  const createReview = async (reviewData: Omit<Review, "id" | "barId" | "createdAt" | "updatedAt">) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const newReview = {
        ...reviewData,
        barId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, `bars/${barId}/reviews`), newReview)
      return docRef.id
    } catch (err) {
      console.error("Error creating review:", err)
      throw err
    }
  }

  const respondToReview = async (reviewId: string, response: string, respondedBy: string) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const reviewRef = doc(db, `bars/${barId}/reviews/${reviewId}`)
      await updateDoc(reviewRef, {
        response: {
          message: response,
          respondedAt: new Date().toISOString(),
          respondedBy,
        },
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Error responding to review:", err)
      throw err
    }
  }

  const updateCustomerTags = async (customerId: string, tags: string[]) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const customerRef = doc(db, `bars/${barId}/customers/${customerId}`)
      await updateDoc(customerRef, {
        tags,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Error updating customer tags:", err)
      throw err
    }
  }

  const exportCustomersCSV = () => {
    const headers = [
      "Nombre",
      "Teléfono",
      "Email",
      "Visitas",
      "Total Gastado",
      "Promedio por Pedido",
      "Primera Visita",
      "Última Visita",
      "Etiquetas",
    ]

    const rows = customers.map((customer) => [
      customer.name,
      customer.phone,
      customer.email || "",
      customer.visitsCount.toString(),
      customer.totalSpent.toFixed(2),
      customer.averageOrderValue.toFixed(2),
      new Date(customer.firstVisitAt).toLocaleDateString(),
      new Date(customer.lastVisitAt).toLocaleDateString(),
      customer.tags.join(", "),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `customers-${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return {
    customers,
    reviews,
    stats,
    isLoading,
    error,
    createOrUpdateCustomer,
    createReview,
    respondToReview,
    updateCustomerTags,
    exportCustomersCSV,
  }
}
