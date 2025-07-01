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

    <BaseModal v-if="showModal" :title="modalMode === 'add' ? 'Yeni Halat Ekle' : 'Halat Düzenle'" size="large"
      @close="closeModal">
      <MaterialForm :mode="modalMode" :item="editingItem" :malzemeCinsiOptions="halatCinsiOptions" @save="saveItem"
        @cancel="closeModal" />
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
    if (modalMode.value === 'add') {
      await store.addItem(itemData)
    } else if (editingItem.value) {
      await store.updateItem(editingItem.value._id, itemData)
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

.cins-celik {
  background: #374151;
  color: white;
}

.cins-paslanmaz {
  background: #e5e7eb;
  color: #374151;
}

.cins-galvaniz {
  background: #fef3c7;
  color: #92400e;
}

.cins-sentetik {
  background: #dcfce7;
  color: #166534;
}

.cins-karma {
  background: #e0f2fe;
  color: #0369a1;
}

.cins-other {
  background: #f3f4f6;
  color: #6b7280;
}

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

.stock-numbers .current.sufficient {
  color: #10b981;
}

.stock-numbers .current.low {
  color: #f59e0b;
}

.stock-numbers .current.critical {
  color: #ef4444;
}

.stock-numbers .current.empty {
  color: #9ca3af;
}

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

.stock-progress.sufficient {
  background: #10b981;
}

.stock-progress.low {
  background: #f59e0b;
}

.stock-progress.critical {
  background: #ef4444;
}

.stock-progress.empty {
  background: #9ca3af;
}

.stock-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.stock-label span.sufficient {
  color: #10b981;
}

.stock-label span.low {
  color: #f59e0b;
}

.stock-label span.critical {
  color: #ef4444;
}

.stock-label span.empty {
  color: #9ca3af;
}

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

/* Table Styles */
.table-container {
  overflow-x: auto;
}

td {
  text-align: left;
  vertical-align: middle;
}

/* Action Column Styles */
.actions-col {
  text-align: right !important;
  white-space: nowrap;
  padding-right: 1rem !important;
}

.actions-col button {
  margin-left: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
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
</style>