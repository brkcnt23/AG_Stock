<!-- pages/HalatPage.vue - FIXED TO MATCH PROJECT STRUCTURE -->
<template>
  <div class="halat-page">
    <PageHeader 
      title="⛓️ Halat Yönetimi"
      subtitle="Asma Germe Sistemleri - Halat Malzeme Takibi"
      item-type="Halat"
      export-label="Halat Raporu"
      @add-item="openAddModal"
      @export="exportStock"
    />

    <StatsGrid 
      :statistics="store.statistics" 
      item-type="Halat"
    />

    <FiltersSection 
      :filters="filters"
      :search-text="searchText"
      :malzeme-cinsi-options="halatCinsiOptions"
      malzeme-cinsi-label="Halat Cinsi"
      search-placeholder="Kalite, çap, tip ara..."
      @filter-change="onFilterChange"
      @search-change="onSearchChange"
      @clear-filters="clearFilters"
      @show-stock-only="showOnlyStock"
      @show-project-assigned="showProjectAssigned"
    />

    <BaseDataTable
      title="📋 Halat Listesi"
      item-type="halat"
      :paginated-data="paginatedData"
      :filtered-count="filteredItems.length"
      :total-items="filteredItems.length"
      :current-page="currentPage"
      :items-per-page="itemsPerPage"
      :current-density="viewDensity"
      :loading="store.loading"
      :error="store.error"
      :selected-items="selectedItems"
      @density-change="viewDensity = $event"
      @items-change="onItemsChange"
      @show-stock-only="showOnlyStock"
      @show-project-assigned="showProjectAssigned"
      @clear-filters="clearFilters"
      @toggle-select-all="toggleSelectAll"
      @item-select="onItemSelect"
      @page-change="onPageChange"
      @row-click="viewItemDetails"
      @view-item="viewItemDetails"
      @edit-item="editItem"
      @duplicate-item="duplicateItem"
      @delete-item="deleteItem"
      @retry="fetchData"
    >
      <template #table-head>
        <th @click="sortBy('malzemeTuru')" class="sortable">
          Malzeme Türü {{ getSortIcon('malzemeTuru') }}
        </th>
        <th @click="sortBy('cins')" class="sortable">
          Halat Cinsi {{ getSortIcon('cins') }}
        </th>
        <th>Çap & Özellikler</th>
        <th @click="sortBy('kalanMiktar')" class="sortable">
          Stok Durumu {{ getSortIcon('kalanMiktar') }}
        </th>
        <th>Alış Bilgileri</th>
        <th @click="sortBy('proje')" class="sortable">
          Proje/Lokasyon {{ getSortIcon('proje') }}
        </th>
        <th @click="sortBy('girisTarihi')" class="sortable">
          Giriş Tarihi {{ getSortIcon('girisTarihi') }}
        </th>
      </template>

      <template #table-body="{ item }">
        <!-- Malzeme Türü -->
        <td class="material-info">
          <div class="material-main">
            <strong class="quality">{{ item.kalite || 'Belirtilmemiş' }}</strong>
            <span class="material-type type-halat">
              Halat
            </span>
          </div>
          <div class="material-details" v-if="viewDensity !== 'compact'">
            <span class="material-name">{{ item.malzemeTuru || '-' }}</span>
          </div>
        </td>

        <!-- Halat Cinsi -->
        <td class="type-cell">
          <span :class="getHalatCinsiClass(item.cins)" class="type-badge">
            {{ item.cins || '-' }}
          </span>
          <div v-if="viewDensity === 'detailed'" class="construction-info">
            <small>{{ item.yapisi || 'Yapı belirtilmemiş' }}</small>
          </div>
        </td>

        <!-- Çap & Özellikler -->
        <td class="dimensions-cell">
          <div class="dimensions-info">
            <div class="main-size">{{ formatHalatDimensions(item) }}</div>
            <div class="sub-info" v-if="viewDensity !== 'compact'">
              <div class="strength-info">
                <span>Dayanım: {{ item.dayanim || '-' }} kg</span>
              </div>
              <div v-if="viewDensity === 'detailed'" class="extra-info">
                <small v-if="item.uzunluk">{{ item.uzunluk }}m bobin</small>
                <small v-if="item.gramaj">{{ item.gramaj }}g/m</small>
              </div>
            </div>
          </div>
        </td>

        <!-- Stok Durumu -->
        <td class="stock-cell">
          <div class="stock-display">
            <div class="stock-numbers">
              <span class="current" :class="getStockStatusClass(item)">
                {{ item.kalanMiktar || '0' }}
              </span>
              <span class="separator">/</span>
              <span class="total">{{ item.girisMiktar || '0' }}</span>
            </div>
            <div class="stock-bar">
              <div class="stock-progress" 
                   :style="{ width: getStockPercentage(item) + '%' }"
                   :class="getStockStatusClass(item)">
              </div>
            </div>
            <div class="stock-label">
              <span :class="getStockStatusClass(item)">
                {{ getStockStatusLabel(item) }}
              </span>
              <span class="percentage">({{ getStockPercentage(item) }}%)</span>
            </div>
          </div>
        </td>

        <!-- Alış Bilgileri -->
        <td class="purchase-info-cell">
          <div class="purchase-details">
            <div class="price-main">
              <span class="price-amount">
                {{ formatPrice(item.satinAlisFiyati, item.dovizKur) }}
              </span>
            </div>
            <div class="price-details" v-if="viewDensity !== 'compact'">
              <div v-if="item.dovizKur && item.dovizKur !== 1" class="exchange-info">
                <small>{{ item.satinAlisFiyati }}{{ item.paraBirimi || '$' }} × {{ item.dovizKur }}</small>
              </div>
              <div class="supplier-info">
                <small>{{ item.tedarikci || 'Tedarikçi belirtilmemiş' }}</small>
              </div>
            </div>
          </div>
        </td>

        <!-- Proje/Lokasyon -->
        <td class="location-cell">
          <div class="location-info">
            <div class="project-name">{{ item.proje || 'Stok' }}</div>
            <div class="shelf-location">
              <span class="shelf-badge">{{ item.rafNo || 'Belirsiz' }}</span>
            </div>
            <div class="document-refs" v-if="viewDensity === 'detailed'">
              <small v-if="item.sertifikaNo">Sert: {{ item.sertifikaNo }}</small>
              <small v-if="item.testRaporu">Test: {{ item.testRaporu }}</small>
            </div>
          </div>
        </td>

        <!-- Giriş Tarihi -->
        <td class="date-cell">
          <div class="date-info">
            <div class="entry-date">{{ formatDate(item.girisTarihi) }}</div>
            <div class="age-info" v-if="viewDensity !== 'compact'">
              <small>{{ getItemAge(item.girisTarihi) }}</small>
            </div>
          </div>
        </td>
      </template>
    </BaseDataTable>

    <!-- Add/Edit Modal -->
    <BaseModal 
      v-if="showModal"
      :title="modalMode === 'add' ? '➕ Yeni Halat Ekle' : '✏️ Halat Düzenle'"
      size="large"
      @close="closeModal"
    >
      <MaterialForm
        :mode="modalMode"
        :item="editingItem"
        :malzeme-cinsi-options="halatCinsiOptions"
        @save="saveItem"
        @cancel="closeModal"
      >
        <template #specificFields>
          <!-- Halata özel alanlar -->
          <div class="form-row">
            <div class="form-group">
              <label>Halat Çapı (mm) *</label>
              <input 
                v-model="halatForm.cap" 
                type="number" 
                step="0.1"
                required
                placeholder="6, 8, 10, 12..."
              >
            </div>
            
            <div class="form-group">
              <label>Yapısı</label>
              <select v-model="halatForm.yapisi">
                <option value="">Seçiniz</option>
                <option value="1x7">1x7 (7 tel)</option>
                <option value="1x19">1x19 (19 tel)</option>
                <option value="7x7">7x7 (49 tel)</option>
                <option value="7x19">7x19 (133 tel)</option>
                <option value="6x7">6x7 (42 tel)</option>
                <option value="6x19">6x19 (114 tel)</option>
                <option value="özel">Özel Yapı</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Dayanım (kg)</label>
              <input 
                v-model="halatForm.dayanim" 
                type="number" 
                placeholder="Kopma dayanımı"
              >
            </div>

            <div class="form-group">
              <label>Uzunluk (m)</label>
              <input 
                v-model="halatForm.uzunluk" 
                type="number" 
                step="0.1"
                placeholder="Bobin uzunluğu"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Gramaj (g/m)</label>
              <input 
                v-model="halatForm.gramaj" 
                type="number" 
                step="0.01"
                placeholder="Metre başına ağırlık"
              >
            </div>
            
            <div class="form-group">
              <label>Sertifika No</label>
              <input 
                v-model="halatForm.sertifikaNo" 
                type="text" 
                placeholder="Kalite sertifikası"
              >
            </div>
            
            <div class="form-group">
              <label>Test Raporu</label>
              <input 
                v-model="halatForm.testRaporu" 
                type="text" 
                placeholder="Test rapor no"
              >
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="halatForm.paslanmaz">
                <span>🔧 Paslanmaz Çelik</span>
              </label>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label>Kullanım Alanı</label>
              <textarea 
                v-model="halatForm.kullanimAlani" 
                rows="2"
                placeholder="Önerilen kullanım alanları..."
              ></textarea>
            </div>
          </div>
        </template>
      </MaterialForm>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useHalatStore } from '../store/halatStore'
