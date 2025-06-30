<!-- frontend/src/components/StockUpdateModal.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Stok Güncelle</h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p class="current-stock">
            Mevcut Stok: <strong>{{ item.stok }} {{ item.birim }}</strong>
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="stock-form">
          <div class="form-group">
            <label>İşlem Türü</label>
            <div class="operation-buttons">
              <button 
                type="button"
                :class="['operation-btn', { active: operation === 'set' }]"
                @click="operation = 'set'"
              >
                📝 Belirle
              </button>
              <button 
                type="button"
                :class="['operation-btn', { active: operation === 'add' }]"
                @click="operation = 'add'"
              >
                ➕ Ekle
              </button>
              <button 
                type="button"
                :class="['operation-btn', { active: operation === 'subtract' }]"
                @click="operation = 'subtract'"
              >
                ➖ Çıkar
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>{{ getOperationLabel() }}</label>
            <input 
              v-model.number="stockAmount" 
              type="number" 
              min="0"
              :max="operation === 'subtract' ? item.stok : undefined"
              required 
              :placeholder="getPlaceholder()"
            />
            <small class="form-help">{{ getHelpText() }}</small>
          </div>

          <div class="form-group">
            <label>Açıklama (İsteğe bağlı)</label>
            <textarea 
              v-model="reason" 
              rows="3"
              placeholder="Stok değişikliği nedeni..."
            ></textarea>
          </div>

          <div class="preview-section">
            <h4>Önizleme</h4>
            <div class="stock-preview">
              <div class="current">
                <span>Mevcut:</span>
                <span>{{ item.stok }} {{ item.birim }}</span>
              </div>
              <div class="operation">
                <span>{{ getOperationSymbol() }}</span>
                <span>{{ stockAmount || 0 }} {{ item.birim }}</span>
              </div>
              <div class="result">
                <span>Yeni Stok:</span>
                <span :class="getResultClass()">
                  {{ getNewStock() }} {{ item.birim }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="$emit('close')" class="btn btn-secondary">
              İptal
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="!stockAmount || stockAmount <= 0"
            >
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HalatStockOperation } from '../types/halat'

interface Props {
  item: {
    _id: string
    name: string
    stok: number
    birim: string
  }
  itemType: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [data: HalatStockOperation]
}>()

// Form state
const operation = ref<'set' | 'add' | 'subtract'>('set')
const stockAmount = ref<number>(0)
const reason = ref('')

// Computed
const getNewStock = () => {
  const current = props.item.stok
  const amount = stockAmount.value || 0

  switch (operation.value) {
    case 'set':
      return amount
    case 'add':
      return current + amount
    case 'subtract':
      return Math.max(0, current - amount)
    default:
      return current
  }
}

const getResultClass = () => {
  const newStock = getNewStock()
  const current = props.item.stok

  if (newStock > current) return 'positive'
  if (newStock < current) return 'negative'
  return 'neutral'
}

// Methods
const getOperationLabel = () => {
  switch (operation.value) {
    case 'set': return 'Yeni Stok Miktarı'
    case 'add': return 'Eklenecek Miktar'
    case 'subtract': return 'Çıkarılacak Miktar'
    default: return 'Miktar'
  }
}

const getPlaceholder = () => {
  switch (operation.value) {
    case 'set': return 'Örn: 100'
    case 'add': return 'Örn: 50'
    case 'subtract': return 'Örn: 20'
    default: return '0'
  }
}

const getHelpText = () => {
  switch (operation.value) {
    case 'set': return 'Stoğu bu değere ayarla'
    case 'add': return 'Mevcut stoka ekle'
    case 'subtract': return 'Mevcut stoktan çıkar'
    default: return ''
  }
}

const getOperationSymbol = () => {
  switch (operation.value) {
    case 'set': return '='
    case 'add': return '+'
    case 'subtract': return '-'
    default: return ''
  }
}

const handleSubmit = () => {
  if (!stockAmount.value || stockAmount.value <= 0) return

  const stockData: HalatStockOperation = {
    stok: stockAmount.value,
    operation: operation.value,
    reason: reason.value || undefined
  }

  emit('save', stockData)
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
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

.modal-body {
  padding: 24px;
}

.item-info {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.item-info h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
}

.current-stock {
  margin: 0;
  color: #6b7280;
}

.stock-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.operation-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.operation-btn {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
}

.operation-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.operation-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-help {
  color: #6b7280;
  font-size: 12px;
  font-style: italic;
}

.preview-section {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 16px;
}

.stock-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stock-preview > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
}

.current {
  color: #6b7280;
}

.operation {
  color: #374151;
  font-weight: 500;
}

.result {
  font-weight: 600;
  border: 2px solid #e5e7eb;
}

.result.positive {
  border-color: #10b981;
  background: #ecfdf5;
  color: #059669;
}

.result.negative {
  border-color: #ef4444;
  background: #fef2f2;
  color: #dc2626;
}

.result.neutral {
  border-color: #6b7280;
  background: #f9fafb;
  color: #374151;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .operation-buttons {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>