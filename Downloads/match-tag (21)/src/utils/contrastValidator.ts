export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 0

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

export function isWCAGAACompliant(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background)
  return ratio >= 4.5 // WCAG AA standard for normal text
}

export function isWCAGAAACompliant(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background)
  return ratio >= 7 // WCAG AAA standard for normal text
}

export function validateThemeContrast(colors: { [key: string]: string }) {
  const issues: string[] = []

  // Check primary text on background
  if (!isWCAGAACompliant(colors.foreground || "#ffffff", colors.background || "#000000")) {
    issues.push("El contraste entre texto principal y fondo no cumple WCAG AA")
  }

  // Check primary button contrast
  if (!isWCAGAACompliant(colors.primary || "#0A84FF", colors.background || "#000000")) {
    issues.push("El contraste del color primario no cumple WCAG AA")
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}
