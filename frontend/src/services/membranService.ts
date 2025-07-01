import { BaseApiService } from './baseApiService'
import type { MembranItem } from '../types/common'

class MembranService extends BaseApiService<MembranItem> {
  constructor() {
    super('/membran')
  }

  getMembran(params?: any) {
    return this.api.get(this.basePath, { params })
  }

  getMembranById(id: string) {
    return this.api.get(`${this.basePath}/${id}`)
  }

  createMembran(data: Partial<MembranItem>) {
    return this.api.post(this.basePath, data)
  }

  updateMembran(id: string, data: Partial<MembranItem>) {
    return this.api.put(`${this.basePath}/${id}`, data)
  }

  deleteMembran(id: string) {
    return this.api.delete(`${this.basePath}/${id}`)
  }
}

export const membranService = new MembranService()
