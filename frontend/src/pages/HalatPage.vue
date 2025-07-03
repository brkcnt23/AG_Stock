<template>
  <div class="halat-page">
    <PageHeader title="Halat Stokları" subtitle="Çelik, sentetik ve karma halat stoklarınızı yönetin" itemType="Halat"
      exportLabel="Stokları Dışa Aktar" @add-item="openAddModal" @export="exportStock" />

    <StatsGrid :statistics="halatStatistics" itemType="Halat" />

    <FiltersSection :filters="filters" :searchText="searchText" :malzemeCinsiOptions="halatCinsiOptions"
      malzemeCinsiLabel="Halat Cinsi" searchPlaceholder="Kalite, tedarikçi, çap ara..." @filter-change="onFilterChange"
      @search-change="onSearchChange" @clear-filters="clearFilters" @show-stock-only="showOnlyStock"
      @show-project-assigned="showProjectAssigned" />

    <BaseDataTable title="⛓️ Halat Listesi" item-type="halat" :paginated-data="paginatedData"
      :filtered-count="filteredItems.length" :total-items="store.items.length" :current-page="currentPage"
      :items-per-page="itemsPerPage" :current-density="viewDensity" :loading="store.isLoading" :error="store.error"
      :selected-items="selectedItems" @density-change="viewDensity = $event" @items-change="onItemsChange"
      @show-stock-only="showOnlyStock" @show-project-assigned="showProjectAssigned" @clear-filters="clearFilters"
      @toggle-select-all="toggleSelectAll" @item-select="onItemSelect" @page-change="onPageChange"
      @row-click="viewItemDetails" @view-item="viewItemDetails" @edit-item="editItem" @duplicate-item="duplicateItem"
      @delete-item="deleteItem" @retry="fetchData">
      <template #table-head>
        <th @click="sortBy('name')" class="sortable">
          Proje {{ getSortIcon('name') }}
        </th>
        <th @click="sortBy('kalite')" class="sortable">
          Kalite {{ getSortIcon('kalite') }}
        </th>
        <th @click="sortBy('cins')" class="sortable">
          Halat Cinsi {{ getSortIcon('cins') }}
        </th>
        <th>Boyutlar & Özellikler</th>
        <th @click="sortBy('stok')" class="sortable">
          Stok Durumu {{ getSortIcon('stok') }}
        </th>
        <th>Alış Bilgileri</th>
        <th @click="sortBy('createdAt')" class="sortable">
          Kayıt Tarihi {{ getSortIcon('createdAt') }}
        </th>
      </template>

      <template #table-body="{ item }">
        <!-- Proje -->
        <td class="project-info">
          <div class="project-main">
            <strong class="project-name">{{ item.name || 'Stok' }}</strong>
            <span class="material-type type-halat">
              Halat
            </span>
          </div>
        </td>

        <!-- Kalite -->
        <td class="quality-cell">
          <span class="quality-badge">
            {{ item.kalite || '-' }}
          </span>
        </td>

        <!-- Halat Cinsi -->
        <td class="type-cell">
          <span :class="['type-badge', `cins-${item.cins}`]">
            {{ getCinsiLabel(item.cins) }}
          </span>
        </td>

        <!-- Boyutlar & Özellikler -->
        <td class="dimensions-cell">
          <div class="dimensions-info">
            <div class="main-size">Ø {{ item.cap ?? '-' }} mm</div>
            <div v-if="viewDensity !== 'compact'" class="sub-info">
              <div v-if="item.uzunluk" class="length-info">
                {{ item.uzunluk }}m uzunluk
              </div>
            </div>
          </div>
        </td>

        <!-- Stok Durumu -->
        <td class="stock-cell">
          <div class="stock-display">
            <div class="stock-numbers">
              <span class="current" :class="getStockStatusClass(item)">
                {{ item.stok || '0' }}
              </span>
              <span class="unit">{{ item.birim }}</span>
            </div>
            <div v-if="viewDensity !== 'compact'" class="stock-details">
              <div v-if="item.minStokSeviyesi" class="min-stock">
                Min: {{ item.minStokSeviyesi }}
              </div>
            </div>
          </div>
        </td>

        <!-- Alış Bilgileri -->
        <td class="purchase-info-cell">
          <div class="purchase-details">
            <div class="price-main">
              <span class="price-amount">
                {{ formatPrice(item.birimFiyat, item.paraBirimi) }}
              </span>
            </div>
            <div v-if="viewDensity !== 'compact'" class="supplier-info">
              <small>{{ item.tedarikci || '-' }}</small>
            </div>
          </div>
        </td>

        <!-- Kayıt Tarihi -->
        <td class="date-cell">
          <div class="date-info">
            <div class="entry-date">{{ formatDate(item.createdAt) }}</div>
            <div v-if="viewDensity !== 'compact'" class="age-info">
              <small>{{ getItemAge(item.createdAt) }}</small>
            </div>
          </div>
        </td>
      </template>
    </BaseDataTable>

    <BaseModal v-if="showModal" :title="modalMode === 'add' ? '⛓️ Yeni Halat Ekle' : '✏️ Halat Düzenle'" size="large"
  @close="closeModal">
  <MaterialForm :mode="modalMode" :item="editingItem" :malzeme-cinsi-options="halatCinsiOptions" @save="saveItem"
    @cancel="closeModal">
    <template #specificFields>
      <!-- Halata özel alanlar -->
      <div class="form-row">
        <div class="form-group">
          <label>Kalite/Sınıf *</label>
          <select v-model="halatForm.kalite" required>
            <option value="">Seçiniz</option>
            <option value="316L">316L (Marine)</option>
            <option value="304">304 (Standart)</option>
            <option value="A4">A4 (Süper Marine)</option>
            <option value="Galvanizli">Galvanizli</option>
            <option value="Paslanmaz">Paslanmaz</option>
            <option value="Karbon">Karbon Çelik</option>
          </select>
        </div>

        <div class="form-group">
          <label>Halat Cinsi *</label>
          <select v-model="halatForm.cins" required>
            <option value="">Seçiniz</option>
            <option value="celik-halat">🔗 Çelik Halat</option>
            <option value="paslanmaz">⚡ Paslanmaz Halat</option>
            <option value="galvanizli">🔸 Galvanizli Halat</option>
            <option value="sentetik">🧵 Sentetik Halat</option>
            <option value="karma">🔄 Karma Halat</option>
            <option value="pvc-kapli">🛡️ PVC Kaplı</option>
          </select>
        </div>

        <div class="form-group">
          <label>Çap (mm) *</label>
          <select v-model="halatForm.cap" required>
            <option value="">Seçiniz</option>
            <option value="3">3 mm</option>
            <option value="4">4 mm</option>
            <option value="5">5 mm</option>
            <option value="6">6 mm</option>
            <option value="8">8 mm</option>
            <option value="10">10 mm</option>
            <option value="12">12 mm</option>
            <option value="14">14 mm</option>
            <option value="16">16 mm</option>
            <option value="18">18 mm</option>
            <option value="20">20 mm</option>
            <option value="22">22 mm</option>
            <option value="24">24 mm</option>
            <option value="26">26 mm</option>
            <option value="28">28 mm</option>
            <option value="30">30 mm</option>
          </select>
        </div>

        <div class="form-group">
          <label>Uzunluk (m)</label>
          <input v-model="halatForm.uzunluk" type="number" step="0.1" placeholder="100">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Örgü Tipi</label>
          <select v-model="halatForm.orguTipi">
            <option value="">Seçiniz</option>
            <option value="1x7">1x7 (Basit)</option>
            <option value="1x19">1x19 (Esnek)</option>
            <option value="7x7">7x7 (Standart)</option>
            <option value="7x19">7x19 (Çok Esnek)</option>
            <option value="6x19">6x19 (Ağır Hizmet)</option>
            <option value="6x36">6x36 (Çok Ağır)</option>
            <option value="8x19">8x19 (Özel)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Kırılma Yükü (kg)</label>
          <input v-model="halatForm.kirilmaYuku" type="number" placeholder="2000">
        </div>

        <div class="form-group">
          <label>Çalışma Yükü (kg)</label>
          <input v-model="halatForm.calismaYuku" type="number" placeholder="400">
        </div>

        <div class="form-group">
          <label>Güvenlik Faktörü</label>
          <select v-model="halatForm.guvenlikFaktoru">
            <option value="">Seçiniz</option>
            <option value="4">4:1 (Standart)</option>
            <option value="5">5:1 (Yüksek)</option>
            <option value="6">6:1 (Çok Yüksek)</option>
            <option value="8">8:1 (Kritik)</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Makara Uyumu</label>
          <input v-model="halatForm.makaraUyumu" type="text" placeholder="D/d oranı (örn: 8:1)">
        </div>

        <div class="form-group">
          <label>Yüzey İşlemi</label>
          <select v-model="halatForm.yuzeyIslemi">
            <option value="">Seçiniz</option>
            <option value="parlak">Parlak</option>
            <option value="mat">Mat</option>
            <option value="galvanizli">Galvanizli</option>
            <option value="pvc-kapli">PVC Kaplı</option>
            <option value="plastik-kapli">Plastik Kaplı</option>
            <option value="nylon-kapli">Nylon Kaplı</option>
          </select>
        </div>

        <div class="form-group">
          <label>Sertifika</label>
          <select v-model="halatForm.sertifika">
            <option value="">Seçiniz</option>
            <option value="ce">CE</option>
            <option value="tse">TSE</option>
            <option value="iso">ISO</option>
            <option value="din">DIN</option>
            <option value="astm">ASTM</option>
            <option value="sgs">SGS</option>
          </select>
        </div>

        <div class="form-group">
          <label>Sertifika No</label>
          <input v-model="halatForm.sertifikaNo" type="text" placeholder="SGS-2024-001">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Kullanım Alanı</label>
          <select v-model="halatForm.kullanimAlani">
            <option value="">Seçiniz</option>
            <option value="asma-germe">🏗️ Asma Germe</option>
            <option value="vinc">🏗️ Vinç & Kaldırma</option>
            <option value="denizcilik">⚓ Denizcilik</option>
            <option value="madencilik">⛏️ Madencilik</option>
            <option value="insaat">🏢 İnşaat</option>
            <option value="tarim">🚜 Tarım</option>
            <option value="genel">📦 Genel Amaçlı</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ortam Koşulları</label>
          <select v-model="halatForm.ortamKosullari">
            <option value="">Seçiniz</option>
            <option value="ic-mekan">🏠 İç Mekan</option>
            <option value="dis-mekan">🌤️ Dış Mekan</option>
            <option value="deniz">🌊 Deniz Suyu</option>
            <option value="kimyasal">⚗️ Kimyasal</option>
            <option value="yuksek-sicaklik">🔥 Yüksek Sıcaklık</option>
            <option value="asindirici">⚠️ Aşındırıcı</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="halatForm.ucAksesuarli">
            <span>🔗 Uç Aksesuar Dahil</span>
          </label>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="halatForm.ozelUretim">
            <span>⚙️ Özel Üretim</span>
          </label>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Min. Stok Seviyesi</label>
          <input v-model="halatForm.minStokSeviyesi" type="number" placeholder="5">
        </div>

        <div class="form-group">
          <label>Max. Stok Seviyesi</label>
          <input v-model="halatForm.maxStokSeviyesi" type="number" placeholder="100">
        </div>

        <div class="form-group">
          <label>Depo</label>
          <select v-model="halatForm.depo">
            <option value="">Seçiniz</option>
            <option value="ana-depo">Ana Depo</option>
            <option value="saha-depo">Saha Depo</option>
            <option value="proje-sahasi">Proje Sahası</option>
            <option value="musteri">Müşteri</option>
          </select>
        </div>

        <div class="form-group">
          <label>Raf/Lokasyon</label>
          <input v-model="halatForm.raf" type="text" placeholder="R1-S2">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full-width">
          <label>Teknik Açıklama</label>
          <textarea v-model="halatForm.teknikAciklama" rows="3" 
            placeholder="Halat özellikleri, kullanım talimatları, özel notlar..."></textarea>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full-width">
          <label>Bakım Notları</label>
          <textarea v-model="halatForm.bakimNotlari" rows="2" 
            placeholder="Bakım periyodu, özel bakım talimatları..."></textarea>
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
import type { HalatItem } from '../types/halat'
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import FiltersSection from '../components/FiltersSection.vue'
import BaseDataTable from '../components/BaseDataTable.vue'
import BaseModal from '../components/BaseModal.vue'
import MaterialForm from '../components/MaterialForm.vue'

