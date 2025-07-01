import { BaseApiService } from './baseApiService'
import type { CelikItem } from '../types/celik'

class CelikService extends BaseApiService {
  constructor() {
    super('/celik')
  }

  async getCeliks(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    kalite?: string
    tip?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return this.getItems<CelikItem>(params)
  }

  async getCelik(id: string) {
    return this.getItem<CelikItem>(id)
  }

  async createCelik(data: Partial<CelikItem>) {
    return this.createItem<CelikItem>(data)
  }

  async updateCelik(id: string, data: Partial<CelikItem>) {
    return this.updateItem<CelikItem>(id, data)
  }

  async deleteCelik(id: string) {
    return this.deleteItem<CelikItem>(id)
  }

  async getCelikStats() {
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

export const celikService = new CelikService()
