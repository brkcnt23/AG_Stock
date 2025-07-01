import axios from 'axios'
import { BaseApiService } from './baseApiService'
import type { ApiResponse, ApiRequestConfig } from '../types/api'
import type { Fitil, FitilStats } from '../types/fitil'
import type { FitilItem } from '../types/common'
import { API_ENDPOINTS } from '../types/api'

class FitilService extends BaseApiService<FitilItem> {
  private baseUrl = `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.FITIL}`

  constructor() {
    super('/fitil')
  }

  /**
   * Get all fitil items with optional filtering and pagination
   */
  async getFitils(params?: ApiRequestConfig): Promise<ApiResponse<Fitil[]>> {
    try {
      const { data } = await axios.get(this.baseUrl, { params })
      return data
    } catch (error: any) {
      throw this.handleError(error, 'Fitil listesi alınamadı')
    }
  }

  /**
   * Get a single fitil item by ID
   */
  async getFitil(id: string): Promise<ApiResponse<Fitil>> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/${id}`)
      return data
    } catch (error: any) {
      throw this.handleError(error, 'Fitil bulunamadı')
    }
  }

  /**
   * Create a new fitil item
   */
  async createFitil(fitilData: Partial<Fitil>): Promise<ApiResponse<Fitil>> {
    try {
      const { data } = await axios.post(this.baseUrl, fitilData)
      return data
    } catch (error: any) {
      throw this.handleError(error, 'Fitil eklenemedi')
    }
  }

  /**
   * Update an existing fitil item
   */
  async updateFitil(id: string, fitilData: Partial<Fitil>): Promise<ApiResponse<Fitil>> {
    try {
      const { data } = await axios.put(`${this.baseUrl}/${id}`, fitilData)
      return data
    } catch (error: any) {
      throw this.handleError(error, 'Fitil güncellenemedi')
    }
  }

  /**
   * Delete a fitil item
   */
  async deleteFitil(id: string): Promise<ApiResponse<null>> {
    try {
      const { data } = await axios.delete(`${this.baseUrl}/${id}`)
      return data
    } catch (error: any) {
      throw this.handleError(error, 'Fitil silinemedi')
    }
  }

  /**
   * Get fitil statistics
   */
  async getFitilStats(): Promise<ApiResponse<FitilStats>> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/stats`)
      return data
    } catch (error: any) {
      throw this.handleError(error, 'Fitil istatistikleri alınamadı')
    }
  }

  /**
   * Bulk operations on fitil items
   */
  async bulkOperation(operation: 'delete' | 'update', items: string[], updateData?: Partial<Fitil>): Promise<ApiResponse<null>> {
    try {
      const { data } = await axios.post(`${this.baseUrl}/bulk`, {
        operation,
        items,
        updateData
      })
      return data
    } catch (error: any) {
      throw this.handleError(error, 'Toplu işlem başarısız')
    }
  }

  /**
   * Error handler helper
   */
  private handleError(error: any, defaultMessage: string): Error {
    const message = error.response?.data?.message || error.message || defaultMessage
    const errorObject = new Error(message)
    errorObject.name = 'FitilServiceError'
    return errorObject
  }
}

// Create and export a single instance
export const fitilService = new FitilService()

// Export the class for testing purposes
export default FitilService
