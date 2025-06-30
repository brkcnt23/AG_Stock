// frontend/src/main.ts - Clean entry point without MongoDB
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/style.css'

// Extend Window interface for __PINIA__ property
declare global {
  interface Window {
    __PINIA__?: unknown
  }
}

// Create Vue app
const app = createApp(App)

// Create Pinia store
const pinia = createPinia()

// Use plugins
app.use(pinia)
app.use(router)

// Global error handler
app.config.errorHandler = (err, _vm, info) => {
  console.error('Global error:', err, info)
  
  // Send to error tracking service in production
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(err)
  }
}

// Global warning handler
app.config.warnHandler = (msg, _vm, trace) => {
  console.warn('Global warning:', msg, trace)
}

// Mount app
app.mount('#app')

// Development helpers
if (import.meta.env.DEV) {
  // Make store available in console for debugging
  window.__PINIA__ = pinia
  
  console.log('🚀 Stok Takip Frontend başlatıldı')
  console.log('🔧 Development mode aktif')
  console.log('📡 API Base URL:', import.meta.env.VITE_API_URL || '/api')
}