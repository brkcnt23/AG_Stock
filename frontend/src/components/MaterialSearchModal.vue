<!-- components/MaterialSearchModal.vue - TAMAMEN YENİLENMİŞ -->
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
              @input="debounceSearch"
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
              @input="debounceSearch"
            >
          </div>
          
          <div class="filter-group">
            <label>Fiyat Aralığı (₺)</label>
            <div class="price-range">
              <input 
                v-model="filters.priceRange.min" 
                type="number" 
                placeholder="Min"
                @input="debounceSearch"
              >
              <span>-</span>
              <input 
                v-model="filters.priceRange.max" 
                type="number" 
                placeholder="Max"
                @input="debounceSearch"
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
               :class="{ 'out-of-stock': !material.stockAvailable }">
            
            <!-- Material Header -->
            <div class="material-header">
              <div class="material-type">
                <span class="type-icon">{{ getMaterialTypeIcon(material.type) }}</span>
                <span class="type-label">{{ getMaterialTypeLabel(material.type) }}</span>
              </div>
              <div class="stock-status">
                <span v-if="material.stockAvailable" class="status-available">
                  ✅ Stokta: {{ material.availableStock }} {{ material.unit }}
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
                <span v-if="material.specifications.renk" class="spec">
                  🎨 {{ material.specifications.renk }}
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

            <!-- Quantity Selection & Add Button -->
            <div class="material-actions">
              <div class="quantity-selector">
                <label>Miktar:</label>
                <div class="quantity-input-group">
                  <button 
                    @click="decreaseQuantity(material)" 
                    class="qty-btn"
                    :disabled="getQuantity(material.id) <= 1"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    :value="getQuantity(material.id)" 
                    @input="setQuantity(material.id, $event && $event.target && 'value' in $event.target ? ($event.target as HTMLInputElement).value : 1)"
                    min="1" 
                    :max="material.stockAvailable ? material.availableStock : 999"
                    class="qty-input"
                  >
                  <button 
                    @click="increaseQuantity(material)" 
                    class="qty-btn"
                    :disabled="material.stockAvailable && getQuantity(material.id) >= material.availableStock"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                @click="selectMaterial(material)" 
                class="btn btn-primary select-btn"
                :disabled="!material.stockAvailable && material.type !== 'custom'"
              >
                ➕ Projeye Ekle
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-results">
          <div class="empty-icon">🔍</div>
          <h4>Malzeme bulunamadı</h4>
          <p>
            <span v-if="filters.type !== 'all'">
              "{{ getMaterialTypeLabel(filters.type) }}" kategorisinde 
            </span>
            arama kriterlerinize uygun malzeme bulunamadı.
          </p>
          <div class="empty-actions">
            <button @click="clearFilters" class="btn btn-secondary">
              🔄 Filtreleri Temizle
            </button>
            <button @click="showCustomMaterialForm = true" class="btn btn-primary">
              ➕ Özel Malzeme Ekle
            </button>
          </div>
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import CustomMaterialModal from './CustomMaterialModal.vue'
import { useMaterialSearchStore } from '../store/materialSearchStore'
import { useSarfStore } from '../store/sarfStore'
import { useCelikStore } from '../store/celikStore'
import { useMembranStore } from '../store/membranStore'
import { useHalatStore } from '../store/halatStore'
import { useFitilStore } from '../store/fitilStore'

const emit = defineEmits<{
  close: []
  select: [material: any]
}>()

// Stores
const materialSearchStore = useMaterialSearchStore()
const sarfStore = useSarfStore()
const celikStore = useCelikStore()
const membranStore = useMembranStore()
const halatStore = useHalatStore()
const fitilStore = useFitilStore()

// State
const loading = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const showCustomMaterialForm = ref(false)
const searchResults = ref<any[]>([])
const quantities = ref<Record<string, number>>({})

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

// Debounce için timer
let searchTimer: NodeJS.Timeout | null = null

// Methods
const searchMaterials = async () => {
  loading.value = true
  try {
    console.log('🔍 Malzeme aranıyor:', filters)
    
    let results: any[] = []
    
    // Seçilen türe göre arama yap
    if (filters.type === 'all' || filters.type === 'sarf') {
      const sarfItems = sarfStore.items
        .filter(item => matchesFilters(item, 'sarf'))
        .map(item => convertToUnified(item, 'sarf'))
      results.push(...sarfItems)
    }

    if (filters.type === 'all' || filters.type === 'celik') {
      const celikItems = celikStore.items
        .filter(item => matchesFilters(item, 'celik'))
        .map(item => convertToUnified(item, 'celik'))
      results.push(...celikItems)
    }

    if (filters.type === 'all' || filters.type === 'membran') {
      const membranItems = membranStore.items
        .filter(item => matchesFilters(item, 'membran'))
        .map(item => convertToUnified(item, 'membran'))
      results.push(...membranItems)
    }

    if (filters.type === 'all' || filters.type === 'halat') {
      const halatItems = halatStore.items
        .filter(item => matchesFilters(item, 'halat'))
        .map(item => convertToUnified(item, 'halat'))
      results.push(...halatItems)
    }

    if (filters.type === 'all' || filters.type === 'fitil') {
      const fitilItems = fitilStore.items
        .filter(item => matchesFilters(item, 'fitil'))
        .map(item => convertToUnified(item, 'fitil'))
      results.push(...fitilItems)
    }

    // Sonuçları stok durumuna göre sırala (stokta olanlar önce)
    results.sort((a, b) => {
      if (a.stockAvailable && !b.stockAvailable) return -1
      if (!a.stockAvailable && b.stockAvailable) return 1
      return 0
    })
    
    searchResults.value = results
    console.log(`✅ ${results.length} malzeme bulundu`)
    
  } catch (error) {
    console.error('❌ Arama hatası:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchMaterials()
  }, 300)
}

