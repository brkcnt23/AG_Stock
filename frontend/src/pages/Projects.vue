<!-- pages/Projects.vue - DÜZELTİLMİŞ -->
<template>
  <div class="projects-page">
    <PageHeader title="🏗️ Proje Yönetimi" subtitle="Proje Bazlı Malzeme Takibi ve Rezervasyon Sistemi"
      item-type="Proje" export-label="Proje Raporu" @add-item="openCreateProjectModal" @export="exportProjects" />

    <StatsGrid :statistics="projectStatistics" item-type="Proje" />

    <!-- Proje Filtreleri -->
    <div class="project-filters">
      <div class="filter-group">
        <label>Proje Durumu</label>
        <select v-model="statusFilter">
          <option value="">Tümü</option>
          <option value="planning">Planlama</option>
          <option value="reserved">Rezerve</option>
          <option value="active">Aktif</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Stok Yeterliliği</label>
        <select v-model="stockFilter">
          <option value="">Tümü</option>
          <option value="sufficient">Yeterli (%100)</option>
          <option value="partial">Kısmi (%50-99)</option>
          <option value="insufficient">Yetersiz (<%50)</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Arama</label>
        <input v-model="searchText" type="text" placeholder="Proje adı, müşteri ara...">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectStore.loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Projeler yükleniyor...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="projectStore.error" class="error-state">
      <div class="error-icon">❌</div>
      <p>{{ projectStore.error }}</p>
      <button @click="projectStore.fetchProjects()" class="btn btn-primary">
        Yeniden Dene
      </button>
    </div>

    <!-- Projeler Listesi -->
    <div v-else class="projects-grid">
      <div v-for="project in filteredProjects" :key="objectIdToString(project._id || '')" class="project-card">
        <!-- Proje Header -->
        <div class="project-header">
          <div class="project-info">
            <h3>{{ project.name }}</h3>
            <p class="project-code">{{ project.projectCode || 'Kod yok' }}</p>
            <p class="customer">👤 {{ project.customer || 'Müşteri belirtilmemiş' }}</p>
          </div>
          <div class="project-status">
            <span :class="getStatusClass(project.status)" class="status-badge">
              {{ getStatusLabel(project.status) }}
            </span>
            <div class="project-dates">
              <small>{{ formatDate(project.startDate ?? undefined) }} - {{ formatDate(project.endDate ?? undefined) }}</small>
            </div>
          </div>
        </div>

        <!-- Proje İstatistikleri -->
        <div class="project-stats">
          <div class="stat-item">
            <span class="stat-value">{{ project.totalItems || 0 }}</span>
            <span class="stat-label">Toplam Malzeme</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" :class="getStockSufficiencyClass(project.stockSufficiency || 0)">
              %{{ project.stockSufficiency || 0 }}
            </span>
            <span class="stat-label">Stok Yeterliliği</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ project.reservedItems || 0 }}</span>
            <span class="stat-label">Rezerve</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatCurrency(project.totalMaterialCost || 0) }}</span>
            <span class="stat-label">Malzeme Maliyeti</span>
          </div>
        </div>

        <!-- Stok Durumu Çubuğu -->
        <div class="stock-status-bar">
          <div class="status-segment available" :style="{ width: getAvailablePercentage(project) + '%' }">
          </div>
          <div class="status-segment reserved" :style="{ width: getReservedPercentage(project) + '%' }">
          </div>
          <div class="status-segment missing" :style="{ width: getMissingPercentage(project) + '%' }">
          </div>
        </div>
        <div class="status-legend">
          <span class="legend-item available">
            ✅ Mevcut: {{ project.availableItems || 0 }}
          </span>
          <span class="legend-item reserved">
            🔒 Rezerve: {{ project.reservedItems || 0 }}
          </span>
          <span class="legend-item missing">
            ❌ Eksik: {{ project.missingItems || 0 }}
          </span>
        </div>

        <!-- Proje Aksiyonları -->
        <div class="project-actions">
          <button @click="viewProjectDetails(project)" class="btn btn-info">
            👁️ Detaylar
          </button>

          <button v-if="project.status === 'planning'" @click="reserveMaterials(project)"
            :disabled="(project.availableItems || 0) === 0" class="btn btn-warning">
            🔒 Rezerve Et
          </button>

          <button v-if="project.status === 'reserved'" @click="startProject(project)" class="btn btn-success">
            ▶️ Projeyi Başlat
          </button>

          <button v-if="project.status === 'active'" @click="completeProject(project)" class="btn btn-primary">
            ✅ Tamamla
          </button>

          <button @click="editProject(project)" class="btn btn-secondary">
            ✏️ Düzenle
          </button>

          <button @click="deleteProject(project)" class="btn btn-danger">
            🗑️ Sil
          </button>
        </div>
      </div>

      <!-- Boş durum -->
      <div v-if="filteredProjects.length === 0" class="empty-projects">
        <div class="empty-icon">🏗️</div>
        <h3>Henüz proje yok</h3>
        <p>İlk projenizi oluşturmak için "Yeni Proje Ekle" butonunu kullanın</p>
        <button @click="openCreateProjectModal" class="btn btn-primary">
          ➕ İlk Proje Oluştur
        </button>
      </div>
    </div>

    <!-- Yeni Proje Modal -->
    <CreateProjectModal v-if="showCreateModal" @close="closeCreateModal" @save="saveProject" />

    <!-- Proje Detay Modal -->
    <ProjectDetailsModal v-if="showDetailsModal && selectedProject" :project="selectedProject"
      @close="closeDetailsModal" @reserve="reserveMaterials" @start="startProject" @complete="completeProject"
      @edit="editProject" />
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ObjectId } from 'mongodb'
import { objectIdToString, isValidObjectId } from '../utils/objectId'
import { useProjectsStore } from '../store/projectsStore'
import type { Project } from '../types/projects'
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import CreateProjectModal from '../components/CreateProjectModal.vue'
import ProjectDetailsModal from '../components/ProjectDetailsModal.vue'
import { useNotificationStore } from '../store/notificationStore'

