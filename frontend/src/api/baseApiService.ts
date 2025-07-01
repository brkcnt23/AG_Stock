import axios, { AxiosInstance } from 'axios'
import type { ApiResponse } from '../types/common'

export abstract class BaseApiService {
  protected client: AxiosInstance  // PROTECTED yapıldı
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
    this.client = axios.create({
      baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Response interceptor
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error(`[${this.endpoint}] API Error:`, error)
        return Promise.reject(error)
      }
    )
  }

  // PROTECTED yapıldı
  protected handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    if (error.message) {
      return new Error(error.message)
    }
    return new Error('Bilinmeyen bir hata oluştu')
  }

  // Get all items
  async getItems<T>(params?: any): Promise<ApiResponse<T[]>> {
    try {
      const response = await this.client.get(this.endpoint, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Get single item
  async getItem<T>(id: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Create item
  async createItem<T>(data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(this.endpoint, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Update item
  async updateItem<T>(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(`${this.endpoint}/${id}`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Delete item
  async deleteItem<T>(id: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Get statistics
  async getStats<T>(): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(`${this.endpoint}/stats`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }
}