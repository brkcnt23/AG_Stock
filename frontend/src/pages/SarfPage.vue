<!-- pages/SarfPage.vue - DÜZELTILMIŞ -->
<template>
  <div class="sarf-page">
    <PageHeader 
      title="📦 Sarf Malzeme Yönetimi"
      subtitle="Asma Germe Sistemleri - Sarf Malzeme Takibi"
      item-type="Sarf Malzeme"
      export-label="Stok Raporu"
      @add-item="openAddModal"
      @export="exportStock"
    />

    <StatsGrid 
      :statistics="sarfStatistics" 
      item-type="Sarf Malzeme"
    />

    <FiltersSection 
      :filters="filters"
      :search-text="searchText"
      :malzeme-cinsi-options="sarfCinsiOptions"
      malzeme-cinsi-label="Sarf Malzeme Cinsi"
      search-placeholder="Kalite, malzeme, proje ara..."
      @filter-change="onFilterChange"
      @search-change="onSearchChange"
      @clear-filters="clearFilters"
      @show-stock-only="showOnlyStock"
      @show-project-assigned="showProjectAssigned"
    />

    <BaseDataTable
      title="📋 Sarf Malzeme Listesi"
      item-type="sarf malzemesi"
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
        <th @click="sortBy('kalite')" class="sortable">
          Kalite/Malzeme {{ getSortIcon('kalite') }}
        </th>
        <th @click="sortBy('malzemeCinsi')" class="sortable">
          Cins {{ getSortIcon('malzemeCinsi') }}
        </th>
        <th>Boyutlar</th>
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
        <!-- Kalite/Malzeme -->
        <td class="material-info">
          <div class="material-main">
            <strong class="quality">{{ item.kalite || 'Belirtilmemiş' }}</strong>
            <span class="material-type" :class="getMalzemeTuruClass(item.malzemeTuru)">
              {{ getMalzemeTuruLabel(item.malzemeTuru) }}
            </span>
          </div>
          <div class="material-details" v-if="viewDensity !== 'compact'">
            <span class="material-name">{{ item.malzeme || '-' }}</span>
          </div>
        </td>

        <!-- Cins -->
        <td class="type-cell">
          <span :class="getMalzemeCinsiClass(item.malzemeCinsi)" class="type-badge">
            {{ item.malzemeCinsi || '-' }}
          </span>
        </td>

        <!-- Boyutlar -->
        <td class="dimensions-cell">
          <div class="dimensions-info">
            <div class="main-size">{{ formatMainDimensions(item) }}</div>
            <div class="sub-size" v-if="viewDensity === 'detailed'">
              {{ formatSubDimensions(item) }}
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
              <small v-if="item.imDosyaNo">İM: {{ item.imDosyaNo }}</small>
              <small v-if="item.izlNo">İzl: {{ item.izlNo }}</small>
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
      :title="modalMode === 'add' ? '➕ Yeni Sarf Malzeme Ekle' : '✏️ Sarf Malzeme Düzenle'"
      size="large"
      @close="closeModal"
    >
      <MaterialForm
        :mode="modalMode"
        :item="editingItem"
        :malzeme-cinsi-options="sarfCinsiOptions"
        @save="saveItem"
        @cancel="closeModal"
      >
        <template #specificFields>
          <!-- Sarf malzemeye özel alanlar -->
          <div class="form-row">
            <div class="form-group">
              <label>Sarf Malzeme Türü</label>
              <select v-model="sarfForm.sarfTuru">
                <option value="">Seçiniz</option>
                <option value="KAYNAK">Kaynak Malzemesi</option>
                <option value="VIDA">Vida/Cıvata</option>
                <option value="KESKI">Kesici Takım</option>
                <option value="BAKIM">Bakım Malzemesi</option>
                <option value="TEMIZLIK">Temizlik Malzemesi</option>
                <option value="YAGLAYICI">Yağlayıcı</option>
                <option value="DIĞER">Diğer</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Kritik Stok Seviyesi</label>
              <input 
                v-model="sarfForm.kritikSeviye" 
                type="number" 
                placeholder="5"
              >
            </div>
            
            <div class="form-group">
              <label>Minimum Sipariş Miktarı</label>
              <input 
                v-model="sarfForm.minSiparis" 
                type="number" 
                placeholder="10"
              >
            </div>

            <div class="form-group">
              <label>Son Kullanma Tarihi</label>
              <input 
                v-model="sarfForm.sonKullanma" 
                type="date"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Kullanım Alanı</label>
              <select v-model="sarfForm.kullanimAlani">
                <option value="">Seçiniz</option>
                <option value="IMALAT">İmalat</option>
                <option value="BAKIM">Bakım</option>
                <option value="TEMIZLIK">Temizlik</option>
                <option value="MONTAJ">Montaj</option>
                <option value="GENEL">Genel</option>
              </select>
            </div>
            
            <div class="form-group full-width">
              <label>Kullanım Talimatı</label>
              <textarea 
                v-model="sarfForm.kullanimTalimati" 
                rows="2"
                placeholder="Özel kullanım talimatları..."
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
import { useSarfStore } from '../store/sarfStore'
import type { SarfItem } from '../types/common'
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import FiltersSection from '../components/FiltersSection.vue'
import BaseDataTable from '../components/BaseDataTable.vue'
import BaseModal from '../components/BaseModal.vue'
import MaterialForm from '../components/MaterialForm.vue'
import { safeAccess, ensureString, ensureId } from '../utils/typeHelpers'
// Store
const store = useSarfStore()
// let hasFetched = ref(false) // BUNU KALDIR
let hasFetched = false // REAKTİF OLMAYAN DEĞİŞKEN KULLAN