import type { HalatItem } from '../types/common'
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import FiltersSection from '../components/FiltersSection.vue'
import BaseDataTable from '../components/BaseDataTable.vue'
import BaseModal from '../components/BaseModal.vue'
import MaterialForm from '../components/MaterialForm.vue'
import { safeAccess, ensureString, ensureId } from '../utils/typeHelpers'
// Store
const store = useHalatStore()

// State
const selectedItems = ref<string[]>([])
const viewDensity = ref<'compact' | 'normal' | 'detailed'>('normal')
const itemsPerPage = ref(25)
const currentPage = ref(1)
const searchText = ref('')
const sortField = ref('girisTarihi')
const sortDirection = ref<'asc' | 'desc'>('desc')
const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingItem = ref<HalatItem | null>(null)

// Halata özel form alanları
const halatForm = reactive({
  cap: undefined as number | undefined,
  yapisi: '',
  dayanim: undefined as number | undefined,
  uzunluk: undefined as number | undefined,
  gramaj: undefined as number | undefined,
  sertifikaNo: '',
  testRaporu: '',
  paslanmaz: false,
  kullanimAlani: ''
})

// Halat cinsi seçenekleri
const halatCinsiOptions = [
  { value: 'celik', label: 'Çelik Halat' },
  { value: 'paslanmaz', label: 'Paslanmaz Çelik Halat' },
  { value: 'galvaniz', label: 'Galvaniz Halat' },
  { value: 'sentetik', label: 'Sentetik Halat' },
  { value: 'karma', label: 'Karma Halat' },
  { value: 'diger', label: 'Diğer' }
]

