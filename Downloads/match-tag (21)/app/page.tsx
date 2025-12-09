import type { Metadata } from "next"
import HomePage from "./home-page"

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
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Match Tag",
  },
}

export default function Page() {
  return <HomePage />
}