// Store
const store = useHalatStore()
const onPageChange = (page: number) => {
  currentPage.value = page
}
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
const editingItem = ref<HalatItem | null>(null)

// Halat cinsi seçenekleri
const halatCinsiOptions = [
  { value: 'celik', label: 'Çelik Halat' },
  { value: 'sentetik', label: 'Sentetik Halat' },
  { value: 'karma', label: 'Karma Halat' }
]

// Filtreler
const filters = reactive({
  kalite: '',
  cins: '',
  tedarikci: '',
  depo: '',
  raf: ''
})
const halatForm = reactive({
  // Temel özellikler
  kalite: '',
  cins: '',
  cap: null,
  uzunluk: null,
  
  // Teknik özellikler
  orguTipi: '',
  kirilmaYuku: null,
  calismaYuku: null,
  guvenlikFaktoru: '',
  makaraUyumu: '',
  yuzeyIslemi: '',
  
  // Sertifika
  sertifika: '',
  sertifikaNo: '',
  
  // Kullanım
  kullanimAlani: '',
  ortamKosullari: '',
  ucAksesuarli: false,
  ozelUretim: false,
  
  // Stok yönetimi
  minStokSeviyesi: null,
  maxStokSeviyesi: null,
  depo: '',
  raf: '',
  
  // Açıklamalar
  teknikAciklama: '',
  bakimNotlari: ''
})