// Statistics
const sarfStatistics = computed(() => {
  const items = store.items
  const totalItems = items.length
  const totalValue = items.reduce((sum, i) => sum + (i.satinAlisFiyati || 0), 0)
  const lowStock = items.filter(i => {
    const pct = getStockPercentage(i)   // sayfa altındaki util’ı kullan
    return pct < 20
  }).length
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const recentlyAdded = items.filter(i => {
    const d = new Date(i.girisTarihi || '')
    return !isNaN(d.getTime()) && d >= oneMonthAgo
  }).length

  return { totalItems, totalValue, lowStock, recentlyAdded }
})

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
const editingItem = ref<SarfItem | null>(null)

// Sarf malzemeye özel form alanları
const sarfForm = reactive<Pick<SarfItem, 'sarfTuru' | 'kritikSeviye' | 'minSiparis' | 'sonKullanma' | 'kullanimAlani' | 'kullanimTalimati'>>({
  sarfTuru: undefined,
  kritikSeviye: undefined,
  minSiparis: undefined,
  sonKullanma: undefined,
  kullanimAlani: undefined,
  kullanimTalimati: undefined
})

// Sarf malzeme cinsi seçenekleri
const sarfCinsiOptions = [
  { value: 'KAYNAK',  label: 'Kaynak Malzemesi' },
  { value: 'Vida',    label: 'Vida / Cıvata'     },
  { value: 'Keski',   label: 'Kesici Takım'      },
  { value: 'Bakım',   label: 'Bakım Malzemesi'    },
  { value: 'Temizlik',label: 'Temizlik Malzemesi' },
  { value: 'Yağlayıcı',label: 'Yağlayıcı'         },
  { value: 'Elektrik',label: 'Elektrik Malzemesi' },
  { value: 'Emniyet', label: 'Emniyet Malzemesi'  },
  { value: 'Diğer',   label: 'Diğer'              }
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
  // DİKKAT: items'ı kopyala, doğrudan sort etme!
  let items = [...store.items]

  // Search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    items = items.filter((item: SarfItem) => 
      item.kalite?.toLowerCase().includes(search) ||
      item.malzeme?.toLowerCase().includes(search) ||
      item.cins?.toLowerCase().includes(search) ||
      item.proje?.toLowerCase().includes(search) ||
      item.rafNo?.toLowerCase().includes(search) ||
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
  // Eğer zaten veri çekme süreci başladıysa çık:
  if (store.loading) return
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
  // Reset sarf form
  Object.assign(sarfForm, {
    sarfTuru: '',
    kritikSeviye: '',
    minSiparis: '',
    sonKullanma: '',
    kullanimAlani: '',
    kullanimTalimati: ''
  })
  showModal.value = true
}

