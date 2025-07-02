<!-- frontend/src/components/EditProjectModal.vue -->
<template>
  <BaseModal 
    title="✏️ Proje Düzenle"
    size="extra-large"
    @close="$emit('close')"
  >
    <div class="edit-project-form">
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
          <div class="form-group">
            <label>Durum</label>
            <select v-model="projectForm.status">
              <option value="planning">Planlama</option>
              <option value="reserved">Rezerve</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
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
            <label>Proje Açıklaması</label>
            <textarea 
              v-model="projectForm.description" 
              rows="3"
              placeholder="Proje detayları ve özel gereksinimler..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 2. MALZEMELER -->
      <div class="form-section">
        <div class="section-header">
          <h4>📦 Proje Malzemeleri</h4>
          <button @click="openMaterialSearch" class="btn btn-primary">
            ➕ Malzeme Ekle
          </button>
        </div>

        <!-- Malzeme Listesi -->
        <div v-if="selectedMaterials.length" class="materials-list">
          <div class="materials-header">
            <h5>Seçili Malzemeler ({{ selectedMaterials.length }})</h5>
            <span class="total-cost">Toplam: {{ formatCurrency(totalMaterialCost) }}</span>
          </div>

          <div class="materials-table">
            <table>
              <thead>
                <tr>
                  <th>Malzeme</th>
                  <th>Tür</th>
                  <th>Miktar</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                  <th>Stok</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(material, index) in selectedMaterials" 
                    :key="material.id" 
                    :class="getRowClass(material)">
                  <td>
                    <div class="material-name">
                      <strong>{{ material.name }}</strong>
                      <small v-if="material.kalite">{{ material.kalite }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="material-type">{{ getMaterialTypeLabel(material.type) }}</span>
                  </td>
                  <td>
                    <input 
                      v-model.number="material.requestedQuantity" 
                      @input="updateMaterialCost(material)"
                      type="number" 
                      min="1" 
                      class="quantity-input"
                    > {{ material.unit }}
                  </td>
                  <td>{{ formatCurrency(material.unitPrice || 0) }}</td>
                  <td>{{ formatCurrency(material.totalPrice || 0) }}</td>
                  <td>
                    <span v-if="material.stockAvailable" class="stock-available">
                      ✅ {{ material.availableStock }} {{ material.unit }}
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
        </div>

        <div v-else class="empty-materials">
          <div class="empty-icon">📦</div>
          <p>Bu projede henüz malzeme yok</p>
          <button @click="openMaterialSearch" class="btn btn-primary">
            İlk Malzemeyi Ekle
          </button>
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
          💾 Değişiklikleri Kaydet
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
import { ref, computed, reactive, onMounted } from 'vue'
import BaseModal from './BaseModal.vue'
import MaterialSearchModal from './MaterialSearchModal.vue'
import type { Project } from '../types/projects'

const props = defineProps<{
  project: Project
}>()

const emit = defineEmits<{
  close: []
  save: [project: any]
}>()

// State
const showMaterialSearch = ref(false)
const selectedMaterials = ref<any[]>([])

// Form Data - props'tan doldur
const projectForm = reactive({
  name: props.project.name || '',
  projectCode: props.project.projectCode || '',
  customer: props.project.customer || '',
  description: props.project.description || '',
  startDate: props.project.startDate || '',
  endDate: props.project.endDate || '',
  budget: props.project.budget || 0,
  status: props.project.status || 'planning',
  priority: props.project.priority || 'medium',
  currency: props.project.currency || 'TL',
  projectManager: props.project.projectManager || '',
  notes: props.project.notes || ''
})

// Computed
const isFormValid = computed(() => {
  return projectForm.name.trim() !== ''
})

const totalMaterialCost = computed(() => {
  return selectedMaterials.value.reduce((sum, material) => sum + (material.totalPrice || 0), 0)
})

// Methods
const openMaterialSearch = () => {
  showMaterialSearch.value = true
}

const closeMaterialSearch = () => {
  showMaterialSearch.value = false
}

const onMaterialSelect = (material: any) => {
  const exists = selectedMaterials.value.find(m => m.id === material.id)
  if (exists) {
    alert('Bu malzeme zaten eklendi!')
    return
  }

  selectedMaterials.value.push(material)
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
  if ((material.availableStock || 0) < material.requestedQuantity) return 'row-insufficient'
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

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('tr-TR') + ' ₺'
}

const saveProject = () => {
  const projectData = {
    ...projectForm,
    materials: selectedMaterials.value,
    totalMaterialCost: totalMaterialCost.value,
    totalItems: selectedMaterials.value.length,
    availableItems: selectedMaterials.value.filter(m => m.stockAvailable).length,
    missingItems: selectedMaterials.value.filter(m => !m.stockAvailable).length
  }
  
  emit('save', projectData)
}

// Initialize materials from project
onMounted(() => {
  if (props.project.materials) {
    selectedMaterials.value = [...props.project.materials]
  }
})
</script>

<style scoped>
/* CreateProjectModal ile aynı CSS'i kullan */
.edit-project-form {
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
  margin-bottom: 15px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>