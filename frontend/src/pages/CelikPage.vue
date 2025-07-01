<!-- pages/CelikPage.vue - DÜZELTİLMİŞ -->
<template>
  <div class="celik-page">
    <PageHeader 
      title="🔧 Çelik Malzeme Yönetimi"
      subtitle="Asma Germe Sistemleri - Çelik Malzeme Takibi"
      item-type="Çelik Malzeme"
      export-label="Çelik Raporu"
      @add-item="openAddModal"
      @export="exportStock"
    />

    <!-- SADECE store.statistics KULLAN -->
    <StatsGrid 
      v-if="!store.loading"
      :statistics="store.statistics"
      item-type="Çelik Malzeme"
    />

    <FiltersSection 
      :filters="filters"
      :search-text="searchText"
      :malzeme-cinsi-options="celikCinsiOptions"
      malzeme-cinsi-label="Çelik Cinsi"
      search-placeholder="Kalite, boyut, proje ara..."
      @filter-change="onFilterChange"
      @search-change="onSearchChange"
      @clear-filters="clearFilters"
      @show-stock-only="showOnlyStock"
      @show-project-assigned="showProjectAssigned"
    />

    <BaseDataTable
      title="📋 Çelik Malzeme Listesi"
      item-type="çelik malzemesi"
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
        <th @click="sortBy('no')" class="sortable">
          No {{ getSortIcon('no') }}
        </th>
        <th @click="sortBy('kalite')" class="sortable">
          Kalite/Standart {{ getSortIcon('kalite') }}
        </th>
        <th @click="sortBy('tip')" class="sortable">
          Çelik Tipi {{ getSortIcon('tip') }}
        </th>
        <th>Boyutlar & Özellikler</th>
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
        <!-- No -->
        <td class="no-cell">
          <div class="celik-no">
            <strong>#{{ item.no || '-' }}</strong>
          </div>
        </td>

        <!-- Kalite/Standart -->
        <td class="material-info">
          <div class="material-main">
            <strong class="quality">{{ item.kalite || 'Belirtilmemiş' }}</strong>
            <span class="material-type type-celik">
              Çelik
            </span>
          </div>
        </td>

        <!-- Çelik Tipi -->
        <td class="type-cell">
          <span :class="getCelikTipiClass(item.tip)" class="type-badge">
            {{ getCelikTipiLabel(item.tip) }}
          </span>
        </td>

        <!-- Boyutlar & Özellikler -->
        <td class="dimensions-cell">
          <div class="dimensions-info">
            <div class="main-size">{{ formatMainDimensions(item) }}</div>
            <div class="sub-info" v-if="viewDensity !== 'compact'">
              <span v-if="item.adet">{{ item.adet }} Adet</span>
              <span v-if="item.uzunluk">• {{ item.uzunluk }}mm</span>
            </div>
          </div>
        </td>

        <!-- Stok Durumu -->
        <td class="stock-cell">
          <div class="stock-display">
            <div class="stock-numbers">
              <span class="current" :class="getStockStatusClass(item)">
                {{ item.kalanMiktar || item.adet || '0' }}
              </span>
              <span class="separator">/</span>
              <span class="total">{{ item.girisMiktar || item.adet || '0' }}</span>
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
              <small v-if="item.imDosyaNo">İM: {{ item.imDosyaNo }}</small>
              <small v-if="item.izlNo">İzl: {{ item.izlNo }}</small>
            </div>
          </div>
        </td>

        <!-- Giriş Tarihi -->
        <td class="date-cell">
          <div class="date-info">
            <div class="entry-date">{{ formatDate(item.girisTarihi) }}</div>
            <div class="purchase-date" v-if="viewDensity !== 'compact'">
              <small>Alış: {{ formatDate(item.satinAlisTarihi) }}</small>
            </div>
          </div>
        </td>
      </template>
    </BaseDataTable>

    <!-- Add/Edit Modal -->
    <BaseModal 
      v-if="showModal"
      :title="modalMode === 'add' ? '➕ Yeni Çelik Malzeme Ekle' : '✏️ Çelik Malzeme Düzenle'"
      size="large"
      @close="closeModal"
    >
      <MaterialForm
        :mode="modalMode"
        :item="editingItem"
        :malzeme-cinsi-options="celikCinsiOptions"
        @save="saveItem"
        @cancel="closeModal"
      >
        <template #specificFields>
          <!-- Çelik özel alanları -->
          <div class="form-row">
            <div class="form-group">
              <label>Çelik No</label>
              <input 
                v-model="celikForm.no" 
                type="number" 
                placeholder="Çelik numarası"
              >
            </div>

            <div class="form-group">
              <label>Boru Çapı</label>
              <input 
                v-model="celikForm.boruCap" 
                type="text" 
                placeholder="Ø90, Ø100..."
              >
            </div>
            
            <div class="form-group">
              <label>Et Kalınlığı</label>
              <input 
                v-model="celikForm.etKalinlik"
                type="text" 
                placeholder="4mm, 6mm..."
              >
            </div>

            <div class="form-group">
              <label>Çelik Tipi</label>
              <select v-model="celikForm.tip">
                <option value="">Seçiniz</option>
                <option value="siyah">Siyah Çelik</option>
                <option value="paslanmaz">Paslanmaz Çelik</option>
                <option value="aluminyum">Alüminyum</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Adet</label>
              <input 
                v-model="celikForm.adet" 
                type="number" 
                placeholder="Kaç adet"
              >
            </div>

            <div class="form-group">
              <label>Uzunluk (mm)</label>
              <input 
                v-model="celikForm.uzunluk" 
                type="number" 
                placeholder="6000"
              >
            </div>

            <div class="form-group full-width">
              <label>Açıklama</label>
              <textarea 
                v-model="celikForm.aciklama" 
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
import { useCelikStore } from '../store/celikStore'
import type { CelikItem, CelikFormData } from '../types/celik'  // celik.ts'den import et
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import FiltersSection from '../components/FiltersSection.vue'
import BaseDataTable from '../components/BaseDataTable.vue'
import BaseModal from '../components/BaseModal.vue'
import MaterialForm from '../components/MaterialForm.vue'

