<!-- frontend/src/pages/HalatPage.vue - Fixed TypeScript errors -->
<template>
  <div class="halat-page">
    <PageHeader 
      title="Halat Yönetimi" 
      :breadcrumbs="['Ana Sayfa', 'Malzemeler', 'Halat']"
    />

    <!-- Stats Grid -->
    <StatsGrid :statistics="halatStatistics" item-type="halat" />

    <!-- Filters and Controls -->
    <div class="content-section">
      <div class="filters-bar">
        <!-- Search -->
        <div class="search-group">
          <div class="search-box">
            <input 
              v-model="searchText" 
              type="text" 
              placeholder="Halat ara (ad, kalite, cins...)"
              class="search-input"
              @input="debouncedSearch"
            />
            <i class="search-icon">🔍</i>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="filter-group">
          <select v-model="filters.status" class="filter-select" @change="applyFilters">
            <option value="">Tüm Durumlar</option>
            <option value="stokta">Stokta</option>
            <option value="tukendi">Tükendi</option>
            <option value="kritik">Kritik Seviye</option>
          </select>
          
          <select v-model="filters.type" class="filter-select" @change="applyFilters">
            <option value="">Tüm Tipler</option>
            <option value="celik">Çelik Halat</option>
            <option value="sentetik">Sentetik Halat</option>
            <option value="karma">Karma Halat</option>
          </select>
          
          <button @click="clearFilters" class="btn btn-outline" :disabled="!hasActiveFilters">
            🗑️ Filtreleri Temizle
          </button>
        </div>

        <!-- Actions -->
        <div class="action-group">
          <button @click="refreshData" class="btn btn-outline" :disabled="loading">
            🔄 Yenile
          </button>
          <button @click="exportData" class="btn btn-outline" :disabled="loading || halats.length === 0">
            📊 Export
          </button>
          <button @click="openCreateModal" class="btn btn-primary">
            ➕ Yeni Halat
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-section">
        <BaseDataTable
          title="Halat Listesi"
          item-type="halat"
          :paginated-data="halats"
          :filtered-count="pagination.totalCount"
          :total-items="pagination.totalCount"
          :current-page="pagination.page"
          :items-per-page="pagination.limit"
          :current-density="tableDensity"
          :loading="loading"
          :error="error"
          :selectable="false"
          empty-message="Henüz halat kaydı bulunmuyor"
          :low-stock-threshold="10"
          :critical-stock-threshold="5"
          @page-change="handlePageChange"
          @density-change="handleDensityChange"
          @export="exportData"
          @add-new="openCreateModal"
          @edit="openEditModal"
          @delete="handleDelete"
          @stock-update="openStockModal"
        />
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Yükleniyor...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error && !loading" class="error-message">
      <div class="error-content">
        <h3>⚠️ Bir hata oluştu</h3>
        <p>{{ error }}</p>
        <button @click="clearError" class="btn btn-primary">Tamam</button>
      </div>
    </div>

    <!-- Modals -->
    <HalatModal 
      v-if="showCreateModal" 
      :halat="null"
      @close="closeCreateModal"
      @save="handleCreate"
    />
    
    <HalatModal 
      v-if="showEditModal && selectedHalat" 
      :halat="selectedHalat"
      @close="closeEditModal"
      @save="handleUpdate"
    />
    
    <StockUpdateModal
      v-if="showStockModal && selectedHalat"
      :item="selectedHalat"
      item-type="halat"
      @close="closeStockModal"
      @save="handleStockUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, storeToRefs } from 'vue'
import { useHalatStore } from '../store/halatStore'
import { useNotificationStore } from '../store/notificationStore'
import type { HalatItem, CreateHalatData, UpdateHalatData, HalatStockOperation } from '../types/halat'
import { debounce } from '../utils/debounce'
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import BaseDataTable from '../components/BaseDataTable.vue'
import HalatModal from '../components/HalatModal.vue'
import StockUpdateModal from '../components/StockUpdateModal.vue'

// Stores
const halatStore = useHalatStore()
const notificationStore = useNotificationStore()

// Reactive state
const searchText = ref('')
const tableDensity = ref<'compact' | 'normal' | 'detailed'>('normal')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showStockModal = ref(false)
const selectedHalat = ref<HalatItem | null>(null)

// Local filters (synced with store)
const filters = ref<{
  status: '' | 'stokta' | 'tukendi' | 'kritik'
  type: '' | 'celik' | 'sentetik' | 'karma'
  tedarikci: string
  depo: string
}>({
  status: '',
  type: '',
  tedarikci: '',
  depo: ''
})

// Computed properties from store
const { 
  halats, 
  loading, 
  error, 
  pagination, 
  totalItems,
  inStockHalats,
  outOfStockHalats,
  criticalStockHalats,
  stockSufficiency 
} = storeToRefs(halatStore)

// Computed statistics for StatsGrid
const halatStatistics = computed(() => ({
  totalItems: totalItems.value,
  totalValue: halats.value.reduce((sum: number, h: HalatItem) => sum + ((h.birimFiyat || 0) * h.stok), 0),
  lowStock: criticalStockHalats.value.length,
  recentlyAdded: halats.value
    .filter((h: HalatItem) => {
      const created = h.createdAt ? new Date(h.createdAt) : null
      if (!created) return false
      const now = new Date()
      const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      return diff <= 7 // last 7 days
    }).length
}))