const matchesFilters = (item: any, type: string): boolean => {
  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    const searchableText = [
      item.malzeme, item.name, item.tip, item.aciklama, 
      item.description, item.kalite, item.cins, item.marka,
      item.renk, item.model
    ].filter(Boolean).join(' ').toLowerCase()
    
    if (!searchableText.includes(searchTerm)) return false
  }

  // Kalite filter
  if (filters.kalite && item.kalite) {
    if (!item.kalite.toLowerCase().includes(filters.kalite.toLowerCase())) {
      return false
    }
  }

  // Stock availability filter
  if (filters.stockAvailable !== '') {
    const hasStock = getStockAmount(item, type) > 0
    if (filters.stockAvailable === 'true' && !hasStock) return false
    if (filters.stockAvailable === 'false' && hasStock) return false
  }

  // Price range filter
  if (filters.priceRange.min && item.satinAlisFiyati) {
    const price = (item.satinAlisFiyati || 0) * (item.dovizKur || 1)
    if (price < parseFloat(filters.priceRange.min)) return false
  }
  if (filters.priceRange.max && item.satinAlisFiyati) {
    const price = (item.satinAlisFiyati || 0) * (item.dovizKur || 1)
    if (price > parseFloat(filters.priceRange.max)) return false
  }

  return true
}

const getStockAmount = (item: any, type: string): number => {
  switch (type) {
    case 'sarf':
    case 'celik':
    case 'halat':
    case 'fitil':
      return parseFloat(item.kalanMiktar || '0')
    case 'membran':
      return parseFloat(item.topSayisi || '0')
    default:
      return 0
  }
}

const convertToUnified = (item: any, type: string): any => {
  const stockAmount = getStockAmount(item, type)
  
  return {
    id: item._id || item.id,
    type: type,
    name: item.malzeme || item.marka || item.tip || item.name || 'Malzeme',
    description: item.aciklama || item.description || item.note,
    kalite: item.kalite,
    cins: item.cins || item.malzemeCinsi,
    specifications: {
      en: item.en,
      boy: item.boy,
      kalinlik: item.kalinlik,
      uzunluk: item.uzunluk,
      cap: item.cap || item.halatCapi || item.boruCap,
      renk: item.renk,
      model: item.model,
      adet: item.adet,
      topSayisi: item.topSayisi
    },
    unit: item.birim || 'ADET',
    stockAvailable: stockAmount > 0,
    availableStock: stockAmount,
    unitPrice: (item.satinAlisFiyati || 0) * (item.dovizKur || 1),
    currency: 'TL',
    supplier: item.tedarikci
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

const getQuantity = (materialId: string): number => {
  return quantities.value[materialId] || 1
}

const setQuantity = (materialId: string, value: string | number) => {
  const numValue = typeof value === 'string' ? parseInt(value) || 1 : value
  quantities.value[materialId] = Math.max(1, numValue)
}

const increaseQuantity = (material: any) => {
  const currentQty = getQuantity(material.id)
  const maxQty = material.stockAvailable ? material.availableStock : 999
  setQuantity(material.id, Math.min(currentQty + 1, maxQty))
}

const decreaseQuantity = (material: any) => {
  const currentQty = getQuantity(material.id)
  setQuantity(material.id, Math.max(currentQty - 1, 1))
}

const selectMaterial = (material: any) => {
  const quantity = getQuantity(material.id)
  
  const selectedMaterial = {
    ...material,
    requestedQuantity: quantity,
    reservedQuantity: 0,
    usedQuantity: 0,
    status: 'planned',
    priority: 'medium',
    totalPrice: (material.unitPrice || 0) * quantity
  }
  
  console.log('✅ Malzeme seçildi:', selectedMaterial)
  emit('select', selectedMaterial)
}

const addCustomMaterial = (materialData: any) => {
  const customMaterial = {
    id: 'custom_' + Date.now(),
    type: 'custom',
    name: materialData.name,
    description: materialData.description,
    stockAvailable: false,
    availableStock: 0,
    ...materialData
  }
  
  emit('select', customMaterial)
  showCustomMaterialForm.value = false
}

// Utility methods
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

// Watch for type changes to trigger immediate search
watch(() => filters.type, () => {
  searchMaterials()
}, { immediate: false })

// Load all materials on mount
onMounted(async () => {
  console.log('🔄 Tüm malzemeler yükleniyor...')
  
  try {
    await Promise.all([
      sarfStore.fetchItems(),
      celikStore.fetchItems(), 
      membranStore.fetchItems(),
      halatStore.fetchItems(),
      fitilStore.fetchItems()
    ])
    
    console.log('✅ Tüm malzemeler yüklendi')
    
    // İlk arama
    await searchMaterials()
    
  } catch (error) {
    console.error('❌ Malzeme yükleme hatası:', error)
  }
})
</script>

<style scoped>
.material-search {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 75vh;
  max-height: 800px;
}

.search-filters {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
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
  transition: border-color 0.2s;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  flex-shrink: 0;
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
  transition: all 0.2s;
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
  flex: 1;
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

.empty-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.results-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.results-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
  transition: all 0.2s;
}

.material-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.material-card.out-of-stock {
  opacity: 0.6;
  background: #f9fafb;
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
  margin-bottom: 12px;
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
  margin-bottom: 12px;
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

.material-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-selector label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.quantity-input-group {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.qty-btn {
  background: #f9fafb;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  border: none;
  padding: 6px 8px;
  width: 60px;
  text-align: center;
  outline: none;
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
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
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