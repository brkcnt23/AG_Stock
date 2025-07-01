import { BaseApiService } from './baseApiService';

class SarfService extends BaseApiService {
  private endpoint = '/sarf';

  getAll() {
    return this.api.get(this.endpoint);
  }

  getById(id: number) {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  create(data: any) {
    return this.api.post(this.endpoint, data);
  }

  update(id: number, data: any) {
    return this.api.put(`${this.endpoint}/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  // Stok işlemleri
  updateStock(id: number, quantity: number) {
    return this.api.patch(`${this.endpoint}/${id}/stock`, { quantity });
  }
}

export const sarfService = new SarfService();