const filters = reactive({
  malzemeTuru: '',
  malzemeCinsi: '',
  stockStatus: '',
  proje: '',
  rafNo: ''
})

// Computed
const filteredItems = computed(() => {
  let items = store.items

  // Search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    items = items.filter((item: HalatItem) => 
      item.kalite?.toLowerCase().includes(search) ||
      item.malzemeTuru?.toLowerCase().includes(search) ||
      item.cins?.toLowerCase().includes(search) ||
      item.proje?.toLowerCase().includes(search) ||
      item.tedarikci?.toLowerCase().includes(search) ||
      item.cap?.toString().includes(search)
    )
  }

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (key === 'proje' && value === '!Stok') {
        items = items.filter((item: any) => item.proje && item.proje !== 'Stok')
      } else if (key === 'stockStatus') {
        items = items.filter((item: any) => {
          const percentage = getStockPercentage(item)
          switch (value) {
            case 'sufficient': return percentage > 20
            case 'low': return percentage >= 10 && percentage <= 20
            case 'critical': return percentage > 0 && percentage < 10
            case 'empty': return percentage === 0
            default: return true
          }
        })
      } else if (key === 'malzemeCinsi') {
        items = items.filter((item: any) => item.cins === value)
      } else {
        items = items.filter((item: any) => item[key] === value)
      }
    }
  })

  // Sort
  items.sort((a: any, b: any) => {
    const aVal = a[sortField.value] ?? ''
    const bVal = b[sortField.value] ?? ''
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return items
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

// Methods - Standard methods (same pattern as other pages)
const fetchData = async () => {
  await store.fetchItems()
}

const onFilterChange = (newFilters: Record<string, any>) => {
  Object.assign(filters, newFilters)
  currentPage.value = 1
}

const onSearchChange = (search: string) => {
  searchText.value = search
  currentPage.value = 1
}

const clearFilters = () => {
  Object.assign(filters, {
    malzemeTuru: '',
    malzemeCinsi: '',
    stockStatus: '',
    proje: '',
    rafNo: ''
  })
  searchText.value = ''
  currentPage.value = 1
}

const showOnlyStock = () => {
  filters.proje = 'Stok'
  currentPage.value = 1
}

const showProjectAssigned = () => {
  filters.proje = '!Stok'
  currentPage.value = 1
}

const onItemsChange = (count: string) => {
  itemsPerPage.value = parseInt(count)
  currentPage.value = 1
}

const onPageChange = (page: number) => {
  currentPage.value = page
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field: string) => {
  if (sortField.value !== field) return '↕️'
  return sortDirection.value === 'asc' ? '⬆️' : '⬇️'
}

const toggleSelectAll = () => {
  if (selectedItems.value.length === paginatedData.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = paginatedData.value.map(item => item._id || item.id || '')
  }
}

const onItemSelect = (itemId: string) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
}

const openAddModal = () => {
  modalMode.value = 'add'
  editingItem.value = null
  // Reset halat form
  Object.assign(halatForm, {
    cap: undefined,
    yapisi: '',
    dayanim: undefined,
    uzunluk: undefined,
    gramaj: undefined,
    sertifikaNo: '',
    testRaporu: '',
    paslanmaz: false,
    kullanimAlani: ''
  })
  showModal.value = true
}

const editItem = (item: HalatItem) => {
  modalMode.value = 'edit'
  editingItem.value = item
  // Fill halat form with item data
  Object.assign(halatForm, {
    cap: item.cap,
    yapisi: item.yapisi || '',
    dayanim: item.dayanim,
    uzunluk: item.uzunluk,
    gramaj: item.gramaj,
    sertifikaNo: item.sertifikaNo || '',
    testRaporu: item.testRaporu || '',
    paslanmaz: item.paslanmaz || false,
    kullanimAlani: item.kullanimAlani || ''
  })
  showModal.value = true
}

const duplicateItem = (item: HalatItem) => {
  modalMode.value = 'add'
  editingItem.value = { 
    ...item, 
    _id: undefined, 
    id: undefined,
    girisTarihi: new Date().toISOString().split('T')[0] 
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const saveItem = async (itemData: any) => {
  try {
    // Safe cins conversion for halat
    const finalData = {
      ...itemData,
      ...halatForm,
      malzemeTuru: 'halat' as const,
      // ✅ SAFE CINS CONVERSION
      cins: ['celik', 'sentetik', 'karma'].includes(halatForm.cins) 
        ? halatForm.cins as 'celik' | 'sentetik' | 'karma'
        : 'celik'  // default fallback
    }
    
    if (modalMode.value === 'add') {
      await store.addItem(finalData)
    } else {
      await store.updateItem(itemData._id || itemData.id || '', finalData)
    }
    closeModal()
  } catch (error) {
    console.error('Save error:', error)
    alert('Kayıt sırasında bir hata oluştu!')
  }
}

const deleteItem = async (item: HalatItem) => {
  if (confirm(`"${item.kalite} - ${item.cins}" halatını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
    try {
      await store.deleteItem(item._id || item.id || '')
      const itemId = item._id || item.id || ''
      selectedItems.value = selectedItems.value.filter(id => id !== itemId)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Silme sırasında bir hata oluştu!')
    }
  }
}

const viewItemDetails = (item: HalatItem) => {
  const details = `
⛓️ HALAT DETAYLARI

🔗 Temel Bilgiler:
• Kalite: ${item.kalite || 'Belirtilmemiş'}
• Tür: ${item.malzemeTuru || 'Belirtilmemiş'}
• Cins: ${item.cins || 'Belirtilmemiş'}
• Çap: ${item.cap || 0} mm

🏗️ Teknik Özellikler:
• Yapısı: ${item.yapisi || 'Belirtilmemiş'}
• Dayanım: ${item.dayanim || 0} kg
• Uzunluk: ${item.uzunluk || 0} m
• Gramaj: ${item.gramaj || 0} g/m
${item.paslanmaz ? '• Paslanmaz Çelik: Evet' : ''}

📦 Stok Durumu:
• Giriş: ${item.girisMiktar || 0} m
• Çıkış: ${item.cikisMiktar || 0} m
• Kalan: ${item.kalanMiktar || 0} m
• Durum: ${getStockStatusLabel(item)} (%${getStockPercentage(item)})

💰 Fiyat Bilgileri:
• Alış: ${formatPrice(item.satinAlisFiyati ?? 0, item.dovizKur)}
${item.dovizKur && item.dovizKur !== 1 ? `• Döviz: ${item.satinAlisFiyati || 0} ${item.paraBirimi || 'USD'} × ${item.dovizKur}` : ''}
• Tedarikçi: ${item.tedarikci || 'Belirtilmemiş'}

📍 Lokasyon:
• Proje: ${item.proje || 'Stok'}
• Raf: ${item.rafNo || 'Belirtilmemiş'}
${item.sertifikaNo ? `• Sertifika: ${item.sertifikaNo}` : ''}
${item.testRaporu ? `• Test Raporu: ${item.testRaporu}` : ''}

🔧 Kullanım:
${item.kullanimAlani || 'Kullanım alanı belirtilmemiş'}

📅 Tarihler:
• Giriş: ${formatDate(item.girisTarihi)}
• Yaş: ${getItemAge(item.girisTarihi)}
  `
  alert(details)
}

const exportStock = () => {
  const csvContent = [
    'Kalite,Cins,Çap,Yapısı,Dayanım,Uzunluk,Stok,Birim,Fiyat,Tedarikçi,Proje,Raf,Tarih',
    ...filteredItems.value.map(item => [
      item.kalite,
      item.cins,
      item.cap || '',
      item.yapisi || '',
      item.dayanim || '',
      item.uzunluk || '',
      item.kalanMiktar,
      item.birim || 'm',
      formatPrice(item.satinAlisFiyati ?? 0, item.dovizKur ?? 1),
      item.tedarikci || '',
      item.proje || 'Stok',
      item.rafNo,
      formatDate(item.girisTarihi)
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `halat_stok_raporu_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Utility functions
const formatHalatDimensions = (item: any) => {
  const parts: string[] = []
  if (item.cap) parts.push(`Ø${item.cap}mm`)
  if (item.yapisi) parts.push(item.yapisi)
  return parts.length > 0 ? parts.join(' • ') : 'Boyut belirtilmemiş'
}

const formatPrice = (price: number, exchangeRate: number = 1) => {
  if (!price) return 'Fiyat belirtilmemiş'
  const tlPrice = price * exchangeRate
  return `${tlPrice.toLocaleString('tr-TR')} ₺`
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Tarih belirtilmemiş'
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

const getItemAge = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays} gün önce`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`
  return `${Math.floor(diffDays / 365)} yıl önce`
}

const getStockPercentage = (item: any) => {
  const kalan = parseFloat(item.kalanMiktar || '0')
  const giris = parseFloat(item.girisMiktar || '0')
  return giris > 0 ? Math.round((kalan / giris) * 100) : 0
}

const getStockStatusClass = (item: any) => {
  const percentage = getStockPercentage(item)
  if (percentage === 0) return 'empty'
  if (percentage < 10) return 'critical'
  if (percentage < 20) return 'low'
  return 'sufficient'
}

const getStockStatusLabel = (item: any) => {
  const percentage = getStockPercentage(item)
  if (percentage === 0) return 'Tükendi'
  if (percentage < 10) return 'Kritik'
  if (percentage < 20) return 'Düşük'
  return 'Yeterli'
}

const getHalatCinsiClass = (cins: string) => {
  const classes = {
    'celik': 'cins-celik',
    'paslanmaz': 'cins-paslanmaz',
    'galvaniz': 'cins-galvaniz',
    'sentetik': 'cins-sentetik',
    'karma': 'cins-karma',
    'diger': 'cins-other'
  }
  return classes[cins as keyof typeof classes] || 'cins-other'
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.halat-page {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

/* Material Info Cell */
.material-info {
  min-width: 180px;
}

.material-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quality {
  color: #1e293b;
  font-size: 14px;
}

.material-type.type-halat {
  background: #ede9fe;
  color: #7c3aed;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.material-details {
  margin-top: 4px;
}

.material-name {
  font-size: 12px;
  color: #6b7280;
}

/* Type Cell */
.type-cell {
  min-width: 120px;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.cins-celik { background: #374151; color: white; }
.cins-paslanmaz { background: #e5e7eb; color: #374151; }
.cins-galvaniz { background: #fef3c7; color: #92400e; }
.cins-sentetik { background: #dcfce7; color: #166534; }
.cins-karma { background: #e0f2fe; color: #0369a1; }
.cins-other { background: #f3f4f6; color: #6b7280; }

.construction-info {
  font-size: 10px;
  color: #6b7280;
}

/* Dimensions Cell */
.dimensions-cell {
  min-width: 180px;
}

.main-size {
  font-weight: 500;
  color: #1e293b;
  font-family: monospace;
  font-size: 13px;
  margin-bottom: 4px;
}

.sub-info {
  font-size: 12px;
}

.strength-info {
  color: #374151;
  font-weight: 500;
  margin-bottom: 2px;
}

.extra-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.extra-info small {
  color: #9ca3af;
  font-size: 10px;
}

/* Stock Cell - Same as other pages */
.stock-cell {
  min-width: 120px;
}

.stock-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: monospace;
  font-weight: 600;
}

.stock-numbers .current.sufficient { color: #10b981; }
.stock-numbers .current.low { color: #f59e0b; }
.stock-numbers .current.critical { color: #ef4444; }
.stock-numbers .current.empty { color: #9ca3af; }

.separator {
  color: #9ca3af;
}

.total {
  color: #6b7280;
}

.stock-bar {
  width: 100%;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
}

.stock-progress {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.stock-progress.sufficient { background: #10b981; }
.stock-progress.low { background: #f59e0b; }
.stock-progress.critical { background: #ef4444; }
.stock-progress.empty { background: #9ca3af; }

.stock-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.stock-label span.sufficient { color: #10b981; }
.stock-label span.low { color: #f59e0b; }
.stock-label span.critical { color: #ef4444; }
.stock-label span.empty { color: #9ca3af; }

.percentage {
  color: #9ca3af;
}

/* Purchase Info Cell */
.purchase-info-cell {
  min-width: 140px;
}

.purchase-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.price-main {
  font-weight: 600;
  color: #1e293b;
}

.price-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.exchange-info,
.supplier-info {
  font-size: 11px;
  color: #6b7280;
}

/* Location Cell */
.location-cell {
  min-width: 120px;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 13px;
}

.shelf-location {
  display: flex;
  align-items: center;
}

.shelf-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.document-refs {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.document-refs small {
  font-size: 10px;
  color: #9ca3af;
  background: #f9fafb;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
}

/* Date Cell */
.date-cell {
  min-width: 100px;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-date {
  font-weight: 500;
  color: #1e293b;
  font-size: 13px;
}

.age-info small {
  font-size: 11px;
  color: #6b7280;
}

/* Form styling */
.form-group.full-width {
  grid-column: span 2;
}

.checkbox-group .checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .halat-page {
    padding: 10px;
  }
  
  .material-info,
  .dimensions-cell,
  .stock-cell,
  .purchase-info-cell,
  .location-cell {
    min-width: auto;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
}