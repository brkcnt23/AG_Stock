import { BaseApiService } from './baseApiService'
import type { FitilItem } from '../types/fitil'

class FitilService extends BaseApiService {
  constructor() {
    super('/fitil')
  }

  async getFitils(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    malzeme?: string
    cins?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return this.getItems<FitilItem>(params)
  }

  async getFitil(id: string) {
    return this.getItem<FitilItem>(id)
  }

  async createFitil(data: Partial<FitilItem>) {
    return this.createItem<FitilItem>(data)
  }

  async updateFitil(id: string, data: Partial<FitilItem>) {
    return this.updateItem<FitilItem>(id, data)
  }

  async deleteFitil(id: string) {
    return this.deleteItem<FitilItem>(id)
  }

  async getFitilStats() {
    return this.getStats<{
      totalCount: number
      activeCount: number
      passiveCount: number
      totalValue: number
      lowStockCount: number
      outOfStockCount: number
      recentCount: number
    }>()
  }
}

export const fitilService = new FitilService()