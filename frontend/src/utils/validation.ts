export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  const re = /^(\+90|0)?[0-9]{10}$/
  return re.test(phone.replace(/\s/g, ''))
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const validateMinLength = (value: string, min: number): boolean => {
  return typeof value === 'string' && value.length >= min
}

export const validateMaxLength = (value: string, max: number): boolean => {
  return !value || value.length <= max
}

export const validateNumber = (value: any): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value))
}

export const validatePositiveNumber = (value: any): boolean => {
  return validateNumber(value) && Number(value) > 0
}

export const validateRange = (value: any, min: number, max: number): boolean => {
  const num = Number(value)
  return validateNumber(value) && num >= min && num <= max
}