// frontend/src/main.ts - Clean entry point without MongoDB
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'
import { PluginOptions } from 'vue-toastification/dist/types/src/types'

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
const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
  maxToasts: 5,
  newestOnTop: true,
  transition: "Vue-Toastification__bounce",
  toastClassName: "custom-toast",
  bodyClassName: ["custom-toast-body"],
  containerClassName: ["custom-toast-container"]
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