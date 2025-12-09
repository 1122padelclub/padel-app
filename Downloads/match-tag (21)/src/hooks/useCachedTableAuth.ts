"use client"

import { useEffect, useState, useRef } from "react"
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth"
import { getAuthInstance } from "@/lib/firebase"
import { useTableCache, CACHE_TTL } from "./useTableCache"
import { retryWithBackoff } from "@/src/utils/rateLimitHandler"

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
  retryCount: number
}

export function useCachedTableAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    retryCount: 0
  })
  
  const { setCache, getCache, hasCache } = useTableCache()
  const authAttempted = useRef(false)
  const lastAuthTime = useRef(0)
  const authKey = "table_auth_state"

  // Verificar caché al inicializar
  useEffect(() => {
    const cachedAuth = getCache<AuthState>(authKey)
    if (cachedAuth && cachedAuth.isAuthenticated) {
      console.log("[CachedAuth] Using cached auth state")
      setAuthState(cachedAuth)
      return
    }

    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    const authInstance = getAuthInstance()
    if (!authInstance) {
      setAuthState(prev => ({
        ...prev,
        error: "Auth not available",
        loading: false,
        isAuthenticated: false
      }))
      return
    }

    // Evitar múltiples intentos simultáneos
    if (authAttempted.current) return

    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("[CachedAuth] User authenticated:", firebaseUser.uid)
        const newState = {
          isAuthenticated: true,
          user: firebaseUser,
          loading: false,
          error: null,
          retryCount: 0
        }
        
        setAuthState(newState)
        setCache(authKey, newState, CACHE_TTL.AUTH_STATE)
        authAttempted.current = false
      } else if (!authAttempted.current) {
        await attemptAnonymousAuth()
      }
    })

    // Cleanup después de 30 segundos para evitar memory leaks
    setTimeout(() => {
      unsubscribe()
    }, 30000)
  }

  const attemptAnonymousAuth = async () => {
    if (authAttempted.current) return
    
    authAttempted.current = true
    
    // Verificar rate limiting local
    const now = Date.now()
    if (now - lastAuthTime.current < 3000) { // 3 segundos mínimo entre intentos
      console.log("[CachedAuth] Rate limiting: too soon for another attempt")
      setTimeout(() => {
        authAttempted.current = false
      }, 3000 - (now - lastAuthTime.current))
      return
    }
    
    lastAuthTime.current = now

    try {
      console.log("[CachedAuth] Attempting anonymous authentication...")
      
      const authInstance = getAuthInstance()
      if (!authInstance) throw new Error("Auth not available")
      
      const result = await retryWithBackoff(
        () => signInAnonymously(authInstance),
        1, // Solo 1 reintento para evitar rate limits
        2000 // 2 segundos de delay
      )
      
      const newState = {
        isAuthenticated: true,
        user: result.user,
        loading: false,
        error: null,
        retryCount: 0
      }
      
      setAuthState(newState)
      setCache(authKey, newState, CACHE_TTL.AUTH_STATE)
      
    } catch (error: any) {
      console.error("[CachedAuth] Authentication failed:", error)
      
      const newState = {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error?.error === "Rate limit exceeded" 
          ? "Demasiadas solicitudes. Por favor, espera un momento."
          : "Error de autenticación. Intenta nuevamente.",
        retryCount: authState.retryCount + 1
      }
      
      setAuthState(newState)
      
      // Resetear flag después de un delay
      setTimeout(() => {
        authAttempted.current = false
      }, 5000)
    }
  }

  const retryAuth = async () => {
    if (authAttempted.current) return
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    authAttempted.current = true
    
    try {
      const authInstance = getAuthInstance()
      if (!authInstance) throw new Error("Auth not available")
      
      const result = await retryWithBackoff(
        () => signInAnonymously(authInstance),
        1,
        3000
      )
      
      const newState = {
        isAuthenticated: true,
        user: result.user,
        loading: false,
        error: null,
        retryCount: 0
      }
      
      setAuthState(newState)
      setCache(authKey, newState, CACHE_TTL.AUTH_STATE)
      
    } catch (error: any) {
      console.error("[CachedAuth] Retry failed:", error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: "Error al reintentar. Por favor, espera un momento.",
        retryCount: prev.retryCount + 1
      }))
    } finally {
      setTimeout(() => {
        authAttempted.current = false
      }, 5000)
    }
  }

  return {
    ...authState,
    retryAuth
  }
}
