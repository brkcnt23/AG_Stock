export const getErrorMessage = (error: any): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  return 'Bilinmeyen bir hata oluştu'
}

export const handleError = (error: any): Error => {
  const message = getErrorMessage(error)
  return new Error(message)
}
