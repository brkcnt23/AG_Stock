import axios, { AxiosInstance } from 'axios'
import type { BaseItem, ApiResponse } from '../types/common'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function createBaseService<T extends BaseItem>(endpoint: string) {
  const api: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/${endpoint}`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  })

  return {
    async testConnection(): Promise<ApiResponse<{ status: string }>> {
      try {
        const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`)
        return {
          success: true,
          data: { status: 'connected' },
          message: 'Backend bağlantısı başarılı'
        }
      } catch (error) {
        return {
          success: false,
          data: { status: 'disconnected' },
          message: 'Backend bağlantısı başarısız'
        }
      }
    },

    async getItems(params: any = {}): Promise<ApiResponse<T[]>> {
      try {
        const response = await api.get('/', { params })
        return {
          success: true,
          data: response.data || [],
          total: response.data?.length || 0,
          message: 'Veriler başarıyla alındı'
        }
      } catch (error) {
        console.error(`${endpoint} API error:`, error)
        return {
          success: false,
          data: [],
          message: `${endpoint} verileri alınamadı`
        }
      }
    },

    async getItem(id: string): Promise<ApiResponse<T>> {
      try {
        const response = await api.get(`/${id}`)
        return {
          success: true,
          data: response.data,
          message: 'Veri alındı'
        }
      } catch (error) {
        throw new Error(`${endpoint} bulunamadı`)
      }
    },

    async createItem(itemData: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<T>> {
      try {
        const response = await api.post('/', itemData)
        return {
          success: true,
          data: response.data,
          message: `${endpoint} başarıyla eklendi`
        }
      } catch (error) {
        throw new Error(`${endpoint} eklenemedi`)
      }
    },

    async updateItem(id: string, itemData: Partial<T>): Promise<ApiResponse<T>> {
      try {
        const response = await api.put(`/${id}`, itemData)
        return {
          success: true,
          data: response.data,
          message: `${endpoint} güncellendi`
        }
      } catch (error) {
        throw new Error(`${endpoint} güncellenemedi`)
      }
    },

    async deleteItem(id: string): Promise<ApiResponse<null>> {
      try {
        await api.delete(`/${id}`)
        return {
          success: true,
          data: null,
          message: `${endpoint} başarıyla silindi`
        }
      } catch (error) {
        throw new Error(`${endpoint} silinemedi`)
      }
    },

    async getStatistics(): Promise<ApiResponse<any>> {
      try {
        const response = await api.get('/statistics')
        return {
          success: true,
          data: response.data,
          message: 'İstatistikler alındı'
        }
      } catch (error) {
        return {
          success: true,
          data: {
            totalItems: 0,
            totalValue: 0,
            lowStock: 0,
            recentlyAdded: 0
          },
          message: 'İstatistikler hesaplanamadı'
        }
      }
    }
  }
}