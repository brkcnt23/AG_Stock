import { BaseApiService } from './baseApiService';

class ProjeService extends BaseApiService {
  private endpoint = '/projeler';

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

  // Proje durumu değiştirme
  updateStatus(id: number, status: string) {
    return this.api.patch(`${this.endpoint}/${id}/status`, { status });
  }

  // Proje materialleri
  getMaterials(projeId: number) {
    return this.api.get(`${this.endpoint}/${projeId}/materials`);
  }

  addMaterial(projeId: number, material: any) {
    return this.api.post(`${this.endpoint}/${projeId}/materials`, material);
  }

  removeMaterial(projeId: number, materialId: number) {
    return this.api.delete(`${this.endpoint}/${projeId}/materials/${materialId}`);
  }

  // Material kullanım
  useMaterial(projeId: number, materialId: number, quantity: number) {
    return this.api.post(`${this.endpoint}/${projeId}/materials/${materialId}/use`, { quantity });
  }
}

export const projeService = new ProjeService();