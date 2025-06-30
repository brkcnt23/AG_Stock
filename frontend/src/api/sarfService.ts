import { BaseApiService } from './baseApiService'
import type { Sarf } from '../types/sarf'

class SarfService extends BaseApiService {
  constructor() {
    super('/sarf')
  }

  async getSarfItems(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    malzeme?: string
    cins?: string
    tip?: string
    proje?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    minPrice?: number
    maxPrice?: number
  }) {
    return this.getItems<Sarf>(params)
  }

  async getSarf(id: string) {
    return this.getItem<Sarf>(id)
  }

  async createSarf(data: Partial<Sarf>) {
    return this.createItem<Sarf>(data)
  }

  async updateSarf(id: string, data: Partial<Sarf>) {
    return this.updateItem<Sarf>(id, data)
  }

  async deleteSarf(id: string) {
    return this.deleteItem<Sarf>(id)
  }

  async getSarfStats() {
    return this.getStats()
  }

  async bulkSarfOperations(operation: string, items: string[], updateData?: any) {
    return this.bulkOperations(operation, items, updateData)
  }
}

export const sarfService = new SarfService()