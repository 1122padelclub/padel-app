"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db, getAuthInstance } from "@/lib/firebase"
import { useStore } from "@/src/store/useStore"
import type { User } from "@/src/types"

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const { user, setUser } = useStore()

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    let timeoutId: NodeJS.Timeout

    const authInstance = getAuthInstance()
    if (!authInstance) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            await loadUserData(firebaseUser)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error("Auth state change error:", error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error("Auth state observer error:", error)
        setLoading(false)
      },
    )

    timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout, setting loading to false")
        setLoading(false)
      }
    }, 10000)

    return () => {
      unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [setUser, loading])

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const userWithBarId = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || undefined,
          role: userData.role || "guest",
          barId: userData.barId || firebaseUser.uid, // Usar UID como barId por defecto
        }
        console.log("✅ Usuario cargado:", userWithBarId)
        setUser(userWithBarId)
      } else {
        // Crear usuario guest por defecto con barId
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || undefined,
          role: "guest",
          barId: firebaseUser.uid, // Asignar UID como barId
          createdAt: new Date(),
        }

        await setDoc(doc(db, "users", firebaseUser.uid), newUser)
        console.log("✅ Usuario creado:", newUser)
        setUser(newUser)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      // Crear usuario con barId por defecto incluso si hay error
      const fallbackUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        role: "guest",
        barId: firebaseUser.uid,
        createdAt: new Date(),
      }
      console.log("✅ Usuario fallback creado:", fallbackUser)
      setUser(fallbackUser)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const authInstance = getAuthInstance()
      if (!authInstance) {
        return { success: false, error: "Auth not available" }
      }

      const result = await signInWithEmailAndPassword(authInstance, email, password)
      await loadUserData(result.user)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const authInstance = getAuthInstance()
      if (!authInstance) return

      await signOut(authInstance)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return {
    user,
    loading,
    signIn,
    logout,
  }
}