// Store
const store = useCelikStore()

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
const editingItem = ref<CelikItem | null>(null)

// Çelik özel form alanları - düzeltilmiş versiyon
const celikForm = reactive<Partial<CelikItem>>({
  malzemeTuru: 'celik',
  malzemeCinsi: '',
  kalite: '',
  tip: undefined,
  no: undefined,
  boruCap: '',
  etKalinlik: '',
  uzunluk: undefined,
  adet: undefined,
  kalanMiktar: 0,
  birim: 'ADET',
  satinAlisFiyati: 0,
  paraBirimi: 'TL',
  durumu: 'Aktif',
  proje: 'Stok'
})

// Çelik cinsi seçenekleri
const celikCinsiOptions = [
  { value: 'BORU', label: 'Çelik Boru' },
  { value: 'PLAKA', label: 'Çelik Plaka' },
  { value: 'PROFİL', label: 'Çelik Profil' },
  { value: 'LAMA', label: 'Lama Çelik' },
  { value: 'KAYNAK', label: 'Kaynak Teli' },
  { value: 'VİDA', label: 'Çelik Vida' },
  { value: 'DİĞER', label: 'Diğer' }
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
    items = items.filter((item: CelikItem) => 
      item.kalite?.toLowerCase().includes(search) ||
      item.boruCap?.toLowerCase().includes(search) ||
      item.tip?.toLowerCase().includes(search) ||
      item.proje?.toLowerCase().includes(search) ||
      item.rafNo?.toLowerCase().includes(search) ||
      item.tedarikci?.toLowerCase().includes(search) ||
      item.aciklama?.toLowerCase().includes(search)
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
        items = items.filter((item: any) => item.tip === value)
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

// Methods - Standart metodlar (diğer sayfalardan kopyala)
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
  // Reset çelik form
  Object.assign(celikForm, {
    no: undefined,
    boruCap: '',
    etKalinlik: '',
    tip: '',
    adet: undefined,
    uzunluk: undefined,
    aciklama: ''
  })
  showModal.value = true
}

const editItem = (item: CelikItem) => {
  modalMode.value = 'edit'
  editingItem.value = item
  Object.assign(celikForm, {
    no: item.no,
    boruCap: item.boruCap || '',
    etKalinlik: item.etKalinlik || '',
    tip: item.tip,
    adet: item.adet,
    uzunluk: item.uzunluk,
    aciklama: item.aciklama || '',
    malzemeCinsi: item.malzemeCinsi,
    kalite: item.kalite,
    kalanMiktar: item.kalanMiktar,
    birim: item.birim,
    satinAlisFiyati: item.satinAlisFiyati,
    paraBirimi: item.paraBirimi,
    durumu: item.durumu
  })
  showModal.value = true
}

const duplicateItem = (item: CelikItem) => {
  modalMode.value = 'add'
  editingItem.value = { 
    ...item, 
    _id: '', 
    id: '',
    girisTarihi: new Date().toISOString().split('T')[0] 
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const saveItem = async (itemData: Partial<CelikItem>) => {
  try {
    const finalData: Partial<CelikItem> = {
      ...itemData,
      ...celikForm,
      malzemeTuru: 'celik',
      tip: celikForm.tip as 'siyah' | 'paslanmaz' | 'aluminyum',
      durumu: celikForm.durumu as 'Aktif' | 'Pasif',
      paraBirimi: celikForm.paraBirimi as 'TL' | 'USD' | 'EUR'
    }
    
    if (modalMode.value === 'add') {
      await store.addItem(finalData)
    } else {
      await store.updateItem(itemData._id!, finalData)
    }
    closeModal()
  } catch (error) {
    console.error('Save error:', error)
    alert('Kayıt sırasında bir hata oluştu!')
  }
}

const deleteItem = async (item: CelikItem) => {
  if (confirm(`"${item.kalite} - ${item.tip}" çelik malzemesini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
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

const viewItemDetails = (item: CelikItem) => {
  const details = `
🔧 ÇELİK MALZEME DETAYLARI

⚙️ Temel Bilgiler:
• No: #${item.no || '-'}
• Kalite: ${item.kalite || 'Belirtilmemiş'}
• Tip: ${getCelikTipiLabel(item.tip ?? '')}

📏 Boyutlar:
• Boru Çapı: ${item.boruCap || 'Belirtilmemiş'}
• Et Kalınlığı: ${item.etKalinlik || 'Belirtilmemiş'}
• Uzunluk: ${item.uzunluk ? item.uzunluk + 'mm' : 'Belirtilmemiş'}
• Adet: ${item.adet || 0}

📦 Stok Durumu:
• Giriş: ${item.girisMiktar || item.adet || 0} ${item.birim || 'ADET'}
• Çıkış: ${item.cikisMiktar || 0} ${item.birim || 'ADET'}
• Kalan: ${item.kalanMiktar || item.adet || 0} ${item.birim || 'ADET'}
• Durum: ${getStockStatusLabel(item)} (%${getStockPercentage(item)})

💰 Fiyat Bilgileri:
• Alış: ${formatPrice(item.satinAlisFiyati ?? 0, item.dovizKur)}
${item.dovizKur && item.dovizKur !== 1 ? `• Döviz: ${item.satinAlisFiyati || 0} ${item.paraBirimi || 'USD'} × ${item.dovizKur}` : ''}
• Tedarikçi: ${item.tedarikci || 'Belirtilmemiş'}

📍 Lokasyon:
• Proje: ${item.proje || 'Stok'}
• Raf: ${item.rafNo || 'Belirtilmemiş'}
${item.imDosyaNo ? `• İM Dosya: ${item.imDosyaNo}` : ''}
${item.izlNo ? `• İzleme: ${item.izlNo}` : ''}

📝 Açıklama:
${item.aciklama || 'Açıklama belirtilmemiş'}
  `
  alert(details)
}

const exportStock = () => {
  const csvContent = [
    'No,Kalite,Tip,Boru Çapı,Et Kalınlığı,Uzunluk,Adet,Stok,Birim,Fiyat,Tedarikci,Proje,Raf,Giriş Tarihi,Satın Alma Tarihi',
    ...filteredItems.value.map(item => [
      item.no || '',
      item.kalite,
      getCelikTipiLabel(item.tip ?? ''),
      item.boruCap || '',
      item.etKalinlik || '',
      item.uzunluk || '',
      item.adet || '',
      item.kalanMiktar || item.adet || '',
      item.birim || 'ADET',
      formatPrice(item.satinAlisFiyati ?? 0, item.dovizKur ?? 1),
      item.tedarikci || '',
      item.proje || 'Stok',
      item.rafNo,
      formatDate(item.girisTarihi),
      formatDate(item.satinAlisTarihi)
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `celik_stok_raporu_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Utility functions
const formatMainDimensions = (item: CelikItem) => {
  const parts: string[] = []
  if (item.boruCap) parts.push(item.boruCap)
  if (item.etKalinlik) parts.push(`et: ${item.etKalinlik}`)
  return parts.length > 0 ? parts.join(' • ') : 'Boyut belirtilmemiş'
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

const getStockPercentage = (item: any) => {
  const kalan = parseFloat(item.kalanMiktar || item.adet || '0')
  const giris = parseFloat(item.girisMiktar || item.adet || '0')
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

const getCelikTipiClass = (tip: string) => {
  const classes = {
    'siyah': 'tip-siyah',
    'paslanmaz': 'tip-paslanmaz',
    'aluminyum': 'tip-aluminyum'
  }
  return classes[tip as keyof typeof classes] || 'tip-other'
}

const getCelikTipiLabel = (tip: string) => {
  const labels = {
    'siyah': 'Siyah Çelik',
    'paslanmaz': 'Paslanmaz',
    'aluminyum': 'Alüminyum'
  }
  return labels[tip as keyof typeof labels] || 'Belirsiz'
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.celik-page {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

/* No Cell */
.no-cell {
  min-width: 80px;
  text-align: center;
}

.celik-no strong {
  color: #1e293b;
  font-size: 14px;
  font-family: monospace;
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

.material-type.type-celik {
  background: #f3f4f6;
  color: #374151;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
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

.tip-siyah { background: #374151; color: white; }
.tip-paslanmaz { background: #e5e7eb; color: #374151; }
.tip-aluminyum { background: #e0e7ff; color: #3730a3; }
.tip-other { background: #f9fafb; color: #6b7280; }

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
  font-size: 11px;
  color: #6b7280;
  display: flex;
  gap: 8px;
}

/* Stock Cell - Use same styles as other pages */
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

.purchase-date small {
  font-size: 11px;
  color: #6b7280;
}

/* Form styling */
.form-group.full-width {
  grid-column: span 2;
}

/* Responsive */
@media (max-width: 768px) {
  .celik-page {
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
</style>