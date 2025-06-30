import { BaseApiService } from './baseApiService'
import type { Membran } from '../types/membran'

class MembranService extends BaseApiService {
  constructor() {
    super('/membran')
  }

  async getMembranItems(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    malzemeTuru?: string
    malzemeCinsi?: string
    proje?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    minPrice?: number
    maxPrice?: number
  }) {
    return this.getItems<Membran>(params)
  }

  async getMembran(id: string) {
    return this.getItem<Membran>(id)
  }

  async createMembran(data: Partial<Membran>) {
    return this.createItem<Membran>(data)
  }

  async updateMembran(id: string, data: Partial<Membran>) {
    return this.updateItem<Membran>(id, data)
  }

  async deleteMembran(id: string) {
    return this.deleteItem<Membran>(id)
  }

  async getMembranStats() {
    return this.getStats()
  }

  async bulkMembranOperations(operation: string, items: string[], updateData?: any) {
    return this.bulkOperations(operation, items, updateData)
  }
}

export const membranService = new MembranService()