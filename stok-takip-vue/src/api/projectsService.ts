import { ApiResponse } from '../types/common'
import { BaseApiService } from './baseApiService'

class ProjectsService extends BaseApiService {
  constructor() {
    super('projects')
  }

  // Project specific methods
  async reserveProject(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}/reserve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          data: data,
          message: 'Proje rezerve edildi'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          data: null,
          message: errorData.message || 'Rezerve edilirken hata oluştu'
        }
      }
    } catch (error) {
      console.error('Reserve project error:', error)
      return {
        success: false,
        data: null,
        message: 'Rezerve edilirken hata oluştu'
      }
    }
  }

  async startProject(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}/start`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          data: data,
          message: 'Proje başlatıldı'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          data: null,
          message: errorData.message || 'Başlatılırken hata oluştu'
        }
      }
    } catch (error) {
      console.error('Start project error:', error)
      return {
        success: false,
        data: null,
        message: 'Başlatılırken hata oluştu'
      }
    }
  }

  async completeProject(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}/complete`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          data: data,
          message: 'Proje tamamlandı'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          data: null,
          message: errorData.message || 'Tamamlanırken hata oluştu'
        }
      }
    } catch (error) {
      console.error('Complete project error:', error)
      return {
        success: false,
        data: null,
        message: 'Tamamlanırken hata oluştu'
      }
    }
  }
}

export const projectsService = new ProjectsService()