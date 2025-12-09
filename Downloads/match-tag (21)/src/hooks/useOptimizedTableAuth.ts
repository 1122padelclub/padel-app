"use client"

import { useEffect, useState, useRef } from "react"
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth"
import { getAuthInstance } from "@/lib/firebase"
import { retryWithBackoff } from "@/src/utils/rateLimitHandler"

export function useOptimizedTableAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const authAttempted = useRef(false)
  const lastAuthTime = useRef(0)

  useEffect(() => {
    const authInstance = getAuthInstance()
    if (!authInstance) {
      console.error("[OptimizedAuth] Auth instance not available")
      setError("Auth not available")
      setLoading(false)
      setIsAuthenticated(false)
      setUser(null)
      return
    }

    // Evitar múltiples intentos de autenticación simultáneos
    if (authAttempted.current) {
      return
    }

    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("[OptimizedAuth] User already authenticated:", firebaseUser.uid)
        setUser(firebaseUser)
        setIsAuthenticated(true)
        setError(null)
        setLoading(false)
        setRetryCount(0)
      } else if (!authAttempted.current) {
        authAttempted.current = true
        
        // Verificar si han pasado al menos 2 segundos desde el último intento
        const now = Date.now()
        if (now - lastAuthTime.current < 2000) {
          console.log("[OptimizedAuth] Too soon for another auth attempt, waiting...")
          setTimeout(() => {
            authAttempted.current = false
          }, 2000 - (now - lastAuthTime.current))
          return
        }
        
        lastAuthTime.current = now

        try {
          console.log("[OptimizedAuth] Attempting anonymous authentication...")
          
          // Usar retry con backoff para manejar rate limits
          const result = await retryWithBackoff(
            () => signInAnonymously(authInstance),
            2, // máximo 2 reintentos
            1000 // delay base de 1 segundo
          )
          
          setUser(result.user)
          setIsAuthenticated(true)
          setError(null)
          setRetryCount(0)
          console.log("[OptimizedAuth] Anonymous authentication successful")
        } catch (error: any) {
          console.error("[OptimizedAuth] Authentication failed:", error)
          
          // Manejar rate limit específicamente
          if (error?.error === "Rate limit exceeded") {
            setError("Demasiadas solicitudes. Por favor, espera un momento antes de intentar nuevamente.")
            setRetryCount(prev => prev + 1)
          } else {
            setError("Error de autenticación. Por favor, intenta nuevamente.")
          }
          
          setUser(null)
          setIsAuthenticated(false)
          setLoading(false)
          
          // Resetear el flag después de un delay
          setTimeout(() => {
            authAttempted.current = false
          }, 5000)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const retryAuth = async () => {
    if (authAttempted.current) return
    
    setLoading(true)
    setError(null)
    authAttempted.current = true
    
    try {
      const authInstance = getAuthInstance()
      if (!authInstance) throw new Error("Auth not available")
      
      const result = await retryWithBackoff(
        () => signInAnonymously(authInstance),
        2,
        2000
      )
      
      setUser(result.user)
      setIsAuthenticated(true)
      setError(null)
      setRetryCount(0)
    } catch (error: any) {
      console.error("[OptimizedAuth] Retry failed:", error)
      setError("Error al reintentar. Por favor, espera un momento.")
      setRetryCount(prev => prev + 1)
    } finally {
      setLoading(false)
      setTimeout(() => {
        authAttempted.current = false
      }, 3000)
    }
  }

  return {
    isAuthenticated,
    loading,
    error,
    user,
    retryCount,
    retryAuth
  }
}
