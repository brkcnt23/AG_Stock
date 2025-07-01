// src/store/projectsStore.ts - Safe Access ile düzeltilmiş

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectsService } from '../services/projectsService'
import type { Project, ProjectOperationResult, ProjectValidationResult } from '../types/projects'
import type { ApiResponse } from '../types/api'
import { useNotificationStore } from './notificationStore'

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Helper function to ensure string ID
  const ensureStringId = (id: any): string => {
    if (typeof id === 'string') return id
    if (id && typeof id === 'object' && 'toString' in id) {
      return id.toString()
    }
    return String(id || '')
  }

  // Computed
  const statistics = computed(() => {
    return {
      totalItems: projects.value.length,
      totalValue: projects.value.reduce((sum, p) => sum + (p.totalMaterialCost || 0), 0),
      lowStock: projects.value.filter(p => (p.stockSufficiency || 0) < 50).length,
      recentlyAdded: projects.value.filter(p => {
        const createdAt = new Date(p.createdAt || Date.now())
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return createdAt > weekAgo
      }).length
    }
  })

  const projectsByStatus = computed(() => (status: string) => {
    return projects.value.filter(project => project.status === status)
  })

  // Add validation helper
  const validateProject = async (project: Project): Promise<ProjectValidationResult> => {
    const errors: string[] = []

    if (!project.name?.trim()) {
      errors.push('Proje adı gerekli')
    }

    if (!project.materials?.length) {
      errors.push('En az bir malzeme eklenmeli')
    }

    // Check material stocks
    const insufficientMaterials = []
    for (const material of project.materials || []) {
      try {
        const stockCheck = await projectsService.checkMaterialStock(
          material.materialId,
          material.materialType,
          material.requestedQuantity
        )
        
        if (!stockCheck.available) {
          insufficientMaterials.push({
            materialId: material.materialId,
            materialType: material.materialType,
            requested: material.requestedQuantity,
            available: stockCheck.availableStock
          })
        }
      } catch (err) {
        errors.push(`Stok kontrolü hatası: ${material.name}`)
      }
    }

    return {
      isValid: errors.length === 0 && insufficientMaterials.length === 0,
      errors,
      insufficientMaterials: insufficientMaterials.length ? insufficientMaterials : undefined
    }
  }

  // Actions
  const fetchProjects = async (params?: any) => {
    try {
      loading.value = true
      error.value = null

      const data = await projectsService.getAll(params)
      
      if (!Array.isArray(data)) {
        console.warn('Invalid projects response:', data)
        projects.value = []
        return
      }

      projects.value = data.map(project => ({
        ...project,
        materials: project.materials?.map(m => ({
          ...m,
          materialId: m.materialId || m._id,
          stockItemId: m.stockItemId || m._id
        })) || []
      }))

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      projects.value = [] // Reset projects on error
      throw err
    } finally {
      loading.value = false
    }
  }

  // Enhanced create project
  const createProject = async (projectData: Partial<Project>): Promise<ProjectOperationResult> => {
    try {
      const validation = await validateProject(projectData as Project)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Doğrulama hatası',
          error: validation.errors.join(', ')
        }
      }

      const response = await projectsService.create(projectData)
      projects.value.unshift(response.data)
      
      return {
        success: true,
        message: 'Proje başarıyla oluşturuldu',
        data: response.data
      }
    } catch (err) {
      console.error('Proje oluşturma hatası:', err)
      return {
        success: false,
        message: 'Proje oluşturulamadı',
        error: err instanceof Error ? err.message : 'Bilinmeyen hata'
      }
    }
  }

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.update(id, projectData)

      if (response.success) {
        const updatedProject = {
          ...response.data,
          id: ensureStringId(response.data._id),
          // Materials ID'lerini de normalize et
          materials: response.data.materials?.map(m => ({
            ...m,
            ...(m.hasOwnProperty('id') && { id: ensureStringId((m as any).id) }),
            materialId: ensureStringId(m.materialId),
            ...(m.hasOwnProperty('stockItemId') && { stockItemId: ensureStringId((m as any).stockItemId) })
          })) || []
        }

        const index = projects.value.findIndex(p =>
          ensureStringId(p._id || p._id) === id
        )
        if (index !== -1) {
          projects.value[index] = updatedProject
        }

        return updatedProject
      } else {
        throw new Error(response.message || 'Proje güncellenemedi')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Proje güncelleme hatası'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProject = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.delete(id)

      if (response.success) {
        projects.value = projects.value.filter(p =>
          ensureStringId(p._id) !== id
        )
      } else {
        throw new Error(response.message || 'Proje silinemedi')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Proje silme hatası'
      throw err
    } finally {
      loading.value = false
    }
  }
  const reserveProjectMaterials = async (projectId: string): Promise<ProjectOperationResult> => {
    try {
      const result = await projectsService.reserve(projectId)
      if (result.success) {
        const index = projects.value.findIndex(p => p._id === projectId)
        if (index !== -1) {
          projects.value[index] = result.data!
        }
      }
      return result
    } catch (err) {
      console.error('Rezervasyon hatası:', err)
      throw err
    }
  }

  const updateProjectStatus = async (projectId: string, status: string) => {
    return updateProject(projectId, { status } as any)
  }

  const completeProject = async (projectId: string) => {
    return updateProject(projectId, { status: 'completed' } as any)
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    projects.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    projects,
    loading,
    error,

    // Computed
    statistics,
    projectsByStatus,
    // Actions
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearError,
    reset,
    validateProject,
    reserveProjectMaterials,
    updateProjectStatus,
    completeProject
  }
})