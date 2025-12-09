"use client"
import { Inter, Urbanist } from "next/font/google"
import Link from "next/link"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
})

export default function HomePage() {
  return (
    <div
      className={`${inter.variable} ${urbanist.variable} min-h-screen bg-black text-white flex flex-col items-center justify-center p-8`}
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">Match Tag</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            La revolución del servicio en bares. Chat por mesa y pedidos instantáneos con solo escanear un tag NFC.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/admin/login" 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-center"
          >
            Panel de Administración
          </Link>
          <Link 
            href="/superadmin" 
            className="px-8 py-3 bg-transparent border border-gray-600 hover:border-gray-500 rounded-lg font-medium transition-colors text-center"
          >
            Super Admin
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Chat por Mesa</h3>
            <p className="text-gray-400">Comunicación instantánea entre clientes y personal del bar</p>
            <p className="text-sm text-gray-500">
              Los clientes pueden chatear directamente desde su mesa, enviar emojis y GIFs para una experiencia más
              divertida.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Pedidos Integrados</h3>
            <p className="text-gray-400">Sistema de pedidos directo desde el chat</p>
            <p className="text-sm text-gray-500">
              Los clientes pueden realizar pedidos sin levantarse de su mesa, con confirmación instantánea.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Gestión Completa</h3>
            <p className="text-gray-400">Panel de administración para bares</p>
            <p className="text-sm text-gray-500">
              Control total sobre mesas, menú, pedidos y chats desde un panel intuitivo y fácil de usar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
