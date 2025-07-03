// frontend/src/store/toastStore.ts - Düzeltilmiş versiyon
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification' // ✅ Doğru import
import type { PluginOptions } from 'vue-toastification'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  title?: string
  message: string
  type: ToastType
  options?: PluginOptions
}

export const useToastStore = defineStore('toast', () => {
  const toast = useToast() // ✅ Doğru kullanım

  // Toast göster
  const showToast = (notification: ToastMessage) => {
    const { title, message, type, options = {} } = notification
    
    // Title varsa başlık + mesaj formatı
    const content = title ? `${title}: ${message}` : message
    
    // Default options
    const defaultOptions: PluginOptions = {
      timeout: type === 'error' ? 6000 : 4000,
      ...options
    }

    switch (type) {
      case 'success':
        toast.success(content, defaultOptions)
        break
      case 'error':
        toast.error(content, defaultOptions)
        break
      case 'warning':
        toast.warning(content, defaultOptions)
        break
      case 'info':
        toast.info(content, defaultOptions)
        break
    }
  }

  // Hızlı metodlar
  const success = (message: string, title?: string, options?: PluginOptions) => {
    showToast({ message, title, type: 'success', options })
  }

  const error = (message: string, title?: string, options?: PluginOptions) => {
    showToast({ message, title, type: 'error', options })
  }

  const warning = (message: string, title?: string, options?: PluginOptions) => {
    showToast({ message, title, type: 'warning', options })
  }

  const info = (message: string, title?: string, options?: PluginOptions) => {
    showToast({ message, title, type: 'info', options })
  }

  // Socket mesajları için özel format
  const socketMessage = (data: any) => {
    if (data.bolum === 'Project') {
      switch (data.islem) {
        case 'ekle':
          success(`Yeni proje oluşturuldu`, data.detay?.name)
          break
        case 'güncelle':
          info(`Proje güncellendi`, data.detay?.name)
          break
        case 'rezerve':
          warning(`Proje rezerve edildi`, data.detay?.name)
          break
        case 'tamamla':
          success(`Proje tamamlandı`, data.detay?.name)
          break
      }
    } else if (data.material) {
      info(`Stok güncellendi`, data.material)
    }
  }

  // Tüm toast'ları temizle
  const clear = () => {
    toast.clear()
  }

  return {
    showToast,
    success,
    error,
    warning,
    info,
    socketMessage,
    clear
  }
})