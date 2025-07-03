<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { useSocket } from './composables/useSocket'

// ✅ APP LEVEL'DE SOCKET'İ BİR KEZ BAŞLAT
const { initializeSocket, disconnect } = useSocket()

onMounted(() => {
  console.log('🚀 App mounted - Socket.io başlatılıyor...')
  initializeSocket()
})

onUnmounted(() => {
  console.log('🔴 App unmounted - Socket.io kapatılıyor...')
  disconnect()
})
</script>

<style>
/* Global styles - NO SCOPED */
#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Override any conflicting styles */
body {
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  place-items: unset !important;
  text-align: left !important;
  background: #f8fafc !important;
}

html {
  margin: 0 !important;
  padding: 0 !important;
}
</style>