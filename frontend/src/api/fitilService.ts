import { BaseApiService } from './baseApiService'
import type { Fitil } from '../types/fitil'

class FitilService extends BaseApiService {
  constructor() {
    super('/fitil')
  }

  async getFitilItems(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    malzeme?: string
    cins?: string
    proje?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    minPrice?: number
    maxPrice?: number
  }) {
    return this.getItems<Fitil>(params)
  }

  async getFitil(id: string) {
    return this.getItem<Fitil>(id)
  }

  async createFitil(data: Partial<Fitil>) {
    return this.createItem<Fitil>(data)
  }

  async updateFitil(id: string, data: Partial<Fitil>) {
    return this.updateItem<Fitil>(id, data)
  }

  async deleteFitil(id: string) {
    return this.deleteItem<Fitil>(id)
  }

  async getFitilStats() {
    return this.getStats()
  }

  async bulkFitilOperations(operation: string, items: string[], updateData?: any) {
    return this.bulkOperations(operation, items, updateData)
  }
}

export const fitilService = new FitilService()