// Store
const projectStore = useProjectsStore()

// State
const statusFilter = ref('')
const stockFilter = ref('')
const searchText = ref('')
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const selectedProject = ref<Project | null>(null)

// Computed
const filteredProjects = computed(() => {
  let projects = projectStore.projects

  // Status filter
  if (statusFilter.value) {
    projects = projects.filter((p: Project) => p.status === statusFilter.value)
  }

  // Stock filter
  if (stockFilter.value) {
    projects = projects.filter((p: Project) => {
      if (stockFilter.value === 'sufficient') return p.stockSufficiency === 100
      if (stockFilter.value === 'partial') return p.stockSufficiency >= 50 && p.stockSufficiency < 100
      if (stockFilter.value === 'insufficient') return p.stockSufficiency < 50
      return true
    })
  }

  // Search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    projects = projects.filter((p: Project) => 
      p.name.toLowerCase().includes(search) ||
      p.customer?.toLowerCase().includes(search) ||
      p.projectCode?.toLowerCase().includes(search)
    )
  }

  return projects
})

const projectStatistics = computed(() => ({
  totalItems: projectStore.projects.length,
  totalValue: projectStore.projects.reduce((sum: number, p: Project) => sum + (p.totalMaterialCost || 0), 0),
  lowStock: projectStore.projects.filter((p: Project) => p.stockSufficiency < 50).length,
  recentlyAdded: projectStore.projects.filter((p: Project) => {
    const createdDate = new Date(p.createdAt || '')
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return createdDate >= monthAgo
  }).length
}))

