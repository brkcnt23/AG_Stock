import { BaseApiService } from './baseApiService'
import type { Project, ProjectOperationResult } from '../types/projects'
import type { ApiResponse } from '../types/api'

class ProjectsService extends BaseApiService<Project> {
  constructor() {
    super('/projects')
  }

  async getAll(params?: any): Promise<Project[]> {
    try {
      const response = await this.api.get<Project[]>(this.basePath, { params })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      return []
    }
  }

  async create(data: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await this.api.post<ApiResponse<Project>>(this.basePath, data)
    return response.data
  }

  async update(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await this.api.put<ApiResponse<Project>>(`${this.basePath}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`${this.basePath}/${id}`)
    // Ensure the data property is null to match the expected type
    return { ...response.data, data: null }
  }

  async reserve(id: string): Promise<ProjectOperationResult> {
    const response = await this.api.post<ProjectOperationResult>(`${this.basePath}/${id}/reserve`)
    return response.data
  }

  async checkMaterialStock(materialId: string, materialType: string, quantity: number) {
    console.log('🔍 Frontend - checkMaterialStock çağrıldı');
    console.log('📤 Gönderilen parametreler:', { materialId, materialType, quantity });

    // Parametreleri kontrol et
    if (!materialId) {
      console.error('❌ materialId boş!');
      throw new Error('materialId gerekli');
    }

    if (!materialType) {
      console.error('❌ materialType boş!');
      throw new Error('materialType gerekli');
    }

    if (!quantity || quantity <= 0) {
      console.error('❌ quantity geçersiz:', quantity);
      throw new Error('quantity geçerli bir sayı olmalı');
    }

    try {
      const response = await this.api.get(`${this.basePath}/check-stock`, {
        params: { materialId, materialType, quantity }
      });

      console.log('✅ Stok kontrolü başarılı:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Stok kontrolü hatası:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        // @ts-expect-error: We are narrowing error to have response
        console.error('❌ Error response:', error.response?.data);
        // @ts-expect-error: We are narrowing error to have response
        console.error('❌ Error status:', error.response?.status);
      }
      throw error;
    }
  }
}
  export const projectsService = new ProjectsService()