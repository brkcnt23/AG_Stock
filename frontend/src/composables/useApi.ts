// frontend/src/composables/useApi.ts
import { ref, reactive } from 'vue'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

interface ApiState {
  loading: boolean
  error: string | null
  data: any
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T = any>(
  url: string, 
  options: AxiosRequestConfig & UseApiOptions = {}
) {
  const state = reactive<ApiState>({
    loading: false,
    error: null,
    data: null
  })

  const { immediate = false, onSuccess, onError, ...axiosConfig } = options

  // API client configuration
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // Request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  const execute = async (overrideConfig?: AxiosRequestConfig): Promise<T> => {
    state.loading = true
    state.error = null

    try {
      const config = { ...axiosConfig, ...overrideConfig }
      const response: AxiosResponse<T> = await apiClient({
        url,
        ...config
      })

      state.data = response.data
      
      if (onSuccess) {
        onSuccess(response.data)
      }

      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Bir hata oluştu'
      
      state.error = errorMessage
      
      if (onError) {
        onError(errorMessage)
      }

      throw error
    } finally {
      state.loading = false
    }
  }

  // Specific HTTP methods
  const get = (params?: any) => execute({ method: 'GET', params })
  const post = (data?: any) => execute({ method: 'POST', data })
  const put = (data?: any) => execute({ method: 'PUT', data })
  const patch = (data?: any) => execute({ method: 'PATCH', data })
  const del = () => execute({ method: 'DELETE' })

  // Auto-execute if immediate is true
  if (immediate) {
    execute()
  }

  return {
    ...state,
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
    refresh: () => execute()
  }
}