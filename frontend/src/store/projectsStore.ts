// src/store/projectsStore.ts - Safe Access ile düzeltilmiş

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectsService } from '../api/projectsService'
import type { ProjectItem } from '../types/common'

const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<ProjectItem[]>([])
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
    const totalValue = projects.value.reduce((sum, p) => sum + (p.estimatedCost || 0), 0)

    return {
      totalItems: projects.value.length,
      totalValue: totalValue,  // ✅ FIXED: Now returns number
      lowStock: 0,
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

  // Actions
  const fetchProjects = async (params?: any) => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.getItems<ProjectItem>(params)

      if (response.success) {
        // Normalize IDs to strings with safe access
        projects.value = response.data.map(project => ({
          ...project,
          id: ensureStringId(project._id || project.id),
          materials: project.materials?.map(m => ({
            ...m,
            // ✅ SAFE ACCESS - sadece property varsa ID'yi dönüştür
            ...(m.hasOwnProperty('id') && { id: ensureStringId((m as any).id) }),
            materialId: ensureStringId(m.materialId),
            ...(m.hasOwnProperty('stockItemId') && { stockItemId: ensureStringId((m as any).stockItemId) })
          })) || []
        }))
      } else {
        throw new Error(response.message || 'Projeler getirilemedi')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Bilinmeyen hata'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: Partial<ProjectItem>) => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.createItem<ProjectItem>(projectData)

      if (response.success) {
        const newProject = {
          ...response.data,
          id: ensureStringId(response.data._id || response.data.id),
          // Materials ID'lerini de normalize et
          materials: response.data.materials?.map(m => ({
            ...m,
            ...(m.hasOwnProperty('id') && { id: ensureStringId((m as any).id) }),
            materialId: ensureStringId(m.materialId),
            ...(m.hasOwnProperty('stockItemId') && { stockItemId: ensureStringId((m as any).stockItemId) })
          })) || []
        }
        projects.value.unshift(newProject)
        return newProject
      } else {
        throw new Error(response.message || 'Proje oluşturulamadı')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Proje oluşturma hatası'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id: string, projectData: Partial<ProjectItem>) => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.updateItem<ProjectItem>(id, projectData)

      if (response.success) {
        const updatedProject = {
          ...response.data,
          id: ensureStringId(response.data._id || response.data.id),
          // Materials ID'lerini de normalize et
          materials: response.data.materials?.map(m => ({
            ...m,
            ...(m.hasOwnProperty('id') && { id: ensureStringId((m as any).id) }),
            materialId: ensureStringId(m.materialId),
            ...(m.hasOwnProperty('stockItemId') && { stockItemId: ensureStringId((m as any).stockItemId) })
          })) || []
        }

        const index = projects.value.findIndex(p =>
          ensureStringId(p._id || p.id) === id
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

      const response = await projectsService.deleteItem<ProjectItem>(id)

      if (response.success) {
        projects.value = projects.value.filter(p =>
          ensureStringId(p._id || p.id) !== id
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
  const reserveProjectMaterials = async (projectId: string, materials: any[]) => {
    // Implementation here
    console.log('Reserve materials:', projectId, materials)
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
    reserveProjectMaterials,
    updateProjectStatus, 
    completeProject,
    // Actions
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearError,
    reset
  }
})