// frontend/src/utils/objectId.ts - String-based ObjectId utilities (NO MongoDB import)

/**
 * ObjectId pattern validation
 * MongoDB ObjectId is a 24-character hexadecimal string
 */
const OBJECTID_PATTERN = /^[0-9a-fA-F]{24}$/

/**
 * Validate if a string is a valid ObjectId format
 */
export const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false
  return OBJECTID_PATTERN.test(id)
}

/**
 * Convert ObjectId to string (for UI compatibility)
 * In frontend, we only work with string representations
 */
export const objectIdToString = (id: any): string => {
  if (!id) return ''
  
  // If it's already a string, return as is
  if (typeof id === 'string') return id
  
  // If it's an object with toString method (like MongoDB ObjectId)
  if (id && typeof id.toString === 'function') {
    return id.toString()
  }
  
  // If it has _id property
  if (id && id._id) {
    return objectIdToString(id._id)
  }
  
  return String(id)
}

/**
 * Generate a client-side ObjectId-like string
 * Note: This is not a real MongoDB ObjectId, just for UI purposes
 */
export const generateClientId = (): string => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16)
  const randomBytes = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  
  return (timestamp + randomBytes).substring(0, 24)
}

/**
 * Extract timestamp from ObjectId string
 */
export const getObjectIdTimestamp = (id: string): Date | null => {
  if (!isValidObjectId(id)) return null
  
  try {
    const timestamp = parseInt(id.substring(0, 8), 16)
    return new Date(timestamp * 1000)
  } catch {
    return null
  }
}

/**
 * Compare ObjectIds (string comparison)
 */
export const compareObjectIds = (id1: string, id2: string): boolean => {
  return objectIdToString(id1) === objectIdToString(id2)
}

/**
 * Normalize ID for frontend use
 * Ensures we always work with strings in the frontend
 */
export const normalizeId = (item: any): any => {
  if (!item) return item
  
  if (Array.isArray(item)) {
    return item.map(normalizeId)
  }
  
  if (typeof item === 'object') {
    const normalized = { ...item }
    
    // Convert _id to string and create id field
    if (normalized._id) {
      normalized._id = objectIdToString(normalized._id)
      normalized.id = normalized._id
    }
    
    // Recursively normalize nested objects
    Object.keys(normalized).forEach(key => {
      if (typeof normalized[key] === 'object' && normalized[key] !== null) {
        normalized[key] = normalizeId(normalized[key])
      }
    })
    
    return normalized
  }
  
  return item
}

/**
 * Create a new ObjectId string for temporary items
 */
export const createTempId = (): string => {
  return `temp_${generateClientId()}`
}

/**
 * Create a new ObjectId-like string (alias for generateClientId)
 */
export const createObjectId = (): string => {
  return generateClientId()
}

/**
 * Check if an ID is a temporary ID
 */
export const isTempId = (id: string): boolean => {
  return typeof id === 'string' && id.startsWith('temp_')
}

/**
 * Sort ObjectIds (useful for consistent ordering)
 */
export const sortByObjectId = <T extends { _id?: string; id?: string }>(
  items: T[], 
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...items].sort((a, b) => {
    const idA = a._id || a.id || ''
    const idB = b._id || b.id || ''
    
    if (order === 'asc') {
      return idA.localeCompare(idB)
    } else {
      return idB.localeCompare(idA)
    }
  })
}

/**
 * Filter items by ObjectId
 */
export const filterByIds = <T extends { _id?: string; id?: string }>(
  items: T[], 
  ids: string[]
): T[] => {
  const normalizedIds = ids.map(objectIdToString)
  
  return items.filter(item => {
    const itemId = objectIdToString(item._id || item.id || '')
    return normalizedIds.includes(itemId)
  })
}

/**
 * Find item by ObjectId
 */
export const findById = <T extends { _id?: string; id?: string }>(
  items: T[], 
  id: string
): T | undefined => {
  const targetId = objectIdToString(id)
  
  return items.find(item => {
    const itemId = objectIdToString(item._id || item.id || '')
    return itemId === targetId
  })
}

// Type guards
export type ObjectIdLike = string | { toString(): string } | { _id: any }

export const isObjectIdLike = (value: any): value is ObjectIdLike => {
  return typeof value === 'string' || 
         (value && typeof value.toString === 'function') ||
         (value && value._id)
}