export interface FontOption {
  value: string
  label: string
  category: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting' | 'script'
  description: string
  googleFont?: boolean
}

export const FONT_OPTIONS: FontOption[] = [
  // Sans-serif fonts
  {
    value: 'Inter',
    label: 'Inter',
    category: 'sans-serif',
    description: 'Moderno y legible, perfecto para interfaces',
    googleFont: true
  },
  {
    value: 'Roboto',
    label: 'Roboto',
    category: 'sans-serif',
    description: 'Clásico de Google, muy versátil',
    googleFont: true
  },
  {
    value: 'Montserrat',
    label: 'Montserrat',
    category: 'sans-serif',
    description: 'Elegante y geométrico',
    googleFont: true
  },
  {
    value: 'Open Sans',
    label: 'Open Sans',
    category: 'sans-serif',
    description: 'Muy legible y amigable',
    googleFont: true
  },
  {
    value: 'Lato',
    label: 'Lato',
    category: 'sans-serif',
    description: 'Semi-redondeado, cálido',
    googleFont: true
  },
  {
    value: 'Poppins',
    label: 'Poppins',
    category: 'sans-serif',
    description: 'Geométrico y moderno',
    googleFont: true
  },
  {
    value: 'Nunito',
    label: 'Nunito',
    category: 'sans-serif',
    description: 'Redondeado y amigable',
    googleFont: true
  },
  {
    value: 'Source Sans Pro',
    label: 'Source Sans Pro',
    category: 'sans-serif',
    description: 'Profesional y limpio',
    googleFont: true
  },
  {
    value: 'system-ui, sans-serif',
    label: 'Sistema',
    category: 'sans-serif',
    description: 'Fuente del sistema operativo',
    googleFont: false
  },

  // Serif fonts
  {
    value: 'Playfair Display',
    label: 'Playfair Display',
    category: 'serif',
    description: 'Elegante y sofisticado',
    googleFont: true
  },
  {
    value: 'Lora',
    label: 'Lora',
    category: 'serif',
    description: 'Serif moderno y legible',
    googleFont: true
  },
  {
    value: 'Merriweather',
    label: 'Merriweather',
    category: 'serif',
    description: 'Perfecto para texto largo',
    googleFont: true
  },
  {
    value: 'Crimson Text',
    label: 'Crimson Text',
    category: 'serif',
    description: 'Clásico y tradicional',
    googleFont: true
  },
  {
    value: 'Libre Baskerville',
    label: 'Libre Baskerville',
    category: 'serif',
    description: 'Inspirado en Baskerville',
    googleFont: true
  },

  // Display fonts
  {
    value: 'Oswald',
    label: 'Oswald',
    category: 'display',
    description: 'Condensado y impactante',
    googleFont: true
  },
  {
    value: 'Bebas Neue',
    label: 'Bebas Neue',
    category: 'display',
    description: 'Condensado y moderno',
    googleFont: true
  },
  {
    value: 'Anton',
    label: 'Anton',
    category: 'display',
    description: 'Bold y llamativo',
    googleFont: true
  },
  {
    value: 'Righteous',
    label: 'Righteous',
    category: 'display',
    description: 'Retro y distintivo',
    googleFont: true
  },

  // Script/Handwriting fonts
  {
    value: 'Dancing Script',
    label: 'Dancing Script',
    category: 'script',
    description: 'Cursiva elegante',
    googleFont: true
  },
  {
    value: 'Pacifico',
    label: 'Pacifico',
    category: 'script',
    description: 'Cursiva casual y divertida',
    googleFont: true
  },
  {
    value: 'Caveat',
    label: 'Caveat',
    category: 'handwriting',
    description: 'Manuscrita natural',
    googleFont: true
  },
  {
    value: 'Kalam',
    label: 'Kalam',
    category: 'handwriting',
    description: 'Manuscrita informal',
    googleFont: true
  },
  {
    value: 'Satisfy',
    label: 'Satisfy',
    category: 'script',
    description: 'Cursiva fluida',
    googleFont: true
  },
  {
    value: 'Great Vibes',
    label: 'Great Vibes',
    category: 'script',
    description: 'Cursiva formal',
    googleFont: true
  },

  // Monospace fonts
  {
    value: 'JetBrains Mono',
    label: 'JetBrains Mono',
    category: 'monospace',
    description: 'Monospace moderna',
    googleFont: true
  },
  {
    value: 'Source Code Pro',
    label: 'Source Code Pro',
    category: 'monospace',
    description: 'Monospace profesional',
    googleFont: true
  },
  {
    value: 'Fira Code',
    label: 'Fira Code',
    category: 'monospace',
    description: 'Monospace con ligaduras',
    googleFont: true
  }
]

export const FONT_CATEGORIES = {
  'sans-serif': 'Sans-serif',
  'serif': 'Serif',
  'display': 'Display',
  'script': 'Script',
  'handwriting': 'Handwriting',
  'monospace': 'Monospace'
} as const

export function getFontsByCategory(category: FontOption['category']): FontOption[] {
  return FONT_OPTIONS.filter(font => font.category === category)
}

export function getGoogleFonts(): FontOption[] {
  return FONT_OPTIONS.filter(font => font.googleFont)
}

export function getSystemFonts(): FontOption[] {
  return FONT_OPTIONS.filter(font => !font.googleFont)
}





