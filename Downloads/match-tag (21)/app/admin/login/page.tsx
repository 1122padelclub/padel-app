"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/hooks/useAuth"
import { useAuthRateLimit } from "@/src/hooks/useRateLimit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthRateLimitIndicator } from "@/src/components/RateLimitIndicator"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { signIn, loading } = useAuth()
  const { checkLimit, isAllowed, remaining } = useAuthRateLimit()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Verificar rate limit antes de intentar login
    const allowed = await checkLimit()
    if (!allowed) {
      setError("Demasiados intentos de login. Intenta de nuevo más tarde.")
      return
    }

    const result = await signIn(email, password)

    if (result.success) {
      router.push("/admin")
    } else {
      setError(result.error || "Error al iniciar sesión")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Panel de Administración</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel de administración del bar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            
            {/* Rate Limit Indicator */}
            <AuthRateLimitIndicator className="mb-4" />
            
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full rounded-xl" 
              disabled={loading || !isAllowed}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
