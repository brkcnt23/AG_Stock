<!-- components/BaseModal.vue -->
<template>
  <div class="modal-overlay" @mousedown="handleOverlayMouseDown" @click="handleOverlayClick">
    <div class="modal-content" @click.stop @mousedown.stop :class="sizeClass">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="modal-body">
        <slot></slot>
      </div>
      
      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  size?: 'small' | 'medium' | 'large' | 'extra-large'
}>(), {
  size: 'medium'
})

const emit = defineEmits<{
  close: []
}>()

const sizeClass = computed(() => {
  return `modal-${props.size}`
})

// Track where the mouse was pressed down
const mouseDownInsideModal = ref(false)

const handleOverlayMouseDown = (event: MouseEvent) => {
  // Check if mouse down happened on the modal content
  const target = event.target as HTMLElement
  const modalContent = target.closest('.modal-content')
  mouseDownInsideModal.value = !!modalContent
}

const handleOverlayClick = (event: MouseEvent) => {
  // Only close if:
  // 1. Click happened directly on overlay (not modal content)
  // 2. AND mouse was initially pressed down outside modal
  if (event.target === event.currentTarget && !mouseDownInsideModal.value) {
    emit('close')
  }
  
  // Reset tracking
  mouseDownInsideModal.value = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease-out;
  /* Prevent text selection issues */
  user-select: auto;
}

.modal-small { max-width: 400px; }
.modal-medium { max-width: 600px; }
.modal-large { max-width: 800px; }
.modal-extra-large { max-width: 1200px; }

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
  /* Prevent accidental selection */
  user-select: none;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  /* Allow text selection in modal body */
  user-select: text;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@keyframes modalAppear {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .modal-small,
  .modal-medium,
  .modal-large,
  .modal-extra-large {
    max-width: none;
  }
}
</style>