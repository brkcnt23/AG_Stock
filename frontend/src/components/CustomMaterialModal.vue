<!-- components/CustomMaterialModal.vue - TAMAMEN DÜZELTİLMİŞ -->
<template>
  <BaseModal 
    title="➕ Özel Malzeme Ekle"
    size="large"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="custom-material-form">
      <!-- Temel Bilgiler -->
      <div class="form-section">
        <h4>📋 Temel Bilgiler</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Malzeme Adı *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="Özel malzeme adı"
            >
          </div>
          
          <div class="form-group">
            <label>Malzeme Türü *</label>
            <select v-model="form.type" required>
              <option value="">Seçiniz</option>
              <option value="sarf">Sarf Malzeme</option>
              <option value="celik">Çelik</option>
              <option value="membran">Membran</option>
              <option value="halat">Halat</option>
              <option value="fitil">Fitil</option>
              <option value="custom">Diğer</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Kalite/Standart</label>
            <input 
              v-model="form.kalite" 
              type="text" 
              placeholder="316L, S235, vb."
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Cins/Kategori</label>
            <input 
              v-model="form.cins" 
              type="text" 
              placeholder="Plaka, Boru, vb."
            >
          </div>
          
          <div class="form-group">
            <label>Birim *</label>
            <select v-model="form.unit" required>
              <option value="ADET">Adet</option>
              <option value="KG">Kilogram</option>
              <option value="METRE">Metre</option>
              <option value="M2">Metrekare</option>
              <option value="TOP">Top</option>
              <option value="PAKET">Paket</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Miktar *</label>
            <input 
              v-model="form.quantity" 
              type="number" 
              min="1" 
              required 
              placeholder="Gerekli miktar"
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group full-width">
            <label>Açıklama</label>
            <textarea 
              v-model="form.description" 
              rows="3"
              placeholder="Malzeme hakkında detaylı açıklama..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Teknik Özellikler -->
      <div class="form-section">
        <h4>📏 Teknik Özellikler</h4>
        <div class="form-row">
          <div class="form-group">
            <label>En (mm)</label>
            <input 
              v-model="form.specifications.en" 
              type="number" 
              step="0.1"
              placeholder="1500"
            >
          </div>
          
          <div class="form-group">
            <label>Boy (mm)</label>
            <input 
              v-model="form.specifications.boy" 
              type="number" 
              step="0.1"
              placeholder="3000"
            >
          </div>
          
          <div class="form-group">
            <label>Kalınlık (mm)</label>
            <input 
              v-model="form.specifications.kalinlik" 
              type="number" 
              step="0.1"
              placeholder="6"
            >
          </div>
          
          <div class="form-group">
            <label>Uzunluk (mm)</label>
            <input 
              v-model="form.specifications.uzunluk" 
              type="number" 
              step="0.1"
              placeholder="6000"
            >
          </div>
        </div>

        <!-- Renk ve Diğer Özellikler -->
        <div class="form-row" v-if="form.type === 'membran' || form.type === 'fitil'">
          <div class="form-group">
            <label>Renk</label>
            <select v-model="form.specifications.renk">
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
          
          <div class="form-group" v-if="form.type === 'membran'">
            <label>Marka</label>
            <input 
              v-model="form.specifications.marka" 
              type="text" 
              placeholder="Ferrari, Mehler, vb."
            >
          </div>
          
          <div class="form-group" v-if="form.type === 'membran'">
            <label>Model</label>
            <input 
              v-model="form.specifications.model" 
              type="text" 
              placeholder="Model adı"
            >
          </div>
        </div>

        <!-- Çelik Özel Alanları -->
        <div class="form-row" v-if="form.type === 'celik'">
          <div class="form-group">
            <label>Boru Çapı</label>
            <input 
              v-model="form.specifications.boruCap" 
              type="text" 
              placeholder="Ø90, Ø100..."
            >
          </div>
          
          <div class="form-group">
            <label>Et Kalınlığı</label>
            <input 
              v-model="form.specifications.etKalinlik" 
              type="text" 
              placeholder="4mm, 6mm..."
            >
          </div>
          
          <div class="form-group">
            <label>Çelik Tipi</label>
            <select v-model="form.specifications.tip">
              <option value="">Seçiniz</option>
              <option value="siyah">Siyah Çelik</option>
              <option value="paslanmaz">Paslanmaz Çelik</option>
              <option value="aluminyum">Alüminyum</option>
            </select>
          </div>
        </div>

        <!-- Halat Özel Alanları -->
        <div class="form-row" v-if="form.type === 'halat'">
          <div class="form-group">
            <label>Halat Çapı</label>
            <input 
              v-model="form.specifications.halatCapi" 
              type="text" 
              placeholder="8mm, 10mm..."
            >
          </div>
          
          <div class="form-group">
            <label>İzole Durumu</label>
            <select v-model="form.specifications.izoleDurumu">
              <option value="">Seçiniz</option>
              <option value="Var">Var</option>
              <option value="Yok">Yok</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Uç Tipi</label>
            <input 
              v-model="form.specifications.ucTipi" 
              type="text" 
              placeholder="Kanca, Halka, vb."
            >
          </div>
        </div>
      </div>

      <!-- Fiyat ve Tedarik -->
      <div class="form-section">
        <h4>💰 Fiyat ve Tedarik</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Birim Fiyat</label>
            <input 
              v-model="form.unitPrice" 
              type="number" 
              step="0.01"
              placeholder="Birim fiyat"
            >
          </div>
          
          <div class="form-group">
            <label>Para Birimi</label>
            <select v-model="form.currency">
              <option value="TL">Türk Lirası (₺)</option>
              <option value="USD">Amerikan Doları ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Tedarikçi</label>
            <input 
              v-model="form.supplier" 
              type="text" 
              placeholder="Tedarikçi firma"
            >
          </div>
          
          <div class="form-group">
            <label>Öncelik</label>
            <select v-model="form.priority">
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Toplam Fiyat</label>
            <input 
              :value="totalPrice"
              type="text" 
              readonly
              class="readonly-input"
            >
          </div>
          
          <div class="form-group">
            <label>Tahmini Teslimat</label>
            <input 
              v-model="form.estimatedDelivery" 
              type="date"
            >
          </div>
          
          <div class="form-group full-width">
            <label>Sipariş Notları</label>
            <textarea 
              v-model="form.notes" 
              rows="2"
              placeholder="Sipariş ile ilgili özel notlar..."
            ></textarea>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="modal-actions">
        <button @click="$emit('close')" class="btn btn-secondary">
          İptal
        </button>
        <button @click="handleSubmit" class="btn btn-primary" :disabled="!isFormValid">
          ➕ Malzemeyi Ekle
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import BaseModal from './BaseModal.vue'

