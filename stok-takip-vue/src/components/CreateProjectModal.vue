<!-- components/CreateProjectModal.vue - TAMAMLANMIŞ HALİ -->
<template>
  <BaseModal 
    title="🏗️ Yeni Proje Oluştur"
    size="extra-large"
    @close="$emit('close')"
  >
    <div class="create-project-form">
      <!-- 1. PROJE BİLGİLERİ -->
      <div class="form-section">
        <h4>📋 Proje Bilgileri</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Proje Adı *</label>
            <input 
              v-model="projectForm.name" 
              type="text" 
              required 
              placeholder="Hastane Projesi A"
            >
          </div>
          <div class="form-group">
            <label>Proje Kodu</label>
            <input 
              v-model="projectForm.projectCode" 
              type="text" 
              placeholder="PRJ-2024-001"
            >
          </div>
          <div class="form-group">
            <label>Müşteri</label>
            <input 
              v-model="projectForm.customer" 
              type="text" 
              placeholder="ABC Hastanesi"
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Başlangıç Tarihi</label>
            <input v-model="projectForm.startDate" type="date">
          </div>
          <div class="form-group">
            <label>Bitiş Tarihi</label>
            <input v-model="projectForm.endDate" type="date">
          </div>
          <div class="form-group">
            <label>Bütçe</label>
            <input 
              v-model="projectForm.budget" 
              type="number" 
              placeholder="1000000"
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group full-width">
            <label>Proje Açıklaması</label>
            <textarea 
              v-model="projectForm.description" 
              rows="3"
              placeholder="Proje detayları ve özel gereksinimler..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 2. MALZEME SEÇİMİ -->
      <div class="form-section">
        <div class="section-header">
          <h4>🔧 Malzeme Seçimi</h4>
          <button @click="openMaterialSearch" class="btn btn-primary">
            ➕ Malzeme Ekle
          </button>
        </div>

        <!-- Seçili Malzemeler Listesi -->
        <div v-if="selectedMaterials.length > 0" class="materials-list">
          <div class="materials-header">
            <h5>Seçili Malzemeler ({{ selectedMaterials.length }})</h5>
            <div class="materials-summary">
              <span class="total-cost">
                Toplam Maliyet: {{ formatCurrency(totalMaterialCost) }}
              </span>
            </div>
          </div>

          <div class="materials-table">
            <table>
              <thead>
                <tr>
                  <th>Malzeme</th>
                  <th>Tür</th>
                  <th>Miktar</th>
                  <th>Birim</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                  <th>Stok</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(material, index) in selectedMaterials" 
                    :key="material.id" 
                    :class="getRowClass(material)">
                  <td>
                    <div class="material-name">
                      <strong>{{ material.name }}</strong>
                      <small v-if="material.description">{{ material.description }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="material-type">{{ getMaterialTypeLabel(material.materialType) }}</span>
                  </td>
                  <td>
                    <input 
                      v-model="material.requestedQuantity" 
                      type="number" 
                      min="1" 
                      @input="updateMaterialCost(material)"
                      class="quantity-input"
                    >
                  </td>
                  <td>{{ material.unit }}</td>
                  <td>{{ formatCurrency(material.unitPrice || 0) }}</td>
                  <td>{{ formatCurrency(material.totalPrice || 0) }}</td>
                  <td>
                    <span v-if="material.stockAvailable" class="stock-available">
                      ✅ {{ material.availableStock }}
                    </span>
                    <span v-else class="stock-missing">
                      ❌ Stokta Yok
                    </span>
                  </td>
                  <td>
                    <button @click="removeMaterial(index)" class="btn btn-sm btn-danger">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Stok Analizi -->
          <div class="stock-analysis">
            <div class="analysis-item">
              <span class="label">Stokta Mevcut:</span>
              <span class="value available">{{ availableCount }}</span>
            </div>
            <div class="analysis-item">
              <span class="label">Stokta Yok:</span>
              <span class="value missing">{{ missingCount }}</span>
            </div>
            <div class="analysis-item">
              <span class="label">Stok Yeterliliği:</span>
              <span class="value" :class="getSufficiencyClass()">%{{ stockSufficiency }}</span>
            </div>
          </div>
        </div>

        <!-- Boş Durum -->
        <div v-else class="empty-materials">
          <div class="empty-icon">📦</div>
          <p>Henüz malzeme seçilmedi</p>
          <button @click="openMaterialSearch" class="btn btn-primary">
            İlk Malzemeyi Ekle
          </button>
        </div>
      </div>

      <!-- 3. PROJE AYARLARI -->
      <div class="form-section">
        <h4>⚙️ Proje Ayarları</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Öncelik</label>
            <select v-model="projectForm.priority">
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
          </div>
          <div class="form-group">
            <label>Para Birimi</label>
            <select v-model="projectForm.currency">
              <option value="TL">Türk Lirası (₺)</option>
              <option value="USD">Amerikan Doları ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Proje Yöneticisi</label>
            <input 
              v-model="projectForm.projectManager" 
              type="text" 
              placeholder="Proje yöneticisi adı"
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group full-width">
            <label>Proje Notları</label>
            <textarea 
              v-model="projectForm.notes" 
              rows="2"
              placeholder="Özel notlar ve talimatlar..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="modal-actions">
        <button @click="$emit('close')" class="btn btn-secondary">
          İptal
        </button>
        <button @click="saveProject" class="btn btn-primary" :disabled="!isFormValid">
          🏗️ Proje Oluştur
        </button>
      </div>
    </template>

    <!-- Material Search Modal -->
    <MaterialSearchModal 
      v-if="showMaterialSearch"
      @close="closeMaterialSearch"
      @select="onMaterialSelect"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useProjectMaterialStore } from '../store/projectMaterialStore'
