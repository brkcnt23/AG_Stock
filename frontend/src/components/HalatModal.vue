<!-- frontend/src/components/HalatModal.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ halat ? 'Halat Düzenle' : 'Yeni Halat Ekle' }}</h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="halat-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Halat Adı *</label>
            <input 
              v-model="formData.name" 
              type="text" 
              required 
              placeholder="Örn: Çelik Halat 8mm"
            />
          </div>

          <div class="form-group">
            <label>Kalite</label>
            <input 
              v-model="formData.kalite" 
              type="text" 
              placeholder="Örn: DIN 3055"
            />
          </div>

          <div class="form-group">
            <label>Cins *</label>
            <select v-model="formData.cins" required>
              <option value="">Seçiniz</option>
              <option value="celik">Çelik Halat</option>
              <option value="sentetik">Sentetik Halat</option>
              <option value="karma">Karma Halat</option>
            </select>
          </div>

          <div class="form-group">
            <label>Çap (mm) *</label>
            <input 
              v-model.number="formData.cap" 
              type="number" 
              step="0.1"
              min="0"
              required 
              placeholder="8"
            />
          </div>

          <div class="form-group">
            <label>Uzunluk (m)</label>
            <input 
              v-model.number="formData.uzunluk" 
              type="number" 
              min="0"
              placeholder="100"
            />
          </div>

          <div class="form-group">
            <label>Stok Miktarı *</label>
            <input 
              v-model.number="formData.stok" 
              type="number" 
              min="0"
              required 
              placeholder="50"
            />
          </div>

          <div class="form-group">
            <label>Birim *</label>
            <select v-model="formData.birim" required>
              <option value="">Seçiniz</option>
              <option value="metre">Metre</option>
              <option value="adet">Adet</option>
              <option value="kg">Kilogram</option>
            </select>
          </div>

          <div class="form-group">
            <label>Birim Fiyat</label>
            <input 
              v-model.number="formData.birimFiyat" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="25.50"
            />
          </div>

          <div class="form-group">
            <label>Para Birimi</label>
            <select v-model="formData.parabirimi">
              <option value="TL">TL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div class="form-group">
            <label>Tedarikçi</label>
            <input 
              v-model="formData.tedarikci" 
              type="text" 
              placeholder="Tedarikçi firma"
            />
          </div>

          <div class="form-group">
            <label>Min Stok Seviyesi</label>
            <input 
              v-model.number="formData.minStokSeviyesi" 
              type="number" 
              min="0"
              placeholder="10"
            />
          </div>

          <div class="form-group">
            <label>Depo</label>
            <input 
              v-model="formData.depo" 
              type="text" 
              placeholder="Ana Depo"
            />
          </div>

          <div class="form-group full-width">
            <label>Açıklama</label>
            <textarea 
              v-model="formData.aciklama" 
              rows="3"
              placeholder="Ek açıklamalar..."
            ></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            İptal
          </button>
          <button type="submit" class="btn btn-primary">
            {{ halat ? 'Güncelle' : 'Ekle' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { HalatItem, CreateHalatData, UpdateHalatData } from '../types/halat'

interface Props {
  halat: HalatItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [data: CreateHalatData | UpdateHalatData]
}>()

// Form data
const formData = ref<CreateHalatData>({
  name: '',
  kalite: '',
  cins: 'celik',
  cap: 0,
  uzunluk: 0,
  stok: 0,
  birim: 'metre',
  birimFiyat: 0,
  parabirimi: 'TL',
  tedarikci: '',
  minStokSeviyesi: 5,
  depo: '',
  aciklama: ''
})

// Watch for prop changes
watch(() => props.halat, (newHalat) => {
  if (newHalat) {
    formData.value = {
      name: newHalat.name,
      kalite: newHalat.kalite || '',
      cins: newHalat.cins,
      cap: newHalat.cap,
      uzunluk: newHalat.uzunluk || 0,
      stok: newHalat.stok,
      birim: newHalat.birim,
      birimFiyat: newHalat.birimFiyat || 0,
      parabirimi: newHalat.parabirimi || 'TL',
      tedarikci: newHalat.tedarikci || '',
      minStokSeviyesi: newHalat.minStokSeviyesi || 5,
      depo: newHalat.depo || '',
      aciklama: newHalat.aciklama || ''
    }
  } else {
    // Reset form for new halat
    formData.value = {
      name: '',
      kalite: '',
      cins: 'celik',
      cap: 0,
      uzunluk: 0,
      stok: 0,
      birim: 'metre',
      birimFiyat: 0,
      parabirimi: 'TL',
      tedarikci: '',
      minStokSeviyesi: 5,
      depo: '',
      aciklama: ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', formData.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.halat-form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
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

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>