const emit = defineEmits<{
  close: []
  save: [material: any]
}>()

// Form data
const form = reactive({
  name: '',
  type: '',
  kalite: '',
  cins: '',
  unit: 'ADET',
  quantity: 1,
  description: '',
  specifications: {
    en: '',
    boy: '',
    kalinlik: '',
    uzunluk: '',
    renk: '',
    marka: '',
    model: '',
    boruCap: '',
    etKalinlik: '',
    tip: '',
    halatCapi: '',
    izoleDurumu: '',
    ucTipi: ''
  },
  unitPrice: 0,
  currency: 'TL',
  supplier: '',
  priority: 'medium',
  estimatedDelivery: '',
  notes: ''
})

// Computed
const isFormValid = computed(() => {
  return form.name.trim() !== '' && 
         form.type !== '' && 
         form.unit !== '' &&
         form.quantity > 0
})

const totalPrice = computed(() => {
  const total = (form.unitPrice || 0) * form.quantity
  return total.toLocaleString('tr-TR') + ' ' + getCurrencySymbol(form.currency)
})

// Methods
const getCurrencySymbol = (currency: string) => {
  const symbols = { TL: '₺', USD: '$', EUR: '€' }
  return symbols[currency as keyof typeof symbols] || '₺'
}

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  const materialData = {
    ...form,
    totalPrice: (form.unitPrice || 0) * form.quantity,
    materialType: form.type,
    stockAvailable: false, // Özel malzemeler stokta yok
    availableStock: 0,
    id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
  
  console.log('✅ Özel malzeme oluşturuldu:', materialData)
  emit('save', materialData)
}
</script>

<style scoped>
.custom-material-form {
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

.readonly-input {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary { 
  background: #3b82f6; 
  color: white; 
}

.btn-secondary { 
  background: #6b7280; 
  color: white; 
}

.btn:hover:not(:disabled) { 
  transform: translateY(-1px); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>