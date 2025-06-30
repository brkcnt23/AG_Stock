// frontend/src/api/halatService.ts - Halat API Service
import { BaseApiService } from './baseApiService'
import type { HalatItem } from '../types/halat'

class HalatService extends BaseApiService {
  constructor() {
    super('/halat')
  }

  // Specific methods for Halat
  async getHalats(params?: {
    page?: number
    limit?: number
    search?: string
    status?: 'stokta' | 'tukendi' | 'kritik'
    type?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return this.getItems<HalatItem>(params)
  }

  async getHalat(id: string) {
    return this.getItem<HalatItem>(id)
  }

  async createHalat(data: Partial<HalatItem>) {
    return this.createItem<HalatItem>(data)
  }

  async updateHalat(id: string, data: Partial<HalatItem>) {
    return this.updateItem<HalatItem>(id, data)
  }

  async deleteHalat(id: string) {
    return this.deleteItem<HalatItem>(id)
  }

  async updateHalatStock(id: string, stockData: { stok: number; operation?: 'set' | 'add' | 'subtract' }) {
    return this.updateStock<HalatItem>(id, stockData)
  }

  async getHalatStats() {
    return this.getStats<{
      totalCount: number
      inStockCount: number
      outOfStockCount: number
      criticalStockCount: number
      totalValue: number
      stockDistribution: Array<{ _id: string; count: number; totalStock: number }>
      stockSufficiency: number
    }>()
  }
}

export const halatService = new HalatService()