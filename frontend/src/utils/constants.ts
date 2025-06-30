export const API_ENDPOINTS = {
  HALAT: '/halat',
  SARF: '/sarf',
  CELIK: '/celik',
  FITIL: '/fitil',
  MEMBRAN: '/membran',
  PROJECTS: '/projects',
  LOGS: '/logs',
  HEALTH: '/health'
} as const

export const ITEM_TYPES = {
  HALAT: 'halat',
  SARF: 'sarf',
  CELIK: 'celik',
  FITIL: 'fitil',
  MEMBRAN: 'membran'
} as const

export const STOCK_STATUS = {
  IN_STOCK: 'stokta',
  OUT_OF_STOCK: 'tukendi',
  CRITICAL: 'kritik'
} as const

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export const CURRENCIES = [
  { value: 'TL', label: 'Türk Lirası', symbol: '₺' },
  { value: 'USD', label: 'Amerikan Doları', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' }
] as const

export const UNITS = [
  'adet',
  'kg',
  'metre',
  'litre',
  'paket',
  'kutu',
  'rulo',
  'kilo'
] as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 20, 50, 100]
} as const

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const

export const TABLE_DENSITIES = {
  COMPACT: 'compact',
  NORMAL: 'normal',
  DETAILED: 'detailed'
} as const