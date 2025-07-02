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
    console.log('🔍 validateProject başlatıldı');

    const errors: string[] = []

    if (!project.name?.trim()) {
      console.log('❌ Proje adı eksik');
      errors.push('Proje adı gerekli')
    }
    if (!project.materials?.length) {
      console.log('❌ Malzeme listesi eksik');
      errors.push('En az bir malzeme eklenmeli')
    }

    // Check material stocks
    const insufficientMaterials = []
    console.log('🔍 Malzeme stok kontrolü başlatılıyor...');

    for (let i = 0; i < (project.materials || []).length; i++) {
      const material = project.materials![i];

      try {
        // Null/undefined kontrol
        if (!material.materialId || !material.materialType || !material.requestedQuantity) {
          console.error(`❌ Malzeme [${i}] eksik alanlar:`, {
            materialId: material.materialId,
            materialType: material.materialType,
            requestedQuantity: material.requestedQuantity
          });
          errors.push(`Malzeme ${i + 1}: Eksik bilgiler`);
          continue;
        }

        const stockCheck = await projectsService.checkMaterialStock(
          material.materialId,
          material.materialType,
          material.requestedQuantity
        );

        // Response structure kontrol
        if (!stockCheck || !stockCheck.data) {
          console.error(`❌ Geçersiz stok response [${i}]:`, stockCheck);
          errors.push(`Malzeme ${i + 1}: Stok kontrolü başarısız`);
          continue;
        }

        const { available, found, availableStock } = stockCheck.data;

        if (!found) {
          console.log(`❌ Malzeme bulunamadı [${i}]:`, material.materialId);
          errors.push(`Malzeme ${i + 1}: Sistemde bulunamadı`);
          continue;
        }

        if (!available) {
          console.log(`❌ Stok yetersiz [${i}]:`, material.materialId);
          insufficientMaterials.push({
            materialId: material.materialId,
            materialType: material.materialType,
            requested: material.requestedQuantity,
            available: availableStock || 0
          });
        }
      } catch (err) {
        console.error(`❌ Stok kontrolü hatası [${i}]:`, material.materialId, err);
        errors.push(
          `Malzeme ${i + 1}: Stok kontrolü hatası - ${err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }

    const result = {
      isValid: errors.length === 0 && insufficientMaterials.length === 0,
      errors,
      insufficientMaterials: insufficientMaterials.length ? insufficientMaterials : undefined
    };
    return result;
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
  const createProject = async (projectData: Partial<Project>) => {
    try {
      console.log('🏪 ProjectsStore - createProject başlatıldı');

      loading.value = true;
      error.value = null;

      // Validate first
      const validation = await validateProject(projectData as Project);

      if (!validation.isValid) {
        console.log('❌ Validasyon başarısız:', validation.errors);
        throw new Error(validation.errors.join(', '));
      }

      const response = await projectsService.create(projectData);
      console.log('📥 API yanıtı:', response);

      if (response.success && response.data) {
        projects.value.push(response.data);
        console.log('✅ Proje store\'a eklendi');
      } else {
        throw new Error(response.message || 'Proje oluşturulamadı');
      }

      return response.data;
    } catch (err) {
      console.error('❌ ProjectsStore - createProject hatası:', err);
      error.value = err instanceof Error ? err.message : 'Proje oluşturma hatası';
      throw err;
    } finally {
      loading.value = false;
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

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      loading.value = true
      error.value = null

      // Basit status update için PUT endpoint'i kullan
      const response = await projectsService.update(projectId, { status } as any)

      if (response.success && response.data) {
        // Store'daki projeyi güncelle
        const index = projects.value.findIndex(p => p._id === projectId)
        if (index !== -1) {
          projects.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error(response.message || 'Status güncellenemedi')
      }
    } catch (err: any) {
      error.value = err.message || 'Status güncelleme hatası'
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeProject = async (projectId: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.complete(projectId)

      if (response.success && response.data) {
        const index = projects.value.findIndex(p => p._id === projectId)
        if (index !== -1) {
          projects.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error(response.message || 'Proje tamamlanamadı')
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Tamamlama hatası'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reserveProjectMaterials = async (projectId: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await projectsService.reserveMaterials(projectId)

      if (response.success) {
        const index = projects.value.findIndex(p => p._id === projectId)
        if (index !== -1) {
          projects.value[index] = response.data
        }
        return response
      } else {
        throw new Error(response.message || 'Rezervasyon başarısız')
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Rezervasyon hatası'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
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