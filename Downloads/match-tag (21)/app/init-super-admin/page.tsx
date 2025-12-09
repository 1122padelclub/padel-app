"use client"

import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/src/services/firebaseExtras"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const dynamic = "force-dynamic"

export default function InitSuperAdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [email, setEmail] = useState("superadmin@matchtag.com")
  const [password, setPassword] = useState("SuperAdmin123!")

  const createSuperAdmin = async () => {
    setLoading(true)
    setMessage("")
    setError("")

    if (!email || !password) {
      setError("Por favor completa todos los campos")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        role: "super_admin",
        createdAt: new Date(),
      })

      setMessage(`Super admin creado exitosamente! Credenciales: ${email} / ${password}`)
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError(`El email ${email} ya está en uso. Prueba con otro email.`)
      } else {
        setError(`Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Inicializar Super Admin</CardTitle>
          <CardDescription className="text-gray-400">Crear la cuenta de super administrador inicial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className="bg-green-900/20 border-green-800">
              <AlertDescription className="text-green-400">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-900/20 border-red-800">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email del Super Admin
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@matchtag.com"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <Button onClick={createSuperAdmin} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? "Creando..." : "Crear Super Admin"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Esta página es solo para inicialización. Elimínala en producción.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
