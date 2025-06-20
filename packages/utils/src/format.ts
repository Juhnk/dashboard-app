// Number formatting utilities
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(value)
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return formatNumber(value, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPercentage(value: number, decimals = 1): string {
  return formatNumber(value / 100, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return formatNumber(value / 1000000, { maximumFractionDigits: 1 }) + 'M'
  }
  if (value >= 1000) {
    return formatNumber(value / 1000, { maximumFractionDigits: 1 }) + 'K'
  }
  return formatNumber(value, { maximumFractionDigits: 0 })
}

export function formatMetric(value: number, type: 'currency' | 'percentage' | 'number' | 'compact' = 'number'): string {
  switch (type) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return formatPercentage(value)
    case 'compact':
      return formatCompactNumber(value)
    default:
      return formatNumber(value)
  }
}

// String utilities
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
}