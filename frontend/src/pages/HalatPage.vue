<template>
  <div class="halat-page">
    <!-- 1) Başlık ve Export / Add düğmeleri -->
    <PageHeader title="🧵 Halat Yönetimi" subtitle="Asma Germe Sistemleri – Halat Takibi" item-type="Halat"
      export-label="Halat Raporu" @add-item="openAddModal" @export="exportData" />

    <!-- 2) İstatistik Kartları -->
    <StatsGrid :statistics="halatStatistics" item-type="Halat" />

    <!-- 3) Filtre & Arama -->
    <FiltersSection :filters="filters" :search-text="searchText" :malzeme-cinsi-options="halatCinsiOptions"
      malzeme-cinsi-label="Halat Cinsi" search-placeholder="Ad, kalite, tedarikçi ara…" @filter-change="onFilterChange"
      @search-change="onSearchChange" @clear-filters="clearFilters" @show-stock-only="showOnlyStock" />

    <!-- 4) Tablo -->
    <BaseDataTable title="📋 Halat Listesi" item-type="halat malzemesi" :paginated-data="paginatedData"
      :filtered-count="filteredItems.length" :total-items="filteredItems.length" :current-page="currentPage"
      :items-per-page="itemsPerPage" :current-density="viewDensity" :loading="loading" :error="error"
      :selected-items="selectedItems" @density-change="viewDensity = $event" @items-change="onItemsChange"
      @toggle-select-all="toggleSelectAll" @item-select="onItemSelect" @page-change="onPageChange"
      @view-item="viewItemDetails" @edit-item="editItem" @delete-item="deleteItem" @duplicate-item="duplicateItem"
      @retry="fetchData">
      <!-- Sütun Başlıkları -->
      <template #table-head>
        <th>No</th>
        <th>Kalite</th>
        <th>Tip</th>
        <th>Çap (mm)</th>
        <th>Uzunluk (m)</th>
        <th>Stok</th>
        <th>Birim</th>
        <th>Fiyat</th>
        <th>Tedarikçi</th>
        <th>Depo</th>
        <th>Raf</th>
        <th>Açıklama</th>
        <th>Giriş Tarihi</th>
      </template>

      <!-- Satır Hücreleri -->
      <template #table-body="{ item }">
        <td>{{ item.no }}</td>
        <td>{{ item.kalite || '—' }}</td>
        <td>{{ item.tip }}</td>
        <td>{{ item.cap }}</td>
        <td>{{ item.uzunluk ?? '—' }}</td>
        <td>{{ item.kalanMiktar ?? item.stok }}</td>
        <td>{{ item.birim }}</td>
        <td>
          {{ item.satinAlisFiyati
            ? (item.satinAlisFiyati * (item.dovizKur || 1))
              .toLocaleString('tr-TR') + ' ' + (item.paraBirimi || '')
            : '—' }}
        </td>
        <td>{{ item.tedarikci || '—' }}</td>
        <td>{{ item.depo || '—' }}</td>
        <td>{{ item.rafNo || '—' }}</td>
        <td>{{ item.aciklama || '—' }}</td>
        <td>
          {{ new Date(item.girisTarihi).toLocaleDateString('tr-TR') }}
        </td>
      </template>
    </BaseDataTable>

    <!-- 5) Ekle / Düzenle Modalları -->
    <HalatModal v-if="showCreateModal" :halat="editingItem" @close="closeModals" @save="handleSave" />
    <StockUpdateModal v-if="showStockModal" :item="editingItem" item-type="halat" @close="closeModals"
      @save="handleStockUpdate" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useHalatStore } from '../store/halatStore'
import PageHeader from '../components/PageHeader.vue'
import StatsGrid from '../components/StatsGrid.vue'
import FiltersSection from '../components/FiltersSection.vue'
import BaseDataTable from '../components/BaseDataTable.vue'
import HalatModal from '../components/HalatModal.vue'
import StockUpdateModal from '../components/StockUpdateModal.vue'
import type { HalatItem } from '../types/halat'

// --- Store ve temel state ---
const store = useHalatStore()
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const halats = computed(() => store.halats)

// --- Filtre & Arama state ---
const filters = reactive({
  status: '' as '' | 'stokta' | 'tukendi' | 'kritik',
  type: '' as '' | 'celik' | 'sentetik' | 'karma',
  depo: '',
  tedarikci: ''
})
const searchText = ref('')
const halatCinsiOptions = [
  { value: 'celik', label: 'Çelik Halat' },
  { value: 'sentetik', label: 'Sentetik Halat' },
  { value: 'karma', label: 'Karma Halat' }
]

