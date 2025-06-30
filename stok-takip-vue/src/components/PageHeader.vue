<!-- components/PageHeader.vue -->
<template>
  <div class="page-header">
    <div class="header-left">
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-subtitle">{{ subtitle }}</p>
    </div>
    <div class="header-actions">
      <button @click="$emit('add-item')" class="btn btn-primary">
        ➕ Yeni {{ itemType || 'Malzeme' }} Ekle
      </button>
      <button @click="$emit('export')" class="btn btn-secondary">
        📤 {{ exportLabel || 'Dışa Aktar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  itemType?: string
  exportLabel?: string
}>(), {
  subtitle: '',
  itemType: 'Malzeme',
  exportLabel: 'Dışa Aktar',
  quoteCount: 0
})

defineEmits<{
  'add-item': []
  'export': []
}>()
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.page-title {
  font-size: 2.2rem;
  margin: 0;
  font-weight: 700;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-secondary { background: #6b7280; color: white; }
.btn-success { background: #10b981; color: white; }

.btn:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>