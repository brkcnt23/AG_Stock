<template>
  <BaseModal 
    :title="`📋 ${project.name} - Proje Detayları`"
    size="extra-large"
    @close="$emit('close')"
  >
    <div class="project-details">
      <h4>Proje Bilgileri</h4>
      <p>Müşteri: {{ project.customer }}</p>
      <p>Durum: {{ project.status }}</p>
      <p>Toplam Malzeme: {{ project.materials?.length || 0 }}</p>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'

defineProps<{
  project: any
}>()

defineEmits<{
  close: []
  reserve: [project: any]
  start: [project: any]
  complete: [project: any]
  edit: [project: any]
}>()
</script>