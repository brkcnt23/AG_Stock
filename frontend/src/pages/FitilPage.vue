<!-- pages/FitilPage.vue - COMPLETE PAGE -->
<template>
  <div class="fitil-page">
    <PageHeader 
      title="🧵 Fitil Yönetimi"
      subtitle="Asma Germe Sistemleri - Fitil Malzeme Takibi"
      item-type="Fitil"
      export-label="Fitil Raporu"
      @add-item="openAddModal"
      @export="exportStock"
    />

    <StatsGrid 
      :statistics="store.statistics" 
      item-type="Fitil"
    />

    <FiltersSection 
      :filters="filters"
      :search-text="searchText"
      :malzeme-cinsi-options="fitilCinsiOptions"
      malzeme-cinsi-label="Fitil Cinsi"
      search-placeholder="Malzeme, renk, kalite ara..."
      @filter-change="onFilterChange"
      @search-change="onSearchChange"
      @clear-filters="clearFilters"
      @show-stock-only="showOnlyStock"
      @show-project-assigned="showProjectAssigned"
    />

    <BaseDataTable
      title="📋 Fitil Listesi"
      item-type="fitil"
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
        <th @click="sortBy('malzeme')" class="sortable">
          Malzeme {{ getSortIcon('malzeme') }}
        </th>
        <th @click="sortBy('cins')" class="sortable">
          Fitil Cinsi {{ getSortIcon('cins') }}
        </th>
        <th>Özellikler & Renk</th>
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
        <!-- Malzeme -->
        <td class="material-info">
          <div class="material-main">
            <strong class="quality">{{ item.malzeme || 'Belirtilmemiş' }}</strong>
            <span class="material-type type-fitil">
              Fitil
            </span>
          </div>
          <div class="material-details" v-if="viewDensity !== 'compact'">
            <span class="material-brand">{{ item.marka || '-' }}</span>
          </div>
        </td>

        <!-- Fitil Cinsi -->
        <td class="type-cell">
          <span :class="getFitilCinsiClass(item.cins)" class="type-badge">
            {{ item.cins || '-' }}
          </span>
          <div v-if="viewDensity === 'detailed'" class="kalite-info">
            <small>{{ item.kalite || 'Kalite belirtilmemiş' }}</small>
          </div>
        </td>

        <!-- Özellikler & Renk -->
        <td class="properties-cell">
          <div class="properties-info">
            <div class="main-properties">{{ formatFitilProperties(item) }}</div>
            <div class="color-info" v-if="viewDensity !== 'compact'">
              <div class="color-display">
                <span class="color-dot" :style="{ backgroundColor: getColorHex(item.renk) }"></span>
                <span class="color-name">{{ item.renk || 'Renk belirtilmemiş' }}</span>
                <span v-if="item.renkKodu" class="color-code">({{ item.renkKodu }})</span>
              </div>
              <div v-if="viewDensity === 'detailed'" class="extra-properties">
                <small v-if="item.kalinlik">Kalınlık: {{ item.kalinlik }}mm</small>
                <small v-if="item.dayanim">Dayanım: {{ item.dayanim }}kg</small>
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
              <small v-if="item.lotNo">Lot: {{ item.lotNo }}</small>
              <small v-if="item.uretimTarihi">Üretim: {{ formatDate(item.uretimTarihi) }}</small>
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
      :title="modalMode === 'add' ? '➕ Yeni Fitil Ekle' : '✏️ Fitil Düzenle'"
      size="large"
      @close="closeModal"
    >
      <MaterialForm
        :mode="modalMode"
        :item="editingItem"
        :malzeme-cinsi-options="fitilCinsiOptions"
        @save="saveItem"
        @cancel="closeModal"
      >
        <template #specificFields>
          <!-- Fitile özel alanlar -->
          <div class="form-row">
            <div class="form-group">
              <label>Marka *</label>
              <input 
                v-model="fitilForm.marka" 
                type="text" 
                required
                placeholder="Üretici marka"
              >
            </div>
            
            <div class="form-group">
              <label>Renk *</label>
              <select v-model="fitilForm.renk" required>
                <option value="">Seçiniz</option>
                <option value="Beyaz">Beyaz</option>
                <option value="Siyah">Siyah</option>
                <option value="Kırmızı">Kırmızı</option>
                <option value="Mavi">Mavi</option>
                <option value="Yeşil">Yeşil</option>
                <option value="Sarı">Sarı</option>
                <option value="Turuncu">Turuncu</option>
                <option value="Mor">Mor</option>
                <option value="Gri">Gri</option>
                <option value="Şeffaf">Şeffaf</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Renk Kodu</label>
              <input 
                v-model="fitilForm.renkKodu" 
                type="text" 
                placeholder="RAL, Pantone..."
              >
            </div>

            <div class="form-group">
              <label>Kalınlık (mm)</label>
              <input 
                v-model="fitilForm.kalinlik" 
                type="number" 
                step="0.1"
                placeholder="İplik kalınlığı"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Dayanım (kg)</label>
              <input 
                v-model="fitilForm.dayanim" 
                type="number" 
                placeholder="Kopma dayanımı"
              >
            </div>
            
            <div class="form-group">
              <label>Elastikiyet (%)</label>
              <input 
                v-model="fitilForm.elastikiyet" 
                type="number" 
                step="0.1"
                placeholder="Uzama yüzdesi"
              >
            </div>
            
            <div class="form-group">
              <label>Lot No</label>
              <input 
                v-model="fitilForm.lotNo" 
                type="text" 
                placeholder="Üretim lot numarası"
              >
            </div>

            <div class="form-group">
              <label>Üretim Tarihi</label>
              <input 
                v-model="fitilForm.uretimTarihi" 
                type="date"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="fitilForm.antistatik">
                <span>⚡ Antistatik</span>
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="fitilForm.uvDayanikli">
                <span>☀️ UV Dayanıklı</span>
              </label>
            </div>
            
            <div class="form-group full-width">
              <label>Kullanım Alanı</label>
              <textarea 
                v-model="fitilForm.kullanimAlani" 
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
import { useFitilStore } from '../store/fitilStore'
import type { FitilItem } from '../types/common'
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import FiltersSection from '../components/FiltersSection.vue'
import BaseDataTable from '../components/BaseDataTable.vue'
import BaseModal from '../components/BaseModal.vue'
import MaterialForm from '../components/MaterialForm.vue'
import { safeAccess, ensureString, ensureId } from '../utils/typeHelpers'
// Store
const store = useFitilStore()

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
const editingItem = ref<FitilItem | null>(null)

