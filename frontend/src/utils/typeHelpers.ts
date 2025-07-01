import { BaseItem } from "@/types/common"

export const ensureString = (value: any): string => {
  return typeof value === 'string' ? value : String(value || '')
}

export const ensureNumber = (value: any): number => {
  const num = typeof value === 'number' ? value : parseFloat(value)
  return isNaN(num) ? 0 : num
}

export const safeAccess = <T>(obj: any, key: string, defaultValue: T): T => {
  return obj && obj.hasOwnProperty(key) ? obj[key] : defaultValue
}

// Type guard for safe filtering
export const hasProperty = <T>(obj: any, prop: keyof T): obj is T => {
  return obj && obj.hasOwnProperty(prop)
}

// Safe date conversion
export const ensureDate = (value: any): Date => {
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? new Date() : date
  }
  return new Date()
}

// Safe ID conversion
export const ensureId = (item: any): string => {
  return item._id || item.id || ''
}

// Type-safe filter function
export const createSafeFilter = <T extends BaseItem>(
  items: T[], 
  filterFn: (item: T) => boolean
): T[] => {
  return items.filter(item => {
    try {
      return filterFn(item)
    } catch (error) {
      console.warn('Filter error:', error)
      return false
    }
  })
}