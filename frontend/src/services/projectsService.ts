// frontend/src/services/projectsService.ts - Düzeltilmiş versiyon

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
    console.log('🔗 Full URL:', this.api.defaults.baseURL + this.basePath)
    
    try {
      const response = await this.api.post<ApiResponse<Project>>(this.basePath, data)
      console.log('✅ API yanıtı alındı:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ ProjectsService - create hatası:', error)
      console.error('❌ Error response:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      throw error
    }
  }

  async update(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await this.api.put<ApiResponse<Project>>(`${this.basePath}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`${this.basePath}/${id}`)
    return { ...response.data, data: null }
  }

  async reserve(id: string): Promise<ProjectOperationResult> {
    const response = await this.api.post<ProjectOperationResult>(`${this.basePath}/${id}/reserve`)
    return response.data
  }

  async checkMaterialStock(materialId: string, materialType: string, quantity: number) {
    //console.log('🔍 Frontend - checkMaterialStock çağrıldı')
    // ID temizleme
    const cleanId = String(materialId).trim().replace(/[^0-9a-fA-F]/g, '')
    
    if (!cleanId || cleanId.length !== 24) {
      console.error('❌ Geçersiz ID formatı:', { original: materialId, cleaned: cleanId })
      throw new Error('Geçersiz material ID formatı')
    }
    
    const cleanParams = {
      materialId: cleanId,
      materialType: String(materialType).trim(),
      quantity: Number(quantity)
    }
    
    // console.log('📤 Temizlenmiş parametreler:', cleanParams)
    // console.log('🔗 Request URL:', `${this.api.defaults.baseURL}${this.basePath}/check-stock`)
    // console.log('🔗 Full request details:', {
    //   method: 'GET',
    //   url: `${this.basePath}/check-stock`,
    //   params: cleanParams
    // })

    try {
      //console.log('📡 API isteği gönderiliyor...')
      
      const response = await this.api.get(`${this.basePath}/check-stock`, {
        params: cleanParams
      })
      
      console.log('✅ API isteği tamamlandı')
      // console.log('📥 Response status:', response.status)
      // console.log('📥 Response headers:', response.headers)
      // console.log('📥 Response data:', response.data)
      
      // Data structure kontrolü
      // if (response.data && response.data.data) {
      //   console.log('✅ Response.data.available:', response.data.data.available)
      //   console.log('✅ Response.data.found:', response.data.data.found)
      //   console.log('✅ Response.data.availableStock:', response.data.data.availableStock)
      // } else {
      //   console.log('⚠️ Beklenmeyen response structure:', response.data)
      // }
      
      return response.data
      
    } catch (error: any) {
      console.error('❌ API isteği hatası:', error)
      
      if (error.response) {
        console.error('❌ Response Error:')
        console.error('   Status:', error.response.status)
        console.error('   Data:', error.response.data)
        console.error('   Headers:', error.response.headers)
      } else if (error.request) {
        console.error('❌ Request Error (no response):')
        console.error('   Request:', error.request)
        console.error('   Likely network or CORS issue')
      } else {
        console.error('❌ General Error:')
        console.error('   Message:', error.message)
      }
      
      throw error
    }
  }
}

export const projectsService = new ProjectsService()