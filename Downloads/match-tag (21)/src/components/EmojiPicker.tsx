"use client"

import { Button } from "@/components/ui/button"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

const EMOJI_CATEGORIES = {
  faces: ["😀", "😂", "😍", "😊", "😎", "🤔", "😴", "😋"],
  gestures: ["👍", "👏", "🙌", "👌", "✌️", "🤝", "👋", "🤟"],
  food: ["🍺", "🍕", "🍔", "🥤", "🍟", "🌮", "🍗", "🥪"],
  celebration: ["🎉", "🔥", "❤️", "⭐", "💯", "🎊", "🥳", "🎈"],
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <div className="space-y-3">
      {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
        <div key={category}>
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji) => (
              <Button
                key={emoji}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEmojiSelect(emoji)}
                className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