const editItem = (item: SarfItem) => {
  modalMode.value = 'edit'
  editingItem.value = item
  // Fill sarf form with item data
  Object.assign(sarfForm, {
    sarfTuru: item.sarfTuru || '',
    kritikSeviye: item.kritikSeviye || '',
    minSiparis: item.minSiparis || '',
    sonKullanma: item.sonKullanma || '',
    kullanimAlani: item.kullanimAlani || '',
    kullanimTalimati: item.kullanimTalimati || ''
  })
  showModal.value = true
}

const duplicateItem = (item: SarfItem) => {
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

const saveItem = async (itemData: SarfItem) => {
  try {
    // Add sarf-specific fields
    const finalData = {
      ...itemData,
      ...sarfForm,
      malzemeTuru: 'sarf' as const // Set material type with correct type
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

const deleteItem = async (item: SarfItem) => {
  if (confirm(`"${item.kalite} - ${item.malzemeCinsi}" malzemesini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
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

const viewItemDetails = (item: SarfItem) => {
  const details = `
📋 SARF MALZEME DETAYLARI

🔩 Temel Bilgiler:
• Kalite: ${item.kalite || 'Belirtilmemiş'}
• Tür: ${getMalzemeTuruLabel(item.malzemeTuru || '')}
• Cins: ${item.malzemeCinsi || 'Belirtilmemiş'}
• Açıklama: ${item.malzeme || 'Belirtilmemiş'}

📏 Boyutlar:
• ${formatMainDimensions(item)}
${item.uzunluk ? `• Uzunluk: ${item.uzunluk} mm` : ''}

📦 Stok Durumu:
• Giriş: ${item.girisMiktar || 0} ${item.birim || 'ADET'}
• Çıkış: ${item.cikisMiktar || 0} ${item.birim || 'ADET'}
• Kalan: ${item.kalanMiktar || 0} ${item.birim || 'ADET'}
• Durum: ${getStockStatusLabel(item)} (%${getStockPercentage(item)})

💰 Fiyat Bilgileri:
• Alış: ${formatPrice(item.satinAlisFiyati ?? 0, item.dovizKur)}
${item.dovizKur && item.dovizKur !== 1 ? `• Döviz: ${item.satinAlisFiyati || 0} ${item.paraBirimi || 'USD'} × ${item.dovizKur}` : ''}
• Tedarikçi: ${item.tedarikci || 'Belirtilmemiş'}

🔧 Sarf Özellikleri:
• Tür: ${sarfForm.sarfTuru || 'Belirtilmemiş'}
• Kritik Seviye: ${sarfForm.kritikSeviye || 'Belirtilmemiş'}
• Min. Sipariş: ${sarfForm.minSiparis || 'Belirtilmemiş'}
• Kullanım Alanı: ${sarfForm.kullanimAlani || 'Belirtilmemiş'}
${sarfForm.sonKullanma ? `• Son Kullanma: ${formatDate(sarfForm.sonKullanma)}` : ''}

📍 Lokasyon:
• Proje: ${item.proje || 'Stok'}
• Raf: ${item.rafNo || 'Belirtilmemiş'}
${item.imDosyaNo ? `• İM Dosya: ${item.imDosyaNo}` : ''}
${item.izlNo ? `• İzleme: ${item.izlNo}` : ''}

📅 Tarihler:
• Giriş: ${formatDate(item.girisTarihi)}
• Satın Alma: ${formatDate(typeof item.satinAlisTarihi === 'string' ? item.satinAlisTarihi : item.satinAlisTarihi?.toISOString?.())}
• Yaş: ${getItemAge(item.girisTarihi)}
  `
  alert(details)
}

const exportStock = () => {
  const csvContent = [
    'Kalite,Malzeme,Cins,Boyutlar,Stok,Birim,Fiyat,Tedarikci,Proje,Raf,Tarih',
    ...filteredItems.value.map(item => [
      item.kalite,
      item.malzeme || '',
      item.malzemeCinsi,
      formatMainDimensions(item),
      item.kalanMiktar,
      item.birim || 'ADET',
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
  a.download = `sarf_stok_raporu_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Utility functions
const formatMainDimensions = (item: any) => {
  const parts: string[] = []
  if (item.en) parts.push(`${item.en}`)
  if (item.boy) parts.push(`${item.boy}`)
  if (item.kalinlik) parts.push(`${item.kalinlik}`)
  return parts.length > 0 ? parts.join(' × ') + ' mm' : 'Boyut belirtilmemiş'
}

const formatSubDimensions = (item: any) => {
  const parts: string[] = []
  if (item.uzunluk) parts.push(`Uzunluk: ${item.uzunluk} mm`)
  if (item.birim) parts.push(`Birim: ${item.birim}`)
  return parts.join(' • ')
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

const getMalzemeTuruClass = (tur: string) => {
  const classes = {
    'sarf': 'type-sarf',
    'paslanmaz': 'type-paslanmaz',
    'aluminyum': 'type-aluminyum',
    'çelik': 'type-celik',
    'diğer': 'type-other'
  }
  return classes[tur as keyof typeof classes] || 'type-other'
}

const getMalzemeTuruLabel = (tur: string) => {
  const labels = {
    'sarf': 'Sarf',
    'paslanmaz': 'Paslanmaz',
    'aluminyum': 'Alüminyum',
    'çelik': 'Çelik',
    'diğer': 'Diğer'
  }
  return labels[tur as keyof typeof labels] || 'Belirsiz'
}

const getMalzemeCinsiClass = (cins: string) => {
  const classes = {
    'KAYNAK': 'cins-kaynak',
    'VIDA': 'cins-vida',
    'KESKI': 'cins-keski',
    'BAKIM': 'cins-bakim',
    'TEMIZLIK': 'cins-temizlik',
    'YAGLAYICI': 'cins-yaglayici',
    'ELEKTRIK': 'cins-elektrik',
    'EMNIYET': 'cins-emniyet',
    'DIĞER': 'cins-other'
  }
  return classes[cins as keyof typeof classes] || 'cins-other'
}

// Lifecycle
onMounted(() => {
  if (!hasFetched) {
    fetchData()
    hasFetched = true
  }
})
</script>

<style scoped>
.sarf-page {
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

.material-type {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.type-sarf { background: #fef3c7; color: #92400e; }
.type-paslanmaz { background: #dbeafe; color: #1e40af; }
.type-aluminyum { background: #e0f2fe; color: #0369a1; }
.type-celik { background: #f3f4f6; color: #374151; }
.type-other { background: #fef3c7; color: #92400e; }

.material-details {
  margin-top: 4px;
}

.material-name {
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
}

.cins-kaynak { background: #fef59e; color: #a16207; }
.cins-vida { background: #f0f4f8; color: #475569; }
.cins-keski { background: #fee2e2; color: #991b1b; }
.cins-bakim { background: #ecfdf5; color: #047857; }
.cins-temizlik { background: #f0f9ff; color: #0284c7; }
.cins-yaglayici { background: #fdf4ff; color: #a21caf; }
.cins-elektrik { background: #fffbeb; color: #d97706; }
.cins-emniyet { background: #fef2f2; color: #dc2626; }
.cins-other { background: #f3f4f6; color: #374151; }

/* Dimensions Cell */
.dimensions-cell {
  min-width: 140px;
}

.main-size {
  font-weight: 500;
  color: #1e293b;
  font-family: monospace;
  font-size: 13px;
}

.sub-size {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
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

/* Form Additions */
.form-group.full-width {
  grid-column: span 2;
}

/* Responsive */
@media (max-width: 768px) {
  .sarf-page {
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