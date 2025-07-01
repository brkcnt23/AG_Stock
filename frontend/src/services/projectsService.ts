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
    const response = await this.api.get(`${this.basePath}/check-stock`, {
      params: { materialId, materialType, quantity }
    })
    return response.data
  }
}

export const projectsService = new ProjectsService()