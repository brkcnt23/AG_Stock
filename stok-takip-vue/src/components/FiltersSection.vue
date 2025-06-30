<!-- components/FiltersSection.vue -->
<template>
  <div class="filters-section">
    <div class="filter-header">
      <h3>🔍 Filtreler</h3>
      <button @click="$emit('clear-filters')" class="btn-link">Temizle</button>
    </div>
    
    <div class="filter-grid">
      <div class="filter-group">
        <label>{{ malzemeTuruLabel || 'Malzeme Türü' }}</label>
        <select 
          :value="filters.malzemeTuru" 
          @change="updateFilter('malzemeTuru', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tümü</option>
          <option v-for="option in malzemeTuruOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>{{ malzemeCinsiLabel || 'Malzeme Cinsi' }}</label>
        <select 
          :value="filters.malzemeCinsi" 
          @change="updateFilter('malzemeCinsi', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tümü</option>
          <option v-for="option in malzemeCinsiOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Stok Durumu</label>
        <select 
          :value="filters.stockStatus" 
          @change="updateFilter('stockStatus', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tümü</option>
          <option value="sufficient">Yeterli (>%20)</option>
          <option value="low">Düşük (%10-20)</option>
          <option value="critical">Kritik (<%10)</option>
          <option value="empty">Tükendi</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Proje</label>
        <select 
          :value="filters.proje" 
          @change="updateFilter('proje', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tüm Projeler</option>
          <option value="Stok">Stok</option>
          <option value="Hastane Projesi">Hastane Projesi</option>
          <option value="Fabrika Hattı">Fabrika Hattı</option>
          <option value="Ofis Binası">Ofis Binası</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Raf/Lokasyon</label>
        <select 
          :value="filters.rafNo" 
          @change="updateFilter('rafNo', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tüm Raflar</option>
          <option value="F1">F1 - Ana Depo</option>
          <option value="F2">F2 - Profil Deposu</option>
          <option value="F3">F3 - Plaka Deposu</option>
          <option value="DIŞARI">Dışarı Depo</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Arama</label>
        <input 
          :value="searchText"
          @input="$emit('search-change', ($event.target as HTMLInputElement).value)"
          type="text" 
          :placeholder="searchPlaceholder || 'Kalite, boyut, proje ara...'"
          class="search-input"
        >
      </div>
    </div>

    <!-- Hızlı Filtre Butonları -->
    <div class="quick-filters">
      <button @click="$emit('show-stock-only')" class="btn btn-info">
        📦 Sadece Stok Malzemeleri
      </button>
      <button @click="$emit('show-project-assigned')" class="btn btn-secondary">
        📋 Projeye Atanmış
      </button>
      <button @click="$emit('clear-filters')" class="btn btn-outline">
        🔄 Tümünü Göster
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  filters: Record<string, any>
  searchText: string
  malzemeTuruOptions?: FilterOption[]
  malzemeCinsiOptions?: FilterOption[]
  malzemeTuruLabel?: string
  malzemeCinsiLabel?: string
  searchPlaceholder?: string
}>(), {
  malzemeTuruOptions: () => [
    { value: 'paslanmaz', label: 'Paslanmaz Çelik' },
    { value: 'aluminyum', label: 'Alüminyum' },
    { value: 'çelik', label: 'Çelik' },
    { value: 'diğer', label: 'Diğer' }
  ],
  malzemeCinsiOptions: () => [
    { value: 'PLAKA', label: 'Plaka' },
    { value: 'PROFİL', label: 'Profil' },
    { value: 'BORU', label: 'Boru' },
    { value: 'HALAT', label: 'Halat' },
    { value: 'FİTİL', label: 'Fitil' },
    { value: 'MEMBRAN', label: 'Membran' },
    { value: 'DİĞER', label: 'Diğer' }
  ],
  malzemeTuruLabel: 'Malzeme Türü',
  malzemeCinsiLabel: 'Malzeme Cinsi',
  searchPlaceholder: 'Kalite, boyut, proje ara...'
})

const emit = defineEmits<{
  'filter-change': [filters: Record<string, any>]
  'search-change': [search: string]
  'clear-filters': []
  'show-stock-only': []
  'show-project-assigned': []
}>()

const updateFilter = (key: string, value: string) => {
  const newFilters = { ...props.filters, [key]: value }
  emit('filter-change', newFilters)
}
</script>

<style scoped>
.filters-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filter-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.3rem;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
  padding: 4px 8px;
  font-size: 14px;
}

.btn-link:hover {
  color: #2563eb;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
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
.search-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.filter-group select:focus,
.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quick-filters {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.btn-info { background: #06b6d4; color: white; }
.btn-secondary { background: #6b7280; color: white; }
.btn-outline { 
  background: transparent; 
  border: 1px solid #d1d5db; 
  color: #374151; 
}

.btn:hover { 
  transform: translateY(-1px); 
}

.btn-outline:hover {
  background: #f9fafb;
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-filters {
    justify-content: center;
  }
}
</style>