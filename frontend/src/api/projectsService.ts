import { BaseApiService } from './baseApiService'
import type { ProjectItem, ApiResponse } from '../types/common'

export class ProjectService extends BaseApiService {
  constructor() {
    super('/projects')
  }

  // Projects için özel metodlar
  async getProjectsByStatus(status: string): Promise<ApiResponse<ProjectItem[]>> {
    try {
      const response = await this.client.get(`${this.endpoint}/status/${status}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async reserveProjectMaterials(projectId: string, materials: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(`${this.endpoint}/${projectId}/reserve`, { materials })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

export const projectsService = new ProjectService()