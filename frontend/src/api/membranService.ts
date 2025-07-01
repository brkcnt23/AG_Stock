
// frontend/src/api/membranService.ts
import { BaseApiService } from './baseApiService'
import type { MembranItem } from '../types/membran'

class MembranService extends BaseApiService {
  constructor() {
    super('/membran')
  }

  async getMembrans(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    malzemeTuru?: string
    malzemeCinsi?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return this.getItems<MembranItem>(params)
  }

  async getMembran(id: string) {
    return this.getItem<MembranItem>(id)
  }

  async createMembran(data: Partial<MembranItem>) {
    return this.createItem<MembranItem>(data)
  }

  async updateMembran(id: string, data: Partial<MembranItem>) {
    return this.updateItem<MembranItem>(id, data)
  }

  async deleteMembran(id: string) {
    return this.deleteItem<MembranItem>(id)
  }

  async getMembranStats() {
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

export const membranService = new MembranService()