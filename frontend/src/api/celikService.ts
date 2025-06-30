import { BaseApiService } from './baseApiService'
import type { Celik } from '../types/celik'

class CelikService extends BaseApiService {
  constructor() {
    super('/celik')
  }

  async getCelikItems(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    kalite?: string
    tip?: string
    proje?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    minPrice?: number
    maxPrice?: number
  }) {
    return this.getItems<Celik>(params)
  }

  async getCelik(id: string) {
    return this.getItem<Celik>(id)
  }

  async createCelik(data: Partial<Celik>) {
    return this.createItem<Celik>(data)
  }

  async updateCelik(id: string, data: Partial<Celik>) {
    return this.updateItem<Celik>(id, data)
  }

  async deleteCelik(id: string) {
    return this.deleteItem<Celik>(id)
  }

  async getCelikStats() {
    return this.getStats()
  }

  async bulkCelikOperations(operation: string, items: string[], updateData?: any) {
    return this.bulkOperations(operation, items, updateData)
  }
}

export const celikService = new CelikService()