// Modal'ı açarken form'u temizle veya doldur


// Save item metodunu güncelle

// İstatistikler
const halatStatistics = computed(() => ({
  totalItems: store.items.length,
  totalValue: store.items.reduce((sum, item) => sum + ((item.stok ?? 0) * (item.birimFiyat ?? 0)), 0),
  lowStock: store.items.filter(item => (item.stok ?? 0) <= (item.minStokSeviyesi ?? 5)).length,
  recentlyAdded: store.items.filter(item => {
    if (!item.createdAt) return false
    const created = new Date(item.createdAt)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length
}))

// Filtreli ve sıralı liste
const filteredItems = computed(() => {
  let items = store.items // Access items directly from the store
  // Search
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    items = items.filter(item => {
      const matchesSearch =
        (item.kalite || '').toLowerCase().includes(search) ||
        (item.name || '').toLowerCase().includes(search) ||
        (item.cins || '').toLowerCase().includes(search) ||
        (item.tedarikci || '').toLowerCase().includes(search) ||
        (item.cap?.toString() || '').includes(search)
      return matchesSearch
    })
  }
  // Filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      items = items.filter(item => {
        const filterCondition = (item as any)[key] === value
        return filterCondition
      })
    }
  })
  // Sort
  items = [...items]
  items.sort((a, b) => {
    const aVal = (a as any)[sortField.value] ?? ''
    const bVal = (b as any)[sortField.value] ?? ''
    if (sortDirection.value === 'asc') return aVal > bVal ? 1 : -1
    else return aVal < bVal ? 1 : -1
  })
  return items
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  const data = filteredItems.value.slice(start, end)
  return data
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
    kalite: '',
    cins: '',
    tedarikci: '',
    depo: '',
    raf: ''
  })
  searchText.value = ''
  currentPage.value = 1
}