// --- Tablo seçim ve paging ---
const selectedItems = ref<string[]>([])
const viewDensity = ref<'compact' | 'normal' | 'detailed'>('normal')
const itemsPerPage = ref(20)
const currentPage = ref(1)

// --- Filtrelenmiş ve sayfalı veri ---
const filteredItems = computed(() => {
  let list = halats.value

  // Arama
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    list = list.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.kalite?.toLowerCase().includes(q) ||
      h.tedarikci?.toLowerCase().includes(q)
    )
  }

  // Durum
  if (filters.status) {
    if (filters.status === 'stokta') list = list.filter(h => h.stok > 0)
    if (filters.status === 'tukendi') list = list.filter(h => h.stok === 0)
    if (filters.status === 'kritik') list = list.filter(h => h.stok <= (h.minStokSeviyesi || 5))
  }

  // Cins, depo, tedarikçi
  if (filters.type) list = list.filter(h => h.cins === filters.type)
  if (filters.depo) list = list.filter(h => h.depo === filters.depo)
  if (filters.tedarikci) list = list.filter(h => h.tedarikci === filters.tedarikci)

  return list
})
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredItems.value.slice(start, start + itemsPerPage.value)
})

// --- İstatistikler ---
const halatStatistics = computed(() => ({
  totalItems: halats.value.length,
  totalValue: halats.value.reduce((sum, h) => sum + (h.birimFiyat || 0), 0),
  lowStock: halats.value.filter(h => h.stok <= (h.minStokSeviyesi || 5)).length,
  recentlyAdded: halats.value.filter(h =>
    new Date(h.createdAt) >= new Date(Date.now() - 30 * 24 * 3600 * 1000)
  ).length
}))

// --- Tablo ve filtre eventleri ---
function onFilterChange(newF: typeof filters) { Object.assign(filters, newF); currentPage.value = 1 }
function onSearchChange(q: string) { searchText.value = q; currentPage.value = 1 }
function clearFilters() { Object.assign(filters, { status: '', type: '', depo: '', tedarikci: '' }); searchText.value = ''; currentPage.value = 1 }
function showOnlyStock() { filters.status = 'stokta'; currentPage.value = 1 }
function onItemsChange(n: string) { itemsPerPage.value = +n; currentPage.value = 1 }
function onPageChange(p: number) { currentPage.value = p }
function toggleSelectAll() {
  if (selectedItems.value.length === paginatedData.value.length) selectedItems.value = []
  else selectedItems.value = paginatedData.value.map(h => h._id)
}
function onItemSelect(id: string) {
  const i = selectedItems.value.indexOf(id)
  if (i >= 0) selectedItems.value.splice(i, 1)
  else selectedItems.value.push(id)
}

// --- Format fonksiyonları ---
function formatPrice(p?: number, cur?: string) {
  if (!p) return '—'
  return `${p.toLocaleString('tr-TR')} ${cur || ''}`
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR')
}

// --- CRUD ve modal işlemleri ---
const showCreateModal = ref(false)
const showStockModal = ref(false)
let editingItem: HalatItem | null = null

function openAddModal() { editingItem = null; showCreateModal.value = true }
function viewItemDetails(item: HalatItem) { editingItem = item; showStockModal.value = true }
function editItem(item: HalatItem) { editingItem = item; showCreateModal.value = true }
function deleteItem(item: HalatItem) { if (confirm(`${item.name} silinsin mi?`)) store.deleteHalat(item._id) }
function duplicateItem(item: HalatItem) { /* aynısını ekle */ }
function closeModals() { showCreateModal.value = false; showStockModal.value = false }
async function handleSave(data: HalatItem) {
  if (!editingItem) await store.createHalat(data)
  else await store.updateHalat(editingItem._id, data)
  closeModals()
  fetchData()
}
async function handleStockUpdate(op: any) {
  if (!editingItem) return
  await store.updateStock(editingItem._id, op)
  closeModals()
  fetchData()
}

// --- Veri yükleme ---
async function fetchData() {
  await store.fetchHalats({
    page: currentPage.value,
    limit: itemsPerPage.value,
    search: searchText.value,
    status: filters.status || undefined,
    type: filters.type || undefined
  })
}

// --- Lifecycle ---
onMounted(fetchData)
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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