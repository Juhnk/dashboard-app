// Chart color utilities
export const CHART_COLORS = [
  '#2563eb', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#a855f7', // Fuchsia
]

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function generateColorPalette(count: number): string[] {
  if (count <= CHART_COLORS.length) {
    return CHART_COLORS.slice(0, count)
  }
  
  // Generate additional colors by varying saturation and lightness
  const colors = [...CHART_COLORS]
  const baseHues = [220, 160, 45, 0, 270, 320, 180, 25, 80, 190, 240, 290]
  
  for (let i = CHART_COLORS.length; i < count; i++) {
    const hue = baseHues[i % baseHues.length]
    const saturation = 60 + (i % 3) * 15 // 60%, 75%, 90%
    const lightness = 45 + (i % 2) * 10  // 45%, 55%
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
  }
  
  return colors
}

// Color manipulation utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function adjustOpacity(color: string, opacity: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

export function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  
  const factor = 1 - amount
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  )
}

export function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  
  const factor = amount
  return rgbToHex(
    Math.round(rgb.r + (255 - rgb.r) * factor),
    Math.round(rgb.g + (255 - rgb.g) * factor),
    Math.round(rgb.b + (255 - rgb.b) * factor)
  )
}