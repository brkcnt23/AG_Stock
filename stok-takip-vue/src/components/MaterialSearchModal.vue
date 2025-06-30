<!-- components/MaterialSearchModal.vue - DÜZELTİLMİŞ -->
<template>
  <BaseModal 
    title="🔍 Malzeme Arama ve Seçim"
    size="extra-large"
    @close="$emit('close')"
  >
    <div class="material-search">
      <!-- Arama Filtreleri -->
      <div class="search-filters">
        <div class="filter-row">
          <div class="filter-group">
            <label>Malzeme Türü</label>
            <select v-model="filters.type" @change="searchMaterials">
              <option value="all">Tümü</option>
              <option value="sarf">📦 Sarf Malzemeler</option>
              <option value="celik">🔧 Çelik</option>
              <option value="membran">📄 Membran</option>
              <option value="halat">🔗 Halat</option>
              <option value="fitil">🧵 Fitil</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Arama</label>
            <input 
              v-model="filters.search" 
              type="text" 
              placeholder="Malzeme adı, kalite, açıklama ara..."
              @input="searchMaterials"
            >
          </div>
          
          <div class="filter-group">
            <label>Stok Durumu</label>
            <select v-model="filters.stockAvailable" @change="searchMaterials">
              <option value="">Tümü</option>
              <option value="true">Stokta Var</option>
              <option value="false">Stokta Yok</option>
            </select>
          </div>
        </div>
        
        <div class="filter-row">
          <div class="filter-group">
            <label>Kalite/Standart</label>
            <input 
              v-model="filters.kalite" 
              type="text" 
              placeholder="316L, S235, EN-AW..."
              @input="searchMaterials"
            >
          </div>
          
          <div class="filter-group">
            <label>Fiyat Aralığı (₺)</label>
            <div class="price-range">
              <input 
                v-model="filters.priceRange.min" 
                type="number" 
                placeholder="Min"
                @input="searchMaterials"
              >
              <span>-</span>
              <input 
                v-model="filters.priceRange.max" 
                type="number" 
                placeholder="Max"
                @input="searchMaterials"
              >
            </div>
          </div>
          
          <div class="filter-group">
            <button @click="clearFilters" class="btn btn-outline">
              🔄 Temizle
            </button>
            <button @click="showCustomMaterialForm = true" class="btn btn-success">
              ➕ Özel Malzeme
            </button>
          </div>
        </div>
      </div>

      <!-- Arama Sonuçları -->
      <div class="search-results">
        <div class="results-header">
          <h4>{{ searchResults.length }} malzeme bulundu</h4>
          <div class="view-options">
            <button 
              @click="viewMode = 'grid'" 
              :class="{ active: viewMode === 'grid' }"
              class="view-btn"
            >
              ⊞ Grid
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="{ active: viewMode === 'list' }"
              class="view-btn"
            >
              ☰ Liste
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Malzemeler aranıyor...</p>
        </div>

        <!-- Results Grid/List -->
        <div v-else-if="searchResults.length > 0" 
             :class="['results-container', viewMode]">
          <div v-for="material in searchResults" 
               :key="material.id" 
               class="material-card"
               @click="selectMaterial(material)">
            
            <!-- Material Header -->
            <div class="material-header">
              <div class="material-type">
                <span class="type-icon">{{ getMaterialTypeIcon(material.type) }}</span>
                <span class="type-label">{{ getMaterialTypeLabel(material.type) }}</span>
              </div>
              <div class="stock-status">
                <span v-if="material.stockAvailable" class="status-available">
                  ✅ Stokta: {{ material.availableStock }}
                </span>
                <span v-else class="status-missing">
                  ❌ Stokta Yok
                </span>
              </div>
            </div>

            <!-- Material Info -->
            <div class="material-info">
              <h5>{{ material.name }}</h5>
              <p class="description">{{ material.description || 'Açıklama yok' }}</p>
              
              <div class="specs">
                <span v-if="material.kalite" class="spec">
                  🔖 {{ material.kalite }}
                </span>
                <span v-if="material.cins" class="spec">
                  📦 {{ material.cins }}
                </span>
                <span v-if="material.specifications.en && material.specifications.boy" class="spec">
                  📏 {{ material.specifications.en }}×{{ material.specifications.boy }}mm
                </span>
              </div>
            </div>

            <!-- Price & Supplier -->
            <div class="material-footer">
              <div class="price-info">
                <span v-if="material.unitPrice" class="price">
                  {{ formatCurrency(material.unitPrice) }}/{{ material.unit }}
                </span>
                <span v-else class="no-price">Fiyat belirtilmemiş</span>
              </div>
              
              <div class="supplier-info">
                <small v-if="material.supplier">
                  🏭 {{ material.supplier }}
                </small>
              </div>
            </div>

            <!-- Selection Button -->
            <div class="selection-action">
              <button class="btn btn-primary select-btn">
                ✓ Seç
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-results">
          <div class="empty-icon">🔍</div>
          <h4>Malzeme bulunamadı</h4>
          <p>Arama kriterlerinizi değiştirmeyi deneyin veya özel malzeme ekleyin</p>
          <button @click="showCustomMaterialForm = true" class="btn btn-primary">
            ➕ Özel Malzeme Ekle
          </button>
        </div>
      </div>
    </div>

    <!-- Özel Malzeme Formu -->
    <CustomMaterialModal 
      v-if="showCustomMaterialForm"
      @close="showCustomMaterialForm = false"
      @save="addCustomMaterial"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import BaseModal from './BaseModal.vue'
