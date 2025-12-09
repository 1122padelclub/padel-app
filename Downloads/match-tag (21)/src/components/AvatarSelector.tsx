"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

interface AvatarSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (avatar: string) => void
  currentAvatar?: string
}

const AVAILABLE_AVATARS = [
  { id: "🐱", name: "Gato" },
  { id: "🐶", name: "Perro" },
  { id: "🐰", name: "Conejo" },
  { id: "🐸", name: "Rana" },
  { id: "🐨", name: "Koala" },
  { id: "🐼", name: "Panda" },
  { id: "🦊", name: "Zorro" },
  { id: "🐻", name: "Oso" },
  { id: "🦁", name: "León" },
  { id: "🐯", name: "Tigre" },
  { id: "🐮", name: "Vaca" },
  { id: "🐷", name: "Cerdo" },
  { id: "🐸", name: "Rana" },
  { id: "🐙", name: "Pulpo" },
  { id: "🦋", name: "Mariposa" },
  { id: "🐝", name: "Abeja" },
  { id: "🦄", name: "Unicornio" },
  { id: "🐲", name: "Dragón" },
  { id: "👻", name: "Fantasma" },
  { id: "🤖", name: "Robot" },
  { id: "👽", name: "Alien" },
  { id: "🎭", name: "Máscara" },
  { id: "🎪", name: "Circo" },
  { id: "🎨", name: "Arte" }
]

export function AvatarSelector({ isOpen, onClose, onSelect, currentAvatar }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "")

  if (!isOpen) return null

  const handleSelect = () => {
    console.log("🔍 [DEBUG] AvatarSelector - handleSelect:", {
      selectedAvatar,
      selectedAvatarType: typeof selectedAvatar,
      selectedAvatarLength: selectedAvatar?.length
    })
    onSelect(selectedAvatar)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Seleccionar Avatar</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-6 gap-3 mb-6 max-h-[400px] overflow-y-auto">
            {AVAILABLE_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => {
                  console.log("🔍 [DEBUG] AvatarSelector - avatar clicked:", {
                    avatarId: avatar.id,
                    avatarName: avatar.name,
                    currentSelected: selectedAvatar
                  })
                  setSelectedAvatar(avatar.id)
                }}
                className={`
                  p-3 rounded-lg border-2 transition-all hover:scale-105
                  ${selectedAvatar === avatar.id 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="text-3xl mb-1">{avatar.id}</div>
                <div className="text-xs text-center text-gray-600">{avatar.name}</div>
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleSelect} disabled={!selectedAvatar} className="flex-1">
              Seleccionar Avatar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}







