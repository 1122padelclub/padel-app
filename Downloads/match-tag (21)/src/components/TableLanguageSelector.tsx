"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useTableT } from "@/src/hooks/useTableTranslation"

interface TableLanguageSelectorProps {
  className?: string
}

export function TableLanguageSelector({ className = "" }: TableLanguageSelectorProps) {
  const { language, setLanguage } = useTableT()
  const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en'>('es')

  useEffect(() => {
    // Sincronizar con el contexto
    setCurrentLanguage(language)
  }, [language])

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'es' ? 'en' : 'es'
    console.log('🌐 TableLanguageSelector: Changing language to', newLanguage)
    setCurrentLanguage(newLanguage)
    setLanguage(newLanguage)
  }

  return (
    <Button
      onClick={handleLanguageToggle}
      variant="outline"
      size="sm"
      className={`rounded-full border-2 transition-all duration-200 hover:scale-105 ${className}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.3)",
        color: "white",
        backdropFilter: "blur(10px)",
      }}
    >
      <Globe className="h-4 w-4 mr-2" />
      {currentLanguage === 'es' ? 'ES' : 'EN'}
    </Button>
  )
}