// Methods - ObjectId destekli
const openCreateProjectModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const saveProject = async (projectData: any) => {
  try {
    console.log('🚀 Projects.vue - saveProject çağrıldı');
    console.log('📤 Gönderilecek proje data:', projectData);
    
    console.log('🔍 ProjectStore createProject çağrılıyor...');
    await projectStore.createProject(projectData);
    
    console.log('✅ Proje başarıyla oluşturuldu');
    closeCreateModal();
    
  } catch (error) {
    console.error('❌ Projects.vue - Proje kayıt hatası:', error);
    alert('Proje kaydedilirken hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
  }
}

const viewProjectDetails = (project: Project) => {
  selectedProject.value = project
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedProject.value = null
}

const reserveMaterials = async (project: Project) => {
  try {
    const result = await projectStore.reserveProjectMaterials(project._id!)
    if (result.success) {
      useNotificationStore().addNotification({
        type: 'success',
        title: 'Başarılı',
        message: result.message
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    useNotificationStore().addNotification({
      type: 'error',
      title: 'Hata',
      message: error instanceof Error ? error.message : 'Rezervasyon yapılamadı'
    })
  }
}

const startProject = async (project: Project) => {
  try {
    const result = await projectStore.updateProjectStatus(project._id!, 'active')
    useNotificationStore().addNotification({
      type: 'success',
      title: 'Başarılı',
      message: 'Proje başarıyla başlatıldı'
    })
  } catch (error) {
    useNotificationStore().addNotification({
      type: 'error',
      title: 'Hata',
      message: 'Proje başlatılamadı'
    })
  }
}

const completeProject = async (project: Project) => {
  if (confirm(`"${project.name}" projesini tamamlamak istediğinizden emin misiniz?\n\nBu işlem malzemeleri stoktan düşecek!`)) {
    try {
      const projectId = project._id
      if (!projectId || !isValidObjectId(objectIdToString(projectId))) {
        throw new Error('Geçersiz proje ID')
      }
      
      await projectStore.completeProject(objectIdToString(projectId))
      alert('Proje tamamlandı! Malzemeler stoktan düşüldü.')
    } catch (error) {
      console.error('Proje tamamlama hatası:', error)
      alert('Proje tamamlanırken hata oluştu!')
    }
  }
}

const editProject = (project: Project) => {
  // Edit modal açılacak
  console.log('Edit project:', objectIdToString(project._id || ''))
}

const deleteProject = async (project: Project) => {
  if (confirm(`"${project.name}" projesini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
    try {
      const projectId = project._id
      if (!projectId || !isValidObjectId(objectIdToString(projectId))) {
        throw new Error('Geçersiz proje ID')
      }
      
      await projectStore.deleteProject(objectIdToString(projectId))
      alert('Proje silindi!')
    } catch (error) {
      console.error('Proje silme hatası:', error)
      alert('Proje silinirken hata oluştu!')
    }
  }
}

const exportProjects = () => {
  // CSV export logic
  console.log('Export projects')
}

// Utility methods (aynı kalır)
const getStatusClass = (status: string) => {
  const classes = {
    'planning': 'status-planning',
    'reserved': 'status-reserved', 
    'active': 'status-active',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return classes[status as keyof typeof classes] || 'status-default'
}

const getStatusLabel = (status: string) => {
  const labels = {
    'planning': 'Planlama',
    'reserved': 'Rezerve',
    'active': 'Aktif',
    'completed': 'Tamamlandı', 
    'cancelled': 'İptal'
  }
  return labels[status as keyof typeof labels] || status
}

const getStockSufficiencyClass = (percentage: number) => {
  if (percentage === 100) return 'sufficient'
  if (percentage >= 50) return 'partial'
  return 'insufficient'
}

const getAvailablePercentage = (project: Project) => {
  return Math.round((project.availableItems / project.totalItems) * 100)
}

const getReservedPercentage = (project: Project) => {
  return Math.round((project.reservedItems / project.totalItems) * 100)
}

const getMissingPercentage = (project: Project) => {
  return Math.round((project.missingItems / project.totalItems) * 100)
}

const formatCurrency = (amount: number = 0) => {
  return amount.toLocaleString('tr-TR') + ' ₺'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

// Lifecycle
onMounted(() => {
  projectStore.fetchProjects()
})
</script>

<style scoped>
.projects-page {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

/* Filters */
.project-filters {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.filter-group select,
.filter-group input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
}


/* Project Header */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.project-info h3 {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 1.2rem;
}

.project-code {
  color: #6b7280;
  font-size: 13px;
  margin: 0 0 5px 0;
  font-family: monospace;
}

.customer {
  color: #374151;
  font-size: 14px;
  margin: 0;
}

.project-status {
  text-align: right;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-planning {
  background: #fef3c7;
  color: #92400e;
}

.status-reserved {
  background: #e0e7ff;
  color: #3730a3;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-completed {
  background: #f0f9ff;
  color: #0369a1;
}

.status-cancelled {
  background: #fef2f2;
  color: #991b1b;
}

.project-dates {
  margin-top: 5px;
}

.project-dates small {
  color: #9ca3af;
  font-size: 11px;
}

/* Project Stats */
.project-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-value.sufficient {
  color: #10b981;
}

.stat-value.partial {
  color: #f59e0b;
}

.stat-value.insufficient {
  color: #ef4444;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Stock Status Bar */
.stock-status-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  display: flex;
}

.status-segment {
  height: 100%;
  transition: width 0.5s ease;
}

.status-segment.available {
  background: #10b981;
}

.status-segment.reserved {
  background: #f59e0b;
}

.status-segment.missing {
  background: #ef4444;
}

.status-legend {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.legend-item {
  font-size: 11px;
  color: #6b7280;
}

/* Project Actions */
.project-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-info {
  background: #e0f2fe;
  color: #0369a1;
}

.btn-warning {
  background: #fef3c7;
  color: #92400e;
}

.btn-success {
  background: #dcfce7;
  color: #166534;
}

.btn-primary {
  background: #dbeafe;
  color: #1e40af;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-danger {
  background: #fef2f2;
  color: #dc2626;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty Projects */
.empty-projects {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-projects h3 {
  color: #374151;
  margin: 0 0 10px 0;
}

.empty-projects p {
  margin: 0 0 20px 0;
  max-width: 400px;
}

/* Responsive */
@media (max-width: 768px) {
  .projects-page {
    padding: 10px;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project-header {
    flex-direction: column;
    gap: 10px;
  }

  .project-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-legend {
    flex-direction: column;
    gap: 2px;
  }

  .project-actions {
    justify-content: center;
  }
}
</style>