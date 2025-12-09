"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/src/hooks/useTranslation"
import { Globe, Check } from "lucide-react"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'es' | 'en')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px] h-9 bg-white/10 border-white/20 text-white hover:bg-white/20">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <SelectValue>
              {languages.find(lang => lang.code === language)?.flag} {languages.find(lang => lang.code === language)?.name}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && <Check className="h-4 w-4 ml-auto text-green-600" />}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Versión compacta para espacios reducidos
export function LanguageSelectorCompact() {
  const { language, setLanguage } = useLanguage()

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'es' | 'en')
  }

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
      <button
        onClick={() => handleLanguageChange('es')}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
          language === 'es' 
            ? 'bg-white text-gray-900' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
          language === 'en' 
            ? 'bg-white text-gray-900' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        EN
      </button>
    </div>
  )
}