const showOnlyStock = () => {
  Object.assign(filters, { stok: 'stokta' })
  currentPage.value = 1
}

const showProjectAssigned = () => {
  Object.assign(filters, { proje: 'atanmis' })
  currentPage.value = 1
}

const onItemsChange = (count: string) => {
  itemsPerPage.value = parseInt(count)
  currentPage.value = 1
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

const openAddModal = () => {
  modalMode.value = 'add'
  editingItem.value = null
  
  // Form'u temizle
  Object.assign(halatForm, {
    kalite: '',
    cins: '',
    cap: null,
    uzunluk: null,
    orguTipi: '',
    kirilmaYuku: null,
    calismaYuku: null,
    guvenlikFaktoru: '',
    makaraUyumu: '',
    yuzeyIslemi: '',
    sertifika: '',
    sertifikaNo: '',
    kullanimAlani: '',
    ortamKosullari: '',
    ucAksesuarli: false,
    ozelUretim: false,
    minStokSeviyesi: null,
    maxStokSeviyesi: null,
    depo: '',
    raf: '',
    teknikAciklama: '',
    bakimNotlari: ''
  })
  
  showModal.value = true
}

const editItem = (item: HalatItem) => {
  modalMode.value = 'edit'
  editingItem.value = item
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const saveItem = async (itemData: any) => {
  try {
    // Halat form verilerini itemData ile birleştir
    const completeData = {
      ...itemData,
      ...halatForm
    }
    
    if (modalMode.value === 'add') {
      await store.addItem(completeData)
    } else if (editingItem.value) {
      await store.updateItem(editingItem.value._id, completeData)
    }
    closeModal()
  } catch (error) {
    alert('Kayıt sırasında bir hata oluştu!')
  }
}

const deleteItem = async (item: HalatItem) => {
  if (confirm(`"${item.kalite} - ${item.cins}" halatını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
    try {
      await store.deleteItem(item._id)
      selectedItems.value = selectedItems.value.filter(id => id !== item._id)
    } catch (error) {
      alert('Silme sırasında bir hata oluştu!')
    }
  }
}

const viewItemDetails = (item: HalatItem) => {
  const details = `
⛓️ HALAT DETAYLARI

🔗 Temel Bilgiler:
• Kalite: ${item.kalite || 'Belirtilmemiş'}
• Adı: ${item.name || 'Belirtilmemiş'}
• Cins: ${getCinsiLabel(item.cins || 'celik')}
• Çap: ${item.cap || 0} mm

📦 Stok Durumu:
• Stok: ${item.stok || 0} ${item.birim || ''}
• Min Stok: ${item.minStokSeviyesi ?? '-'}
• Max Stok: ${item.maxStokSeviyesi ?? '-'}

💰 Fiyat Bilgileri:
• Birim Fiyat: ${item.birimFiyat ?? '-'} ${item.paraBirimi || ''}
• Tedarikçi: ${item.tedarikci || 'Belirtilmemiş'}

📍 Lokasyon:
• Depo: ${item.depo || '-'}
• Raf: ${item.raf || '-'}

📝 Açıklama:
${item.aciklama || '-'}

📅 Eklenme: ${formatDate(item.createdAt)}
  `
  alert(details)
}

const exportStock = () => {
  const csvContent = [
    'Adı,Kalite,Cins,Çap,Uzunluk,Stok,Birim,Birim Fiyat,Para Birimi,Tedarikçi,Depo,Raf,Açıklama,Eklenme',
    ...filteredItems.value.map(item => [
      item.name,
      item.kalite || '',
      item.cins,
      item.cap || '',
      item.uzunluk || '',
      item.stok,
      item.birim || '',
      item.birimFiyat ?? '',
      item.paraBirimi || '',
      item.tedarikci || '',
      item.depo || '',
      item.raf || '',
      item.aciklama || '',
      formatDate(item.createdAt)
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

const getCinsiLabel = (cins: string) => {
  const found = halatCinsiOptions.find(opt => opt.value === cins)
  return found ? found.label : cins
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Tarih belirtilmemiş'
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

// Add these utility functions
const getStockStatusClass = (item: HalatItem) => {
  const stok = item.stok || 0
  const minStok = item.minStokSeviyesi || 5

  if (stok === 0) return 'empty'
  if (stok <= minStok / 2) return 'critical'
  if (stok <= minStok) return 'low'
  return 'sufficient'
}

const formatPrice = (price?: number, currency = 'TL') => {
  if (!price) return '-'
  return `${price.toLocaleString('tr-TR')} ${currency}`
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

// Add these new functions before onMounted()
const toggleSelectAll = () => {
  if (selectedItems.value.length === paginatedData.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = paginatedData.value.map(item => item._id)
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

const duplicateItem = (item: HalatItem) => {
  modalMode.value = 'add'
  editingItem.value = {
    ...item,
    _id: '',
    createdAt: new Date().toISOString()
  }
  showModal.value = true
}

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

.project-info {
  min-width: 140px;
}

.project-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.material-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-halat {
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

/* Quality Cell */
.quality-cell {
  min-width: 100px;
}

.quality-badge {
  display: inline-block;
  background: #f3f4f6;
  color: #374151;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
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

.cins-celik-halat { background: #e5e7eb; color: #374151; }
.cins-paslanmaz { background: #f0fdf4; color: #166534; }
.cins-galvanizli { background: #eff6ff; color: #1d4ed8; }

/* Dimensions Cell */
.dimensions-cell {
  min-width: 140px;
}

.dimensions-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.main-size {
  font-weight: 500;
  color: #1e293b;
  font-family: monospace;
  font-size: 13px;
}

.sub-info {
  font-size: 11px;
  color: #6b7280;
}

.length-info {
  color: #6b7280;
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
  margin-left: 2px;
}

.stock-details {
  font-size: 11px;
  color: #6b7280;
}

.min-stock {
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

.price-amount {
  font-family: monospace;
}

.supplier-info {
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
/* HalatPage.vue - <style scoped> bölümüne eklenecek */

/* Form Row Layout */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

/* Checkbox styling */
.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #7c3aed;
  cursor: pointer;
}

/* Special field styling */
.form-group select option {
  padding: 8px;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

/* Halat-specific badges in form */
.form-group select option[value*="celik"] {
  color: #374151;
}

.form-group select option[value*="paslanmaz"] {
  color: #166534;
}

.form-group select option[value*="galvanizli"] {
  color: #1d4ed8;
}

.form-group select option[value*="sentetik"] {
  color: #dc2626;
}

/* Required field indicator */
.form-group label:has(+ input[required]),
.form-group label:has(+ select[required]) {
  position: relative;
}

.form-group label:has(+ input[required])::after,
.form-group label:has(+ select[required])::after {
  content: '*';
  color: #ef4444;
  margin-left: 3px;
  font-weight: bold;
}

/* Responsive form */

@media (max-width: 768px) {
  .halat-page {
    padding: 10px;
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .form-group.full-width {
    grid-column: 1;
  }
  .project-info,
  .quality-cell,
  .type-cell,
  .dimensions-cell,
  .stock-cell,
  .purchase-info-cell,
  .date-cell {
    min-width: auto;
  }
  
  .form-group.full-width {
    grid-column: span ;
  }
}
</style>