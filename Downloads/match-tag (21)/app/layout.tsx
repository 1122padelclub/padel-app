import "./globals.css"
import type { Metadata } from "next"
import { Inter, Urbanist } from "next/font/google"
import type React from "react"
import ClientLayout from "./ClientLayout"

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

export const metadata: Metadata = {
  title: "Match Tag",
  description: "Chat por mesa y pedidos para bares",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["bar", "chat", "pedidos", "nfc", "mesa", "restaurante"],
  authors: [{ name: "Match Tag" }],
  creator: "Match Tag",
  publisher: "Match Tag",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Match Tag",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}
