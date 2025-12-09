"use client"

import type React from "react"

import { useAuth } from "@/src/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: Array<"super_admin" | "bar_admin" | "guest">
  redirectTo?: string
  fallback?: React.ReactNode
}

export function RoleGate({ children, allowedRoles, redirectTo = "/", fallback }: RoleGateProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      if (redirectTo) {
        const timeoutId = setTimeout(() => {
          router.push(redirectTo)
        }, 100)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || null
  }

  return <>{children}</>
}
