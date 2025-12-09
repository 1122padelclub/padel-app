"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Review } from "@/src/types"

export function useReviews(barId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const reviewsRef = collection(db, "bars", barId, "reviews")
    const q = query(
      reviewsRef,
      orderBy("createdAt", "desc"),
      limit(1000) // Limitar para performance
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const reviewsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
            responseDate: doc.data().responseDate?.toDate?.() || (doc.data().responseDate ? new Date(doc.data().responseDate) : null)
          })) as Review[]

          setReviews(reviewsData)
          setError(null)
        } catch (err: any) {
          console.error("Error processing reviews:", err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error("Error loading reviews:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [barId])

  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      // Esta función se implementaría si necesitas agregar reseñas desde el admin
      console.log("Add review functionality would be implemented here")
    } catch (err: any) {
      console.error("Error adding review:", err)
      throw err
    }
  }

  const updateReview = async (reviewId: string, updates: Partial<Review>) => {
    try {
      // Esta función se implementaría si necesitas actualizar reseñas desde el admin
      console.log("Update review functionality would be implemented here")
    } catch (err: any) {
      console.error("Error updating review:", err)
      throw err
    }
  }

  return {
    reviews,
    loading,
    error,
    addReview,
    updateReview
  }
}