import BaseModal from './BaseModal.vue'
import MaterialSearchModal from './MaterialSearchModal.vue'

const emit = defineEmits<{
  close: []
  save: [project: any]
}>()

// Stores
const projectMaterialStore = useProjectMaterialStore()

// State
const showMaterialSearch = ref(false)
const selectedMaterials = ref<any[]>([])

// Form Data
const projectForm = reactive({
  name: '',
  projectCode: '',
  customer: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: 0,
  priority: 'medium',
  currency: 'TL',
  projectManager: '',
  notes: ''
})

// Computed
const isFormValid = computed(() => {
  return projectForm.name.trim() !== '' && selectedMaterials.value.length > 0
})

const totalMaterialCost = computed(() => {
  return selectedMaterials.value.reduce((sum, material) => sum + (material.totalPrice || 0), 0)
})

const availableCount = computed(() => {
  return selectedMaterials.value.filter(m => m.stockAvailable).length
})

const missingCount = computed(() => {
  return selectedMaterials.value.filter(m => !m.stockAvailable).length
})

const stockSufficiency = computed(() => {
  if (selectedMaterials.value.length === 0) return 100
  return Math.round((availableCount.value / selectedMaterials.value.length) * 100)
})

// Methods
const openMaterialSearch = () => {
  showMaterialSearch.value = true
}

const closeMaterialSearch = () => {
  showMaterialSearch.value = false
}

const onMaterialSelect = (material: any) => {
  // Check if already added
  const exists = selectedMaterials.value.find(m => m.id === material.id)
  if (exists) {
    alert('Bu malzeme zaten eklendi!')
    return
  }

  // Create project material
  const projectMaterial = projectMaterialStore.createProjectMaterialFromStock(material, 1)
  selectedMaterials.value.push(projectMaterial)
  
  closeMaterialSearch()
}

const removeMaterial = (index: number) => {
  selectedMaterials.value.splice(index, 1)
}

const updateMaterialCost = (material: any) => {
  material.totalPrice = (material.unitPrice || 0) * material.requestedQuantity
}

const getRowClass = (material: any) => {
  if (!material.stockAvailable) return 'row-missing'
  if (material.availableStock < material.requestedQuantity) return 'row-insufficient'
  return 'row-available'
}

const getMaterialTypeLabel = (type: string) => {
  const labels = {
    'sarf': 'Sarf',
    'celik': 'Çelik', 
    'membran': 'Membran',
    'halat': 'Halat',
    'fitil': 'Fitil',
    'custom': 'Özel'
  }
  return labels[type as keyof typeof labels] || type
}

const getSufficiencyClass = () => {
  if (stockSufficiency.value === 100) return 'sufficient'
  if (stockSufficiency.value >= 50) return 'partial'
  return 'insufficient'
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('tr-TR') + ' ₺'
}

const saveProject = () => {
  const projectData = {
    ...projectForm,
    materials: selectedMaterials.value,
    totalMaterialCost: totalMaterialCost.value,
    stockSufficiency: stockSufficiency.value,
    totalItems: selectedMaterials.value.length,
    availableItems: availableCount.value,
    missingItems: missingCount.value,
    reservedItems: 0
  }
  
  emit('save', projectData)
}
</script>

<style scoped>
.create-project-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #f8fafc;
}

.form-section h4 {
  margin: 0 0 15px 0;
  color: #1e293b;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Materials List */
.materials-list {
  margin-top: 15px;
}

.materials-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.materials-header h5 {
  margin: 0;
  color: #1e293b;
}

.total-cost {
  font-weight: 600;
  color: #059669;
}

.materials-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.materials-table table {
  width: 100%;
  border-collapse: collapse;
}

.materials-table th {
  background: #f8fafc;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
}

.materials-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.material-name strong {
  display: block;
  color: #1e293b;
}

.material-name small {
  color: #6b7280;
  font-size: 11px;
}

.material-type {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
}

.quantity-input {
  width: 80px;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}

.stock-available {
  color: #10b981;
  font-size: 11px;
}

.stock-missing {
  color: #ef4444;
  font-size: 11px;
}

.row-available {
  background: #f0fdf4;
}

.row-insufficient {
  background: #fffbeb;
}

.row-missing {
  background: #fef2f2;
}

/* Stock Analysis */
.stock-analysis {
  display: flex;
  gap: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.analysis-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.analysis-item .label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.analysis-item .value {
  font-size: 1.2rem;
  font-weight: 700;
}

.value.available { color: #10b981; }
.value.missing { color: #ef4444; }
.value.sufficient { color: #10b981; }
.value.partial { color: #f59e0b; }
.value.insufficient { color: #ef4444; }

/* Empty State */
.empty-materials {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
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
  font-size: 14px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-secondary { background: #6b7280; color: white; }
.btn-danger { background: #ef4444; color: white; }

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
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .materials-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .stock-analysis {
    flex-direction: column;
    gap: 10px;
  }
  
  .materials-table {
    overflow-x: auto;
  }
}
</style>