const hasActiveFilters = computed(() => {
  return searchText.value !== '' || 
         filters.value.status !== '' || 
         filters.value.type !== '' ||
         filters.value.tedarikci !== '' ||
         filters.value.depo !== ''
})

// Debounced search
const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

// Methods
const loadData = async (resetPage = false) => {
  try {
    if (resetPage) {
      halatStore.setPage(1)
    }
    
    await halatStore.fetchHalats({
      search: searchText.value,
      status: filters.value.status || undefined,
      type: filters.value.type || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit
    })
    
    // Load stats in parallel
    halatStore.fetchStats()
  } catch (err) {
    console.error('Data loading failed:', err)
  }
}

const applyFilters = () => {
  halatStore.updateFilters({
    search: searchText.value,
    status: filters.value.status,
    type: filters.value.type,
    tedarikci: filters.value.tedarikci,
    depo: filters.value.depo
  })
  loadData(true)
}

const clearFilters = () => {
  searchText.value = ''
  filters.value = {
    status: '',
    type: '',
    tedarikci: '',
    depo: ''
  }
  halatStore.resetFilters()
  loadData(true)
}

const refreshData = () => {
  loadData()
}

const exportData = () => {
  try {
    halatStore.exportHalats()
    notificationStore.addNotification({
      type: 'success',
      title: 'Export Başarılı',
      message: 'Halat verileri Excel dosyası olarak indirildi'
    })
  } catch (err) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Export Hatası',
      message: 'Export işlemi başarısız oldu'
    })
  }
}

// Pagination handlers
const handlePageChange = (page: number) => {
  halatStore.setPage(page)
  loadData()
}

const handleDensityChange = (density: 'compact' | 'normal' | 'detailed') => {
  tableDensity.value = density
}

// Modal handlers
const openCreateModal = () => {
  selectedHalat.value = null
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  selectedHalat.value = null
}

const openEditModal = (halat: HalatItem) => {
  selectedHalat.value = halat
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedHalat.value = null
}

const openStockModal = (halat: HalatItem) => {
  selectedHalat.value = halat
  showStockModal.value = true
}

const closeStockModal = () => {
  showStockModal.value = false
  selectedHalat.value = null
}

// CRUD operations
const handleCreate = async (data: CreateHalatData) => {
  try {
    await halatStore.createHalat(data)
    
    notificationStore.addNotification({
      type: 'success',
      title: 'Başarılı',
      message: 'Yeni halat başarıyla eklendi'
    })
    
    closeCreateModal()
    refreshData()
  } catch (err) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Hata',
      message: 'Halat eklenirken bir hata oluştu'
    })
  }
}

const handleUpdate = async (data: UpdateHalatData) => {
  try {
    if (!selectedHalat.value) return
    
    await halatStore.updateHalat(selectedHalat.value._id, data)
    
    notificationStore.addNotification({
      type: 'success',
      title: 'Başarılı',
      message: 'Halat bilgileri başarıyla güncellendi'
    })
    
    closeEditModal()
    refreshData()
  } catch (err) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Hata',
      message: 'Halat güncellenirken bir hata oluştu'
    })
  }
}

const handleDelete = async (halat: HalatItem) => {
  try {
    const confirmed = confirm(`"${halat.name}" adlı halatı silmek istediğinizden emin misiniz?`)
    if (!confirmed) return
    
    await halatStore.deleteHalat(halat._id)
    
    notificationStore.addNotification({
      type: 'success',
      title: 'Başarılı',
      message: 'Halat başarıyla silindi'
    })
    
    refreshData()
  } catch (err) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Hata',
      message: 'Halat silinirken bir hata oluştu'
    })
  }
}

const handleStockUpdate = async (stockData: HalatStockOperation) => {
  try {
    if (!selectedHalat.value) return
    
    await halatStore.updateStock(selectedHalat.value._id, stockData)
    
    notificationStore.addNotification({
      type: 'success',
      title: 'Başarılı',
      message: 'Stok başarıyla güncellendi'
    })
    
    closeStockModal()
    refreshData()
  } catch (err) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Hata',
      message: 'Stok güncellenirken bir hata oluştu'
    })
  }
}

const clearError = () => {
  halatStore.clearError()
}

// Watchers
watch(() => filters.value, () => {
  applyFilters()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.halat-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

.content-section {
  margin-top: 24px;
}

/* Filters Bar */
.filters-bar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
  background: white;
}

.action-group {
  display: flex;
  gap: 12px;
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.error-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
}

.error-content h3 {
  margin: 0 0 16px 0;
  color: #dc2626;
}

.error-content p {
  margin: 0 0 24px 0;
  color: #6b7280;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Responsive */
@media (max-width: 768px) {
  .halat-page {
    padding: 16px;
  }
  
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-group,
  .action-group {
    flex-direction: column;
  }
  
  .search-group {
    min-width: auto;
  }
}
</style>