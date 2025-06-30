<!-- components/MaterialForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="material-form">
    <!-- Temel Bilgiler -->
    <div class="form-section">
      <h4>📋 Temel Bilgiler</h4>
      <div class="form-row">
        <div class="form-group">
          <label>Kalite/Standart *</label>
          <input 
            v-model="form.kalite" 
            type="text" 
            required 
            placeholder="316L, 304, EN-AW 6063..."
          >
        </div>
        
        <div class="form-group">
          <label>Malzeme Cinsi *</label>
          <select v-model="form.malzemeCinsi" required>
            <option value="">Seçiniz</option>
            <option v-for="option in malzemeCinsiOptions" 
                    :key="option.value" 
                    :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Malzeme Adı</label>
          <input 
            v-model="form.malzeme" 
            type="text" 
            placeholder="Detaylı malzeme açıklaması"
          >
        </div>
      </div>
    </div>

    <!-- Boyut Bilgileri -->
    <div class="form-section">
      <h4>📏 Boyut Bilgileri</h4>
      <div class="form-row">
        <div class="form-group">
          <label>En (mm)</label>
          <input v-model="form.en" type="number" step="0.1" placeholder="1500">
        </div>
        <div class="form-group">
          <label>Boy (mm)</label>
          <input v-model="form.boy" type="number" step="0.1" placeholder="3000">
        </div>
        <div class="form-group">
          <label>Kalınlık (mm)</label>
          <input v-model="form.kalinlik" type="number" step="0.1" placeholder="6">
        </div>
        <div class="form-group">
          <label>Uzunluk (mm)</label>
          <input v-model="form.uzunluk" type="number" step="0.1" placeholder="6000">
        </div>
      </div>
    </div>

    <!-- Stok Bilgileri -->
    <div class="form-section">
      <h4>📦 Stok Bilgileri</h4>
      <div class="form-row">
        <div class="form-group">
          <label>Giriş Miktarı *</label>
          <input 
            v-model="form.girisMiktar" 
            type="number" 
            step="0.1" 
            required 
            placeholder="Adet/Kg/Metre"
          >
        </div>
        <div class="form-group">
          <label>Çıkış Miktarı</label>
          <input 
            v-model="form.cikisMiktar" 
            type="number" 
            step="0.1" 
            placeholder="Kullanılan miktar"
          >
        </div>
        <div class="form-group">
          <label>Kalan Miktar</label>
          <input 
            v-model="calculatedRemainingAmount" 
            type="number" 
            readonly 
            placeholder="Otomatik hesaplanır"
          >
        </div>
        <div class="form-group">
          <label>Birim</label>
          <select v-model="form.birim">
            <option value="ADET">Adet</option>
            <option value="KG">Kilogram</option>
            <option value="METRE">Metre</option>
            <option value="M2">Metrekare</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Fiyat Bilgileri -->
    <div class="form-section">
      <h4>💰 Fiyat Bilgileri</h4>
      <div class="form-row">
        <div class="form-group">
          <label>Satın Alma Fiyatı</label>
          <input 
            v-model="form.satinAlisFiyati" 
            type="number" 
            step="0.01" 
            placeholder="Birim fiyat"
          >
        </div>
        <div class="form-group">
          <label>Para Birimi</label>
          <select v-model="form.paraBirimi" @change="updateExchangeRate">
            <option value="TL">Türk Lirası (₺)</option>
            <option value="USD">Amerikan Doları ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
        <div class="form-group" v-if="form.paraBirimi !== 'TL'">
          <label>Döviz Kuru (₺)</label>
          <input 
            v-model="form.dovizKur" 
            type="number" 
            step="0.01" 
            placeholder="1 USD = ? TL"
          >
        </div>
        <div class="form-group">
          <label>Tedarikçi</label>
          <input 
            v-model="form.tedarikci" 
            type="text" 
            placeholder="Tedarikçi firma adı"
          >
        </div>
      </div>
    </div>

    <!-- Lokasyon ve Proje -->
    <div class="form-section">
      <h4>📍 Lokasyon ve Proje</h4>
      <div class="form-row">
        <div class="form-group">
          <label>Proje/Yön</label>
          <input 
            v-model="form.proje" 
            type="text" 
            placeholder="Hangi proje için alındı"
          >
        </div>
        <div class="form-group">
          <label>Raf No *</label>
          <select v-model="form.rafNo" required>
            <option value="">Seçiniz</option>
            <option value="F1">F1 - Ana Depo</option>
            <option value="F2">F2 - Profil Deposu</option>
            <option value="F3">F3 - Plaka Deposu</option>
            <option value="DIŞARI">Dışarı Depo</option>
          </select>
        </div>
        <div class="form-group">
          <label>İM Dosya No</label>
          <input 
            v-model="form.imDosyaNo" 
            type="text" 
            placeholder="İmalat dosya numarası"
          >
        </div>
        <div class="form-group">
          <label>İzleme No</label>
          <input 
            v-model="form.izlNo" 
            type="text" 
            placeholder="İzleme numarası"
          >
        </div>
      </div>
    </div>

    <!-- Tarih Bilgileri -->
    <div class="form-section">
      <h4>📅 Tarih Bilgileri</h4>
      <div class="form-row">
        <div class="form-group">
          <label>Giriş Tarihi</label>
          <input v-model="form.girisTarihi" type="date">
        </div>
        <div class="form-group">
          <label>Satın Alma Tarihi</label>
          <input v-model="form.satinAlisTarihi" type="date">
        </div>
      </div>
    </div>

    <!-- Malzeme Türüne Özel Alanlar -->
    <div v-if="$slots.specificFields" class="form-section">
      <h4>🔩 Özel Alanlar</h4>
      <slot name="specificFields"></slot>
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        İptal
      </button>
      <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
        {{ mode === 'add' ? '💾 Kaydet' : '✏️ Güncelle' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'

interface Props {
  mode: 'add' | 'edit'
  item?: any | null
  malzemeCinsiOptions?: Array<{ value: string; label: string }>
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
  malzemeCinsiOptions: () => [
    { value: 'PLAKA', label: 'Plaka' },
    { value: 'PROFİL', label: 'Profil' },
    { value: 'BORU', label: 'Boru' },
    { value: 'HALAT', label: 'Halat' },
    { value: 'FİTİL', label: 'Fitil' },
    { value: 'MEMBRAN', label: 'Membran' },
    { value: 'DİĞER', label: 'Diğer' }
  ]
})

const emit = defineEmits<{
  save: [data: any]
  cancel: []
}>()

// Form data
const form = reactive({
  _id: undefined as string | undefined,
  kalite: '',
  malzeme: '',
  malzemeCinsi: '',
  en: '',
  boy: '',
  kalinlik: '',
  uzunluk: '',
  girisMiktar: '',
  cikisMiktar: '',
  kalanMiktar: '',
  birim: 'ADET',
  satinAlisFiyati: 0,
  paraBirimi: 'TL',
  dovizKur: 1,
  tedarikci: '',
  proje: '',
  rafNo: '',
  imDosyaNo: '',
  izlNo: '',
  girisTarihi: new Date().toISOString().split('T')[0],
  satinAlisTarihi: '',
  malzemeTuru: 'paslanmaz' as string
})

// Computed
const calculatedRemainingAmount = computed(() => {
  const giris = parseFloat(form.girisMiktar || '0')
  const cikis = parseFloat(form.cikisMiktar || '0')
  return (giris - cikis).toString()
})

const isFormValid = computed(() => {
  return form.kalite.trim() !== '' && 
         form.malzemeCinsi !== '' && 
         form.rafNo !== '' &&
         parseFloat(form.girisMiktar) > 0
})

// Watchers
watch([() => form.girisMiktar, () => form.cikisMiktar], () => {
  form.kalanMiktar = calculatedRemainingAmount.value
})

// Methods
const updateExchangeRate = () => {
  if (form.paraBirimi === 'TL') {
    form.dovizKur = 1
  } else if (form.paraBirimi === 'USD') {
    form.dovizKur = 32.5 // Default USD rate
  } else if (form.paraBirimi === 'EUR') {
    form.dovizKur = 35.0 // Default EUR rate
  }
}

const determineMaterialType = () => {
  if (form.kalite.includes('316') || form.kalite.includes('304')) {
    form.malzemeTuru = 'paslanmaz'
  } else if (form.kalite.includes('EN-AW') || form.kalite.includes('6063')) {
    form.malzemeTuru = 'aluminyum'
  } else if (form.kalite.includes('S235') || form.kalite.includes('ST')) {
    form.malzemeTuru = 'çelik'
  } else {
    form.malzemeTuru = 'diğer'
  }
}

const handleSubmit = () => {
  // Auto-determine material type
  determineMaterialType()
  
  // Set remaining amount
  form.kalanMiktar = calculatedRemainingAmount.value

  const itemData = { ...form }
  
  if (props.mode === 'edit' && props.item) {
    itemData._id = props.item._id || props.item.id
  }

  emit('save', itemData)
}

// Initialize form if editing
onMounted(() => {
  if (props.mode === 'edit' && props.item) {
    Object.assign(form, props.item)
  }
})
</script>

<style scoped>
.material-form {
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

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input[readonly] {
  background: #f9fafb;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
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