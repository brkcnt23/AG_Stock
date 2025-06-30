// store/projectsStore.ts - DÜZELTİLMİŞ
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectsService } from '../api/projectsService'
import { useProjectMaterialStore } from './projectMaterialStore'
import type { Project } from '../types/projects'
import type { ApiResponse } from '../types/common'

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Store references
  const projectMaterialStore = useProjectMaterialStore()

  // Computed
  const statistics = computed(() => {
    return {
      totalItems: projects.value.length,
      totalValue: projects.value.reduce((sum, p) => sum + (p.totalMaterialCost || 0), 0),
      lowStock: projects.value.filter(p => p.stockSufficiency < 50).length,
      recentlyAdded: projects.value.filter(p => {
        const created = new Date(p.createdAt || '')
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return created >= weekAgo
      }).length
    }
  })

  const projectsByStatus = computed(() => {
    const grouped = {
      planning: [] as Project[],
      reserved: [] as Project[],
      active: [] as Project[],
      completed: [] as Project[],
      cancelled: [] as Project[]
    }

    projects.value.forEach(project => {
      if (grouped[project.status]) {
        grouped[project.status].push(project)
      }
    })

    return grouped
  })

  // Actions
  const fetchProjects = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.getItems()

      if (response.success) {
        projects.value = response.data as Project[]
      } else {
        error.value = response.message || 'Projeler yüklenemedi'
      }
    } catch (err) {
      error.value = 'Projeler yüklenirken hata oluştu'
      console.error('Projects fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: Partial<Project>) => {
    try {
      loading.value = true
      error.value = null

      // Malzeme istatistiklerini hesapla
      const materials = projectData.materials || []
      // availableStock'u undefined ise 0 yaparak tip uyumsuzluğunu gider
      const normalizedMaterials = materials.map(m => ({
        ...m,
        availableStock: m.availableStock === undefined ? 0 : m.availableStock,
        id: typeof m.id === 'string' ? m.id : (m.id ? m.id.toString() : ''),
        materialId: m.materialId === undefined
          ? undefined
          : (typeof m.materialId === 'string'
              ? m.materialId
              : (m.materialId ? m.materialId.toString() : undefined)),
        stockItemId: m.stockItemId === undefined
          ? undefined
          : (typeof m.stockItemId === 'string'
              ? m.stockItemId
              : (m.stockItemId ? m.stockItemId.toString() : undefined))
      }))
      const materialStats = projectMaterialStore.getProjectStatistics(normalizedMaterials)

      const finalProjectData = {
        ...projectData,
        ...materialStats,
        totalMaterialCost: materials.reduce((sum, m) => sum + (m.totalPrice || 0), 0),
        status: 'planning' as const
      }

      const response = await projectsService.createItem(finalProjectData)

      if (response.success) {
        projects.value.unshift(response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Proje oluşturulamadı')
      }
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.updateItem(id, projectData)

      if (response.success) {
        const index = projects.value.findIndex(p => p._id === id)
        if (index > -1) {
          projects.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error(response.message || 'Proje güncellenemedi')
      }
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProject = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      console.log('🗑️ Proje siliniyor:', id)

      const response = await projectsService.deleteItem(id)

      if (response.success) {
        // Store'dan kaldır
        projects.value = projects.value.filter(p => p._id !== id)
        console.log('✅ Proje store\'dan kaldırıldı:', id)
      } else {
        throw new Error(response.message || 'Proje silinemedi')
      }
    } catch (err) {
      console.error('❌ Proje silme hatası:', err)
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Ayrıca güvenli silme için yardımcı method
  const forceDeleteProject = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      // Direkt API çağrısı
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()

        // Store'dan kaldır
        projects.value = projects.value.filter(p => p._id !== id)
        console.log('✅ Proje zorla silindi:', id)

        return { success: true, message: 'Proje silindi' }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme başarısız')
      }
    } catch (err) {
      console.error('❌ Zorla silme hatası:', err)
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  const reserveProjectMaterials = async (id: string): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      const project = projects.value.find(p => p._id === id)
      if (!project) {
        throw new Error('Proje bulunamadı')
      }

      if (project.status !== 'planning') {
        throw new Error('Sadece planlama aşamasındaki projeler rezerve edilebilir')
      }

      // Malzemeler için rezervasyon kontrolü
      const normalizedMaterials = project.materials.map(m => ({
        ...m,
        availableStock: m.availableStock === undefined ? 0 : m.availableStock,
        id: typeof m.id === 'string' ? m.id : (m.id ? m.id.toString() : ''),
        materialId: m.materialId === undefined
          ? undefined
          : (typeof m.materialId === 'string'
              ? m.materialId
              : (m.materialId ? m.materialId.toString() : undefined)),
        stockItemId: m.stockItemId === undefined
          ? undefined
          : (typeof m.stockItemId === 'string'
              ? m.stockItemId
              : (m.stockItemId ? m.stockItemId.toString() : undefined))
      }))
      const conflicts = projectMaterialStore.checkMaterialConflicts(normalizedMaterials)
      if (conflicts.length > 0) {
        throw new Error('Stok yetersizliği nedeniyle rezervasyon yapılamıyor')
      }

      // Her malzeme için rezervasyon yap
      for (const material of project.materials) {
        if (material.stockAvailable && material.materialId) {
          // availableStock'u undefined ise 0 yaparak tip uyumsuzluğunu gider
          const normalizedMaterial = {
            ...material,
            availableStock: material.availableStock === undefined ? 0 : material.availableStock,
            id: typeof material.id === 'string' ? material.id : (material.id ? material.id.toString() : ''),
            materialId: material.materialId === undefined
              ? undefined
              : (typeof material.materialId === 'string'
                  ? material.materialId
                  : (material.materialId ? material.materialId.toString() : undefined)),
            stockItemId: material.stockItemId === undefined
              ? undefined
              : (typeof material.stockItemId === 'string'
                  ? material.stockItemId
                  : (material.stockItemId ? material.stockItemId.toString() : undefined))
          }
          await projectMaterialStore.reserveMaterial(id, project.name, normalizedMaterial)
        }
      }

      // Proje durumunu güncelle
      const updatedProject = { ...project, status: 'reserved' as const }
      await updateProject(id, updatedProject)

      return true

    } catch (err) {
      error.value = (err as Error).message
      return false
    } finally {
      loading.value = false
    }
  }

  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    try {
      loading.value = true
      error.value = null

      const project = projects.value.find(p => p._id === projectId)
      if (!project) {
        throw new Error('Proje bulunamadı')
      }

      // Durum değişikliğine göre işlem yap
      switch (status) {
        case 'active':
          await projectMaterialStore.startProject(projectId)
          break
        case 'completed':
          await projectMaterialStore.completeProject(projectId)
          break
      }

      // Proje durumunu güncelle
      const updatedProject = { ...project, status }
      await updateProject(projectId, updatedProject)

      return updatedProject

    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeProject = async (projectId: string) => {
    try {
      // Önce material store üzerinden tamamlama işlemini yap
      await projectMaterialStore.completeProject(projectId)

      // Sonra proje durumunu güncelle
      await updateProjectStatus(projectId, 'completed')
    } catch (err) {
      error.value = (err as Error).message
      throw err
    }
  }

  const getProjectById = (id: string): Project | undefined => {
    return projects.value.find(p => p._id === id)
  }

  const getProjectsByStatus = (status: Project['status']): Project[] => {
    return projects.value.filter(p => p.status === status)
  }

  const searchProjects = (query: string): Project[] => {
    if (!query.trim()) return projects.value

    const searchTerm = query.toLowerCase()
    return projects.value.filter(project =>
      project.name.toLowerCase().includes(searchTerm) ||
      project.customer?.toLowerCase().includes(searchTerm) ||
      project.projectCode?.toLowerCase().includes(searchTerm) ||
      project.description?.toLowerCase().includes(searchTerm)
    )
  }

  const getProjectMaterialConflicts = (projectId: string) => {
    const project = getProjectById(projectId)
    if (!project) return []

    // Normalize fields to always be string and availableStock to always be a number
    const normalizedMaterials = project.materials.map(m => ({
      ...m,
      availableStock: m.availableStock === undefined ? 0 : m.availableStock,
      id: typeof m.id === 'string' ? m.id : (m.id ? m.id.toString() : ''),
      materialId: m.materialId === undefined
        ? undefined
        : (typeof m.materialId === 'string'
            ? m.materialId
            : (m.materialId ? m.materialId.toString() : undefined)),
      stockItemId: m.stockItemId === undefined
        ? undefined
        : (typeof m.stockItemId === 'string'
            ? m.stockItemId
            : (m.stockItemId ? m.stockItemId.toString() : undefined))
    }))
    return projectMaterialStore.checkMaterialConflicts(normalizedMaterials)
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
    reserveProjectMaterials,
    updateProjectStatus,
    completeProject,
    getProjectById,
    getProjectsByStatus,
    searchProjects,
    getProjectMaterialConflicts,
    clearError,
    reset
  }
})