import { useMaterialSearchStore } from '../store/materialSearchStore' // This file now exists
import CustomMaterialModal from './CustomMaterialModal.vue' // This file now exists

const emit = defineEmits<{
  close: []
  select: [material: any]
}>()

// Store
const materialSearchStore = useMaterialSearchStore()

// State
const loading = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const showCustomMaterialForm = ref(false)
const searchResults = ref<any[]>([])

// Filters
const filters = reactive({
  type: 'all',
  search: '',
  kalite: '',
  stockAvailable: '',
  priceRange: {
    min: '',
    max: ''
  }
})

// Methods
const searchMaterials = async () => {
  loading.value = true
  try {
    const results = await materialSearchStore.searchAllMaterials(filters)
    searchResults.value = results
  } catch (error) {
    console.error('Arama hatası:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  Object.assign(filters, {
    type: 'all',
    search: '',
    kalite: '',
    stockAvailable: '',
    priceRange: { min: '', max: '' }
  })
  searchMaterials()
}

const selectMaterial = (material: any) => {
  emit('select', material)
}

const getMaterialTypeIcon = (type: string) => {
  const icons = {
    'sarf': '📦',
    'celik': '🔧',
    'membran': '📄',
    'halat': '🔗',
    'fitil': '🧵'
  }
  return icons[type as keyof typeof icons] || '📋'
}

const getMaterialTypeLabel = (type: string) => {
  const labels = {
    'sarf': 'Sarf',
    'celik': 'Çelik',
    'membran': 'Membran',
    'halat': 'Halat',
    'fitil': 'Fitil'
  }
  return labels[type as keyof typeof labels] || type
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('tr-TR') + ' ₺'
}

const addCustomMaterial = (materialData: any) => {
  const customMaterial = materialSearchStore.createCustomMaterial(materialData)
  emit('select', customMaterial)
}

</script>

<style scoped>
.material-search {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 70vh;
}

.search-filters {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.filter-row:last-child {
  margin-bottom: 0;
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
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-range input {
  flex: 1;
}

.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.results-header h4 {
  margin: 0;
  color: #1e293b;
}

.view-options {
  display: flex;
  gap: 8px;
}

.view-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.loading-state,
.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.results-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.results-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.results-container.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.material-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.material-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.material-type {
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-icon {
  font-size: 1.2rem;
}

.type-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.stock-status {
  font-size: 12px;
}

.status-available {
  color: #10b981;
}

.status-missing {
  color: #ef4444;
}

.material-info h5 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 1rem;
}

.description {
  color: #6b7280;
  font-size: 13px;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.spec {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.material-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.price {
  font-weight: 600;
  color: #059669;
}

.no-price {
  color: #9ca3af;
  font-size: 12px;
}

.supplier-info small {
  color: #6b7280;
  font-size: 11px;
}

.selection-action {
  text-align: center;
}

.select-btn {
  width: 100%;
  padding: 8px;
  font-size: 13px;
}

.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 12px;
}

.btn-success {
  background: #10b981;
  color: white;
  padding: 6px 12px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 6px 12px;
}

.btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .results-container.grid {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>