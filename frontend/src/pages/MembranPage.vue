<!-- pages/MembranPage.vue - TAMAMLANMIŞ HALİ -->
<template>
  <div class="membran-page">
    <PageHeader 
      title="📄 Membran Yönetimi"
      subtitle="Asma Germe Sistemleri - Membran Malzeme Takibi"
      item-type="Membran"
      export-label="Membran Raporu"
      @add-item="openAddModal"
      @export="exportStock"
    />

    <StatsGrid 
      :statistics="store.statistics" 
      item-type="Membran"
    />

    <FiltersSection 
      :filters="filters"
      :search-text="searchText"
      :malzeme-cinsi-options="membranCinsiOptions"
      malzeme-cinsi-label="Membran Cinsi"
      search-placeholder="Kalite, boyut, proje ara..."
      @filter-change="onFilterChange"
      @search-change="onSearchChange"
      @clear-filters="clearFilters"
      @show-stock-only="showOnlyStock"
      @show-project-assigned="showProjectAssigned"
    />

    <BaseDataTable
      title="📋 Membran Listesi"
      item-type="membran"
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
        <th @click="sortBy('paletNo')" class="sortable">
          Palet No {{ getSortIcon('paletNo') }}
        </th>
        <th @click="sortBy('cins')" class="sortable">
          Membran Cinsi {{ getSortIcon('cins') }}
        </th>
        <th>Boyutlar & Özellikler</th>
        <th @click="sortBy('topSayisi')" class="sortable">
          Stok Durumu {{ getSortIcon('topSayisi') }}
        </th>
        <th>Alış Bilgileri</th>
        <th @click="sortBy('proje')" class="sortable">
          Proje/Lokasyon {{ getSortIcon('proje') }}
        </th>
        <th @click="sortBy('createdAt')" class="sortable">
          Kayıt Tarihi {{ getSortIcon('createdAt') }}
        </th>
      </template>

      <template #table-body="{ item }">
        <!-- Palet No -->
        <td class="palet-info">
          <div class="palet-main">
            <strong class="palet-no">{{ item.paletNo || 'P-' + String(Math.random()).substr(2,4) }}</strong>
            <span class="material-type type-membran">
              Membran
            </span>
          </div>
          <div class="palet-details" v-if="viewDensity !== 'compact'">
            <span class="brand-model">{{ item.marka || '-' }} {{ item.model || '' }}</span>
          </div>
        </td>

        <!-- Membran Cinsi -->
        <td class="type-cell">
          <span :class="getMembranCinsiClass(item.cins)" class="type-badge">
            {{ item.cins || '-' }}
          </span>
          <div v-if="viewDensity === 'detailed' && item.mesh" class="mesh-indicator">
            🕸️ Mesh
          </div>
        </td>

        <!-- Boyutlar & Özellikler -->
        <td class="dimensions-cell">
          <div class="dimensions-info">
            <div class="main-size">{{ formatMembranDimensions(item) }}</div>
            <div class="sub-info" v-if="viewDensity !== 'compact'">
              <div class="color-info">
                <span class="color-label">Renk:</span>
                <span class="color-value" :style="{ color: getColorHex(item.renk) }">
                  {{ item.renk || 'Belirtilmemiş' }}
                </span>
                <span v-if="item.renkKodu" class="color-code">({{ item.renkKodu }})</span>
              </div>
              <div v-if="viewDensity === 'detailed'" class="extra-info">
                <small v-if="item.partiNo">Parti: {{ item.partiNo }}</small>
                <small v-if="item.seriNo">Seri: {{ item.seriNo }}</small>
              </div>
            </div>
          </div>
        </td>

        <!-- Stok Durumu -->
        <td class="stock-cell">
          <div class="stock-display">
            <div class="stock-numbers">
              <span class="current" :class="getStockStatusClass(item)">
                {{ item.topSayisi || '0' }}
              </span>
              <span class="unit">top</span>
            </div>
            <div class="stock-details" v-if="viewDensity !== 'compact'">
              <div class="area-info">
                <span>{{ formatArea(item.alan) }} m²</span>
              </div>
              <div class="length-info">
                <small>{{ item.topUzunlugu || 0 }}m × {{ item.topSayisi || 0 }}</small>
              </div>
            </div>
            <div class="stock-status">
              <span :class="getStockStatusClass(item)">
                {{ getStockStatusLabel(item) }}
              </span>
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
                <small>{{ item.satinAlisFiyati }}$ × {{ item.dovizKur }}</small>
              </div>
              <div class="purchase-date">
                <small>{{ formatDate(item.satinAlisTarihi) }}</small>
              </div>
            </div>
          </div>
        </td>

        <!-- Proje/Lokasyon -->
        <td class="location-cell">
          <div class="location-info">
            <div class="project-name">{{ item.proje || 'Stok' }}</div>
            <div class="status-info">
              <span class="status-badge" :class="getDurumClass(item.durum)">
                {{ item.durum || 'Beklemede' }}
              </span>
            </div>
            <div v-if="viewDensity === 'detailed' && item.sahibi" class="owner-info">
              <small>👤 {{ item.sahibi }}</small>
            </div>
          </div>
        </td>

        <!-- Kayıt Tarihi -->
        <td class="date-cell">
          <div class="date-info">
            <div class="entry-date">{{ formatDate(item.createdAt) }}</div>
            <div class="age-info" v-if="viewDensity !== 'compact'">
              <small>{{ getItemAge(item.createdAt) }}</small>
            </div>
          </div>
        </td>
      </template>
    </BaseDataTable>

    <!-- Add/Edit Modal -->
    <BaseModal 
      v-if="showModal"
      :title="modalMode === 'add' ? '➕ Yeni Membran Ekle' : '✏️ Membran Düzenle'"
      size="large"
      @close="closeModal"
    >
      <MaterialForm
        :mode="modalMode"
        :item="editingItem"
        :malzeme-cinsi-options="membranCinsiOptions"
        @save="saveItem"
        @cancel="closeModal"
      >
        <template #specificFields>
          <!-- Membrana özel alanlar -->
          <div class="form-row">
            <div class="form-group">
              <label>Palet No</label>
              <input 
                v-model="membranForm.paletNo" 
                type="text" 
                placeholder="Otomatik oluşturulacak"
              >
            </div>
            
            <div class="form-group">
              <label>Marka *</label>
              <input 
                v-model="membranForm.marka" 
                type="text" 
                required
                placeholder="Ferrari, Mehler, Serge..."
              >
            </div>
            
            <div class="form-group">
              <label>Model</label>
              <input 
                v-model="membranForm.model" 
                type="text" 
                placeholder="Model adı"
              >
            </div>

            <div class="form-group">
              <label>Renk</label>
              <select v-model="membranForm.renk">
                <option value="">Seçiniz</option>
                <option value="Beyaz">Beyaz</option>
                <option value="Krem">Krem</option>
                <option value="Gri">Gri</option>
                <option value="Siyah">Siyah</option>
                <option value="Mavi">Mavi</option>
                <option value="Yeşil">Yeşil</option>
                <option value="Kırmızı">Kırmızı</option>
                <option value="Sarı">Sarı</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Renk Kodu</label>
              <input 
                v-model="membranForm.renkKodu" 
                type="text" 
                placeholder="RAL 9016, Pantone..."
              >
            </div>
            
            <div class="form-group">
              <label>Parti No</label>
              <input 
                v-model="membranForm.partiNo" 
                type="text" 
                placeholder="Üretici parti no"
              >
            </div>
            
            <div class="form-group">
              <label>Seri No</label>
              <input 
                v-model="membranForm.seriNo" 
                type="text" 
                placeholder="Seri numarası"
              >
            </div>

            <div class="form-group">
              <label>Top Sayısı *</label>
              <input 
                v-model="membranForm.topSayisi" 
                type="number" 
                required
                placeholder="5"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Top Uzunluğu (m)</label>
              <input 
                v-model="membranForm.topUzunlugu" 
                type="number" 
                step="0.1"
                placeholder="50"
              >
            </div>
            
            <div class="form-group">
              <label>Alan (m²)</label>
              <input 
                v-model="membranForm.alan" 
                type="number" 
                step="0.01"
                placeholder="Otomatik hesaplanır"
              >
            </div>
            
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="membranForm.mesh">
                <span>🕸️ Mesh Yapısı</span>
              </label>
            </div>

            <div class="form-group">
              <label>Durum</label>
              <select v-model="membranForm.durum">
                <option value="Beklemede">Beklemede</option>
                <option value="Kullanımda">Kullanımda</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="İptal">İptal</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Sahibi/Sorumlu</label>
              <input 
                v-model="membranForm.sahibi" 
                type="text" 
                placeholder="Proje sorumlusu"
              >
            </div>
            
            <div class="form-group full-width">
              <label>Not/Açıklama</label>
              <textarea 
                v-model="membranForm.note" 
                rows="2"
                placeholder="Ek açıklamalar..."
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
import { useMembranStore } from '../store/membranStore'
import type { MembranItem } from '../types/common'
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import FiltersSection from '../components/FiltersSection.vue'
import BaseDataTable from '../components/BaseDataTable.vue'
import BaseModal from '../components/BaseModal.vue'
import MaterialForm from '../components/MaterialForm.vue'
import { safeAccess, ensureString, ensureId } from '../utils/typeHelpers'
// Store
const store = useMembranStore()

