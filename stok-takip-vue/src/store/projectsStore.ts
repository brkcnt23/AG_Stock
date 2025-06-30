// store/projectsStore.ts - GÜNCELLENMIŞ VE GENİŞLETİLMİŞ
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectsService } from '../api/projectsService'
import { useProjectMaterialStore } from './projectMaterialStore'
import type { Project } from '../types/projects'

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
        projects.value = response.data
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
      const materialStats = projectMaterialStore.getProjectStatistics(materials)

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

      const response = await projectsService.deleteItem(id)
      
      if (response.success) {
        projects.value = projects.value.filter(p => p._id !== id)
      } else {
        throw new Error(response.message || 'Proje silinemedi')
      }
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  const reserveProjectMaterials = async (id: string): Promise<ApiResponse<any>> {
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
      return {
        success: false,
        data: null,
        message: 'Rezerve edilirken hata oluştu'
      }
    }
  }

  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    try {
      loading.value = true
      error.value = null

      let response
      
      switch (status) {
        case 'reserved':
          response = await projectsService.reserve(projectId)
          break
        case 'active':
          response = await projectsService.start(projectId)
          await projectMaterialStore.startProject(projectId)
          break
        case 'completed':
          response = await projectsService.complete(projectId)
          await projectMaterialStore.completeProject(projectId)
          break
        default:
          response = await projectsService.updateItem(projectId, { status })
      }

      if (response.success) {
        const index = projects.value.findIndex(p => p._id === projectId)
        if (index > -1) {
          projects.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error(response.message || 'Durum güncellenemedi')
      }
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
    
    return projectMaterialStore.checkMaterialConflicts(project.materials)
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