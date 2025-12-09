"use client"

import { useEffect, useState } from "react"
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth"
import { getAuthInstance } from "@/lib/firebase"

export function useTableAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const authInstance = getAuthInstance()
    if (!authInstance) {
      console.error("[v0] Auth instance not available")
      setError("Auth not available")
      setLoading(false)
      setIsAuthenticated(false)
      setUser(null)
      return
    }

    // Verificar si ya hay un usuario autenticado
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("[v0] User already authenticated:", firebaseUser.uid)
        setUser(firebaseUser)
        setIsAuthenticated(true)
        setError(null)
        setLoading(false)
      } else {
        // Si no hay usuario, intentar autenticación anónima
        try {
          console.log("[v0] No user found, attempting anonymous auth...")
          const result = await signInAnonymously(authInstance)
          setUser(result.user)
          setIsAuthenticated(true)
          setError(null)
          console.log("[v0] Anonymous authentication successful")
        } catch (error) {
          console.error("[v0] Anonymous authentication failed:", error)
          setError("Failed to authenticate")
          setUser(null)
          setIsAuthenticated(false)
          setLoading(false)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  return {
    isAuthenticated,
    loading,
    error,
    user,
  }
}
