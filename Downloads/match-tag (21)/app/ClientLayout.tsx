"use client"

import "./globals.css"
import React from "react"
import { Inter, Urbanist } from "next/font/google"
import { TranslationProvider } from "@/src/hooks/useTranslation"

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

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${urbanist.variable} dark`}>
      <head>
        <meta name="theme-color" content="#0A84FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Match Tag" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ErrorBoundary>
          <TranslationProvider>
            <div className="flex-1">{children}</div>
          </TranslationProvider>
        </ErrorBoundary>
        <footer className="bg-gray-900 border-t border-gray-800 py-3 px-4 text-center">
          <p className="text-sm text-gray-400">
            Powered By{" "}
            <a
              href="https://gibracompany.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Gibra Company
            </a>
          </p>
        </footer>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

// <CHANGE> Added error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>
}

class ErrorBoundaryClass extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-4 h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-red-600 mb-2">Error de Aplicación</h1>
            <p className="text-muted-foreground mb-4">Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
