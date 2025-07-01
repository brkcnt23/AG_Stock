export const ensureString = (value: any): string => {
  return typeof value === 'string' ? value : String(value || '')
}

export const ensureNumber = (value: any): number => {
  const num = typeof value === 'number' ? value : parseFloat(value)
  return isNaN(num) ? 0 : num
}

export const ensureBoolean = (value: any): boolean => {
  return Boolean(value)
}