// State
const selectedItems = ref<string[]>([])
const viewDensity = ref<'compact' | 'normal' | 'detailed'>('normal')
const itemsPerPage = ref(25)
const currentPage = ref(1)
const searchText = ref('')
const sortField = ref('createdAt')
const sortDirection = ref<'asc' | 'desc'>('desc')
const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingItem = ref<MembranItem | null>(null)

// Membrana özel form alanları
const membranForm = reactive({
  paletNo: undefined,
  marka: undefined,
  model: undefined,
  renk: undefined,
  renkKodu: undefined,
  partiNo: undefined,
  seriNo: undefined,
  topSayisi: undefined,
  topUzunlugu: undefined,
  alan: undefined,
  mesh: false,
  durum: 'Beklemede',
  sahibi: undefined,
  note: undefined
})

// Membran cinsi seçenekleri
const membranCinsiOptions = [
  { value: 'PTFE', label: 'PTFE Membran' },
  { value: 'ETFE', label: 'ETFE Membran' },
  { value: 'PVC', label: 'PVC Membran' },
  { value: 'POLYESTER', label: 'Polyester Membran' },
  { value: 'DİĞER', label: 'Diğer' }
]

// Computed
const filteredItems = computed(() => {
  let items = store.items

  // Search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    items = items.filter((item: any) => {
    const searchableFields = [
        safeAccess(item, 'paletNo', ''),
        safeAccess(item, 'marka', ''),
        safeAccess(item, 'model', ''),
        safeAccess(item, 'proje', ''),
        safeAccess(item, 'renk', ''),
        safeAccess(item, 'cins', ''),
        safeAccess(item, 'aciklama', '')
      ]
      return searchableFields.some(field => field.toLowerCase().includes(search))
    })
  }

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (key === 'proje' && value === '!Stok') {
        items = items.filter((item: any) => item.proje && item.proje !== 'Stok')
      } else if (key === 'stockStatus') {
        items = items.filter((item: any) => {
          const topSayisi = parseInt(item.topSayisi || '0')
          switch (value) {
            case 'sufficient': return topSayisi > 5
            case 'low': return topSayisi >= 2 && topSayisi <= 5
            case 'critical': return topSayisi === 1
            case 'empty': return topSayisi === 0
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

// Methods
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
  // Reset membran form
  Object.assign(membranForm, {
    paletNo: '',
    marka: '',
    model: '',
    renk: '',
    renkKodu: '',
    partiNo: '',
    seriNo: '',
    topSayisi: '',
    topUzunlugu: '',
    alan: '',
    mesh: false,
    durum: 'Beklemede',
    sahibi: '',
    note: ''
  })
  showModal.value = true
}

const editItem = (item: MembranItem) => {
  modalMode.value = 'edit'
  editingItem.value = item
  // Fill membran form with item data
  Object.assign(membranForm, {
    paletNo: item.paletNo || '',
    marka: item.marka || '',
    model: item.model || '',
    renk: item.renk || '',
    renkKodu: item.renkKodu || '',
    dayanim: item.dayanim || '',
    seriNo: item.seriNo || '',
    topSayisi: item.topSayisi || '',
    topUzunlugu: item.topUzunlugu || '',
    alan: item.alan || '',
    mesh: item.mesh || false,
    durum: item.durum || 'Beklemede',
    sahibi: item.sahibi || '',
    note: item.note || ''
  })
  showModal.value = true
}

const duplicateItem = (item: MembranItem) => {
  modalMode.value = 'add'
  editingItem.value = { 
    ...item, 
    _id: undefined, 
    id: undefined,
    paletNo: undefined, // Yeni palet no oluşturulsun
    createdAt: new Date().toISOString()
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const filters = reactive({
  malzemeTuru: '',
  malzemeCinsi: '',
  stockStatus: '',
  proje: '',
  rafNo: ''
})

const saveItem = async (itemData: MembranItem) => {
  try {
    // Add membran-specific fields
    const finalData = {
      ...itemData,
      ...membranForm,
      durum: (membranForm.durum as "Beklemede" | "Kullanımda" | "Tamamlandı" | "İptal" | undefined),
      malzemeTuru: "membran" as const // Set material type with correct literal type
    }
    
    if (modalMode.value === 'add') {
      await store.addItem(finalData)
    } else {
      await store.updateItem(finalData._id || finalData.id || '', finalData)
    }
    closeModal()
  } catch (error) {
    console.error('Save error:', error)
    alert('Kayıt sırasında bir hata oluştu!')
  }
}

const deleteItem = async (item: MembranItem) => {
  if (confirm(`"${item.paletNo || item.marka} - ${item.cins}" membranını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
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

const viewItemDetails = (item: MembranItem) => {
  const details = `
📄 MEMBRAN DETAYLARI

🏷️ Palet Bilgileri:
• Palet No: ${item.paletNo || 'Otomatik'}
• Marka: ${item.marka || 'Belirtilmemiş'}
• Model: ${item.model || 'Belirtilmemiş'}
• Cins: ${item.cins || 'Belirtilmemiş'}
${item.mesh ? '• Mesh: Var' : ''}

🎨 Renk & Özellikler:
• Renk: ${item.renk || 'Belirtilmemiş'}
${item.renkKodu ? `• Renk Kodu: ${item.renkKodu}` : ''}
${item.partiNo ? `• Parti No: ${item.partiNo}` : ''}
${item.seriNo ? `• Seri No: ${item.seriNo}` : ''}
${item.tip ? `• Tip: ${item.tip}` : ''}

📏 Boyutlar:
• En: ${item.en || 0} mm
• Top Uzunluğu: ${item.topUzunlugu || 0} m
• Toplam Uzunluk: ${item.toplamUzunluk || 0} m
• Alan: ${formatArea(Number(item.alan) || 0)} m²

📦 Stok Durumu:
• Top Sayısı: ${item.topSayisi || 0}
• Durum: ${getStockStatusLabel(item)}

💰 Fiyat Bilgileri:
• Alış: ${formatPrice(item.satinAlisFiyati ?? 0, item.dovizKur)}
${item.dovizKur && item.dovizKur !== 1 ? `• Döviz: ${item.satinAlisFiyati || 0}$ × ${item.dovizKur}` : ''}
• Alış Tarihi: ${formatDate(item.satinAlisTarihi)}

📍 Lokasyon:
• Proje: ${item.proje || 'Stok'}
• Durum: ${item.durum || 'Beklemede'}
${item.sahibi ? `• Sahibi: ${item.sahibi}` : ''}
${item.note ? `• Not: ${item.note}` : ''}

📅 Tarihler:
• Kayıt: ${formatDate(item.createdAt)}
• Yaş: ${getItemAge(typeof item.createdAt === 'string' ? item.createdAt : item.createdAt?.toISOString())}
  `
  alert(details)
}

const exportStock = () => {
  const csvContent = [
    'Palet No,Marka,Model,Cins,Renk,Top Sayısı,Alan (m²),Proje,Durum,Kayıt Tarihi',
    ...filteredItems.value.map(item => [
      item.paletNo || '',
      item.marka || '',
      item.model || '',
      item.cins || '',
      item.renk || '',
      item.topSayisi || 0,
      item.alan || 0,
      item.proje || 'Stok',
      item.durum || 'Beklemede',
      formatDate(item.createdAt)
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `membran_raporu_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Utility functions
const formatMembranDimensions = (item: any) => {
  if (item.en && item.topUzunlugu) {
    return `${item.en} mm × ${item.topUzunlugu} m`
  }
  if (item.en) return `${item.en} mm genişlik`
  if (item.topUzunlugu) return `${item.topUzunlugu} m uzunluk`
  return 'Boyut belirtilmemiş'
}

const formatArea = (area: number) => {
  if (!area) return '0'
  return area.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
}

const formatPrice = (price: number, exchangeRate: number = 1) => {
  if (!price) return 'Fiyat belirtilmemiş'
  const tlPrice = price * exchangeRate
  return `${tlPrice.toLocaleString('tr-TR')} ₺`
}

const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return 'Tarih belirtilmemiş'
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString('tr-TR')
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

const getStockStatusClass = (item: any) => {
  const topSayisi = parseInt(item.topSayisi || '0')
  if (topSayisi === 0) return 'empty'
  if (topSayisi === 1) return 'critical'
  if (topSayisi <= 5) return 'low'
  return 'sufficient'
}

const getStockStatusLabel = (item: any) => {
  const topSayisi = parseInt(item.topSayisi || '0')
  if (topSayisi === 0) return 'Tükendi'
  if (topSayisi === 1) return 'Kritik'
  if (topSayisi <= 5) return 'Az'
  return 'Yeterli'
}

const getMembranCinsiClass = (cins: string) => {
  const classes = {
    'PTFE': 'cins-ptfe',
    'ETFE': 'cins-etfe',
    'PVC': 'cins-pvc',
    'POLYESTER': 'cins-polyester',
    'DİĞER': 'cins-other'
  }
  return classes[cins as keyof typeof classes] || 'cins-other'
}

const getDurumClass = (durum: string) => {
  const classes = {
    'Beklemede': 'status-waiting',
    'Kullanımda': 'status-in-use',
    'Tamamlandı': 'status-completed',
    'İptal': 'status-cancelled'
  }
  return classes[durum as keyof typeof classes] || 'status-waiting'
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
    'gri': '#6b7280'
  }
  return colorMap[colorName?.toLowerCase()] || '#374151'
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.membran-page {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

/* Palet Info Cell */
.palet-info {
  min-width: 180px;
}

.palet-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.palet-no {
  color: #1e293b;
  font-size: 14px;
  font-family: monospace;
}

.material-type.type-membran {
  background: #f3e8ff;
  color: #7c3aed;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.palet-details {
  margin-top: 4px;
}

.brand-model {
  font-size: 12px;
  color: #6b7280;
}

/* Type Cell */
.type-cell {
  min-width: 100px;
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

.cins-ptfe { background: #e0f2fe; color: #0369a1; }
.cins-etfe { background: #dbeafe; color: #1e40af; }
.cins-pvc { background: #dcfce7; color: #166534; }
.cins-polyester { background: #fef3c7; color: #92400e; }
.cins-other { background: #f3f4f6; color: #374151; }

.mesh-indicator {
  font-size: 10px;
  color: #6b7280;
}

/* Dimensions Cell */
.dimensions-cell {
  min-width: 200px;
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

.color-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.color-label {
  color: #6b7280;
}

.color-value {
  font-weight: 500;
}

.color-code {
  color: #9ca3af;
  font-size: 10px;
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

/* Stock Cell */
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

.unit {
  color: #6b7280;
  font-size: 11px;
}

.stock-details {
  font-size: 11px;
  color: #6b7280;
}

.area-info {
  font-weight: 500;
  color: #374151;
}

.stock-status span.sufficient { color: #10b981; }
.stock-status span.low { color: #f59e0b; }
.stock-status span.critical { color: #ef4444; }
.stock-status span.empty { color: #9ca3af; }

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
.purchase-date {
  font-size: 11px;
  color: #6b7280;
}

/* Location Cell */
.location-cell {
  min-width: 140px;
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

.status-info {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-waiting { background: #fef3c7; color: #92400e; }
.status-in-use { background: #dcfce7; color: #166534; }
.status-completed { background: #e9d5ff; color: #6b21a8; }
.status-cancelled { background: #fef2f2; color: #dc2626; }

.owner-info {
  font-size: 11px;
  color: #6b7280;
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

/* Responsive */
@media (max-width: 768px) {
  .membran-page {
    padding: 10px;
  }
  
  .palet-info,
  .dimensions-cell,
  .stock-cell,
  .purchase-info-cell,
  .location-cell {
    min-width: auto;
  }
}
</style>