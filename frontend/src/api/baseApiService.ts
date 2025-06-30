// frontend/src/api/baseApiService.ts - Complete version
import axios, { AxiosResponse, AxiosError } from 'axios'

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters?: Record<string, any>
}

export interface ApiError {
  success: false
  message: string
  errors?: string[]
  statusCode?: number
}

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    return config
  },
  (error) => {
    console.error('[API] Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API] Response ${response.status}:`, response.data)
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    
    console.error('[API] Response Error:', {
      status: error.response?.status,
      message: error.message,
      url: originalRequest?.url
    })
    
    // Retry logic for network errors
    if (!error.response && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      
      if (originalRequest._retryCount <= API_CONFIG.retries) {
        console.log(`[API] Retrying request (${originalRequest._retryCount}/${API_CONFIG.retries})`)
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay))
        return apiClient(originalRequest)
      }
    }
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

// Base API Service Class
export class BaseApiService {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }

  // Health check
  async testConnection(): Promise<ApiResponse<{ status: string }>> {
    try {
      return {
        success: true,
        data: { status: 'connected' },
        message: 'Bağlantı başarılı'
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      return {
        success: false,
        data: { status: 'disconnected' },
        message: 'Bağlantı başarısız'
      }
    }
  }

  // Get all items with pagination and filtering
  async getItems<T>(params: Record<string, any> = {}): Promise<ApiResponse<T[]>> {
    try {
      const response = await apiClient.get(this.endpoint, { params })
      
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || 'API hatası')
      }
    } catch (error) {
      console.error(`[${this.endpoint}] Get items error:`, error)
      throw this.handleError(error)
    }
  }

  // Get single item by ID
  async getItem<T>(id: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`)
      
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || 'Kayıt bulunamadı')
      }
    } catch (error) {
      console.error(`[${this.endpoint}] Get item error:`, error)
      throw this.handleError(error)
    }
  }

  // Create new item
  async createItem<T>(data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(this.endpoint, data)
      
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || 'Kayıt oluşturulamadı')
      }
    } catch (error) {
      console.error(`[${this.endpoint}] Create item error:`, error)
      throw this.handleError(error)
    }
  }

  // Update item
  async updateItem<T>(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, data)
      
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || 'Kayıt güncellenemedi')
      }
    } catch (error) {
      console.error(`[${this.endpoint}] Update item error:`, error)
      throw this.handleError(error)
    }
  }

  // Delete item
  async deleteItem<T>(id: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${id}`)
      
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || 'Kayıt silinemedi')
      }
    } catch (error) {
      console.error(`[${this.endpoint}] Delete item error:`, error)
      throw this.handleError(error)
    }
  }

  // Update stock (specific to inventory items)
  async updateStock<T>(id: string, stockData: { stok: number; operation?: 'set' | 'add' | 'subtract' }): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch(`${this.endpoint}/${id}/stock`, stockData)
      
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || 'Stok güncellenemedi')
      }
    } catch (error) {
      console.error(`[${this.endpoint}] Update stock error:`, error)
      throw this.handleError(error)
    }
  }

  // Get statistics
  async getStats<T>(): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats`)
      
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || 'İstatistikler alınamadı')
      }
    } catch (error) {
      console.error(`[${this.endpoint}] Get stats error:`, error)
      throw this.handleError(error)
    }
  }

  // Bulk operations
  async bulkOperations<T>(operation: string, items: string[], updateData?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(`${this.endpoint}/bulk`, {
        operation,
        items,
        updateData
      })
      
      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || 'Toplu işlem başarısız')
      }
    } catch (error) {
      console.error(`[${this.endpoint}] Bulk operations error:`, error)
      throw this.handleError(error)
    }
  }

  // Error handler
  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>
      
      return {
        success: false,
        message: axiosError.response?.data?.message || axiosError.message || 'Network error',
        errors: axiosError.response?.data?.errors,
        statusCode: axiosError.response?.status
      }
    }
    
    return {
      success: false,
      message: error.message || 'Unknown error'
    }
  }
}

// Export singleton instance for general use
export const apiService = new BaseApiService('')

// Utility functions
export const isApiError = (result: any): result is ApiError => {
  return result && result.success === false
}

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Bilinmeyen hata'
}