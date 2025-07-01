import { BaseApiService } from './baseApiService';

class SarfService extends BaseApiService<any> {
  constructor() {
    super('/sarf');
  }
  private endpoint = '/sarf';

  // Standart listeleme (query parametreleri destekler)
  getSarf(params?: any) {
    return this.api.get(this.endpoint, { params });
  }

  // Tek sarf getir (id string olmalı)
  getSarfById(id: string) {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  // Sarf ekle
  createSarf(data: any) {
    return this.api.post(this.endpoint, data);
  }

  // Sarf güncelle
  updateSarf(id: string, data: any) {
    return this.api.put(`${this.endpoint}/${id}`, data);
  }

  // Sarf sil
  deleteSarf(id: string) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  // Toplu işlemler (opsiyonel)
  bulkOperation(data: any) {
    return this.api.post(`${this.endpoint}/bulk`, data);
  }
}

export const sarfService = new SarfService();