// Fitile özel form alanları
const fitilForm = reactive({
  marka: '',
  renk: '',
  renkKodu: '',
  kalinlik: undefined as number | undefined,
  dayanim: undefined as number | undefined,
  elastikiyet: undefined as number | undefined,
  lotNo: '',
  uretimTarihi: '',
  antistatik: false,
  uvDayanikli: false,
  kullanimAlani: ''
})

// Fitil cinsi seçenekleri
const fitilCinsiOptions = [
  { value: 'pamuk', label: 'Pamuk Fitil' },
  { value: 'polyester', label: 'Polyester Fitil' },
  { value: 'naylon', label: 'Naylon Fitil' },
  { value: 'polipropilen', label: 'Polipropilen Fitil' },
  { value: 'aramid', label: 'Aramid Fitil' },
  { value: 'karbon', label: 'Karbon Fitil' },
  { value: 'cam', label: 'Cam Elyaf Fitil' },
  { value: 'karma', label: 'Karma Fitil' },
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
    items = items.filter((item: FitilItem) => 
      item.malzeme?.toLowerCase().includes(search) ||
      item.cins?.toLowerCase().includes(search) ||
      item.kalite?.toLowerCase().includes(search) ||
      item.renk?.toLowerCase().includes(search) ||
      item.marka?.toLowerCase().includes(search) ||
      item.proje?.toLowerCase().includes(search) ||
      item.tedarikci?.toLowerCase().includes(search)
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
  // Reset fitil form
  Object.assign(fitilForm, {
    marka: '',
    renk: '',
    renkKodu: '',
    kalinlik: undefined,
    dayanim: undefined,
    elastikiyet: undefined,
    lotNo: '',
    uretimTarihi: '',
    antistatik: false,
    uvDayanikli: false,
    kullanimAlani: ''
  })
  showModal.value = true
}

const editItem = (item: FitilItem) => {
  modalMode.value = 'edit'
  editingItem.value = item
  // Fill fitil form with item data
  Object.assign(fitilForm, {
    marka: item.marka || '',
    renk: item.renk || '',
    renkKodu: item.renkKodu || '',
    kalinlik: item.kalinlik,
    dayanim: item.dayanim,
    elastikiyet: item.elastikiyet,
    lotNo: item.lotNo || '',
    uretimTarihi: item.uretimTarihi || '',
    antistatik: item.antistatik || false,
    uvDayanikli: item.uvDayanikli || false,
    kullanimAlani: item.kullanimAlani || ''
  })
  showModal.value = true
}

const duplicateItem = (item: FitilItem) => {
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

const saveItem = async (itemData: FitilItem) => {
  try {
    // Add fitil-specific fields
    const finalData = {
      ...itemData,
      ...fitilForm,
      malzemeTuru: 'fitil' as const
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

const deleteItem = async (item: FitilItem) => {
  if (confirm(`"${item.malzeme} - ${item.cins}" fitilini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
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

const viewItemDetails = (item: FitilItem) => {
  const details = `
🧵 FİTİL DETAYLARI

🏷️ Temel Bilgiler:
• Malzeme: ${item.malzeme || 'Belirtilmemiş'}
• Cins: ${item.cins || 'Belirtilmemiş'}
• Marka: ${item.marka || 'Belirtilmemiş'}
• Kalite: ${item.kalite || 'Belirtilmemiş'}

🎨 Görsel Özellikler:
• Renk: ${item.renk || 'Belirtilmemiş'}
${item.renkKodu ? `• Renk Kodu: ${item.renkKodu}` : ''}

🔧 Teknik Özellikler:
• Kalınlık: ${item.kalinlik || 0} mm
• Dayanım: ${item.dayanim || 0} kg
• Elastikiyet: ${item.elastikiyet || 0}%
${item.antistatik ? '• Antistatik: Evet' : ''}
${item.uvDayanikli ? '• UV Dayanıklı: Evet' : ''}

📦 Stok Durumu:
• Giriş: ${item.girisMiktar || 0} ${item.birim || 'm'}
• Çıkış: ${item.cikisMiktar || 0} ${item.birim || 'm'}
• Kalan: ${item.kalanMiktar || 0} ${item.birim || 'm'}
• Durum: ${getStockStatusLabel(item)} (%${getStockPercentage(item)})

💰 Fiyat Bilgileri:
• Alış: ${formatPrice(item.satinAlisFiyati ?? 0, item.dovizKur)}
${item.dovizKur && item.dovizKur !== 1 ? `• Döviz: ${item.satinAlisFiyati || 0} ${item.paraBirimi || 'USD'} × ${item.dovizKur}` : ''}
• Tedarikçi: ${item.tedarikci || 'Belirtilmemiş'}

📍 Lokasyon:
• Proje: ${item.proje || 'Stok'}
• Raf: ${item.rafNo || 'Belirtilmemiş'}
${item.lotNo ? `• Lot No: ${item.lotNo}` : ''}

🔧 Kullanım:
${item.kullanimAlani || 'Kullanım alanı belirtilmemiş'}

📅 Tarihler:
• Giriş: ${formatDate(item.girisTarihi)}
${item.uretimTarihi ? `• Üretim: ${formatDate(item.uretimTarihi)}` : ''}
• Yaş: ${getItemAge(item.girisTarihi)}
  `
  alert(details)
}

const exportStock = () => {
  const csvContent = [
    'Malzeme,Cins,Marka,Renk,Kalınlık,Dayanım,Stok,Birim,Fiyat,Tedarikçi,Proje,Raf,Tarih',
    ...filteredItems.value.map(item => [
      item.malzeme,
      item.cins,
      item.marka || '',
      item.renk || '',
      item.kalinlik || '',
      item.dayanim || '',
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
  a.download = `fitil_stok_raporu_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Utility functions
const formatFitilProperties = (item: any) => {
  const parts: string[] = []
  if (item.kalinlik) parts.push(`Ø${item.kalinlik}mm`)
  if (item.dayanim) parts.push(`${item.dayanim}kg`)
  if (item.elastikiyet) parts.push(`%${item.elastikiyet} uzama`)
  return parts.length > 0 ? parts.join(' • ') : 'Özellik belirtilmemiş'
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

const getFitilCinsiClass = (cins: string) => {
  const classes = {
    'pamuk': 'cins-pamuk',
    'polyester': 'cins-polyester',
    'naylon': 'cins-naylon',
    'polipropilen': 'cins-polipropilen',
    'aramid': 'cins-aramid',
    'karbon': 'cins-karbon',
    'cam': 'cins-cam',
    'karma': 'cins-karma',
    'diger': 'cins-other'
  }
  return classes[cins as keyof typeof classes] || 'cins-other'
}

const getColorHex = (colorName: string) => {
  const colorMap: Record<string, string> = {
    'beyaz': '#ffffff',
    'siyah': '#000000',
    'kırmızı': '#dc2626',
    'mavi': '#2563eb',
    'yeşil': '#16a34a',
    'sarı': '#eab308',
    'turuncu': '#ea580c',
    'mor': '#9333ea',
    'gri': '#6b7280',
    'şeffaf': '#f3f4f6'
  }
  return colorMap[colorName?.toLowerCase()] || '#6b7280'
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.fitil-page {
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

.material-type.type-fitil {
  background: #fef3c7;
  color: #92400e;
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

.material-brand {
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

.cins-pamuk { background: #fef7cd; color: #a16207; }
.cins-polyester { background: #e0f2fe; color: #0369a1; }
.cins-naylon { background: #f0f9ff; color: #0284c7; }
.cins-polipropilen { background: #ecfdf5; color: #047857; }
.cins-aramid { background: #fef2f2; color: #dc2626; }
.cins-karbon { background: #374151; color: white; }
.cins-cam { background: #f0f9ff; color: #1e40af; }
.cins-karma { background: #fdf4ff; color: #a21caf; }
.cins-other { background: #f3f4f6; color: #6b7280; }

.kalite-info {
  font-size: 10px;
  color: #6b7280;
}

/* Properties Cell */
.properties-cell {
  min-width: 200px;
}

.main-properties {
  font-weight: 500;
  color: #1e293b;
  font-family: monospace;
  font-size: 13px;
  margin-bottom: 4px;
}

.color-info {
  font-size: 12px;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  flex-shrink: 0;
}

.color-name {
  color: #374151;
  font-weight: 500;
}

.color-code {
  color: #9ca3af;
  font-size: 10px;
}

.extra-properties {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.extra-properties small {
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
  .fitil-page {
    padding: 10px;
  }
  
  .material-info,
  .properties-cell,
  .stock-cell,
  .purchase-info-cell,
  .location-cell {
    min-width: auto;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
}