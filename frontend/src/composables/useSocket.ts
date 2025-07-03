// frontend/src/composables/useSocket.ts - GLOBAL SINGLETON SOCKET
import { ref, Ref } from 'vue'
import { Socket } from 'socket.io-client'
import io from 'socket.io-client'
import { useToastStore } from '../store/toastStore'

interface Notification {
  id: number
  type: 'project' | 'stock' | 'general'
  message: string
  timestamp: Date
}

interface SocketLogData {
  bolum: string
  islem: string
  detay: {
    name?: string
    [key: string]: any
  }
}

interface StockUpdateData {
  material: string
  type: string
  newStock: number
  materialId?: string
}

// ✅ GLOBAL STATE - Tek instance
let globalSocket: typeof Socket | null = null
const globalConnected = ref(false)
const globalNotifications: Ref<Notification[]> = ref([])
let isInitialized = false

export function useSocket() {
  // Her component'te aynı ref'leri döndür
  const connected = globalConnected
  const notifications = globalNotifications

  const initializeSocket = (): void => {
    if (isInitialized || globalSocket?.connected) {
      console.log('🔄 Socket zaten başlatılmış, yeniden başlatılmıyor')
      return
    }

    console.log('🔌 Socket.io global bağlantısı başlatılıyor...')
    isInitialized = true

    globalSocket = io('http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    })

    // Toast store'u lazily initialize et
    let toastStore: any = null
    const getToastStore = () => {
      if (!toastStore) {
        toastStore = useToastStore()
      }
      return toastStore
    }
    
    globalSocket.on('connect', () => {
      globalConnected.value = true
      console.log('✅ Socket.io global bağlantısı kuruldu')
      getToastStore().success('Canlı güncellemeler aktif', '🔗 Bağlantı')
    })

    globalSocket.on('disconnect', (reason: string) => {
      globalConnected.value = false
      console.log('❌ Socket.io bağlantısı kesildi:', reason)
      
      if (reason === 'io server disconnect') {
        getToastStore().warning('Sunucu bağlantısı kesildi', '⚠️ Bağlantı')
      }
    })

    globalSocket.on('reconnect', (attemptNumber: number) => {
      console.log('🔄 Socket.io yeniden bağlandı:', attemptNumber)
      getToastStore().info('Bağlantı yeniden kuruldu', '🔄 Yeniden Bağlanma')
    })

    globalSocket.on('reconnect_error', (error: any) => {
      console.error('❌ Yeniden bağlanma hatası:', error)
    })

    // Proje güncellemelerini dinle
    globalSocket.on('log', (data: SocketLogData) => {
      console.log('📡 Socket log event:', data)
      
      // Notification array'e ekle
      if (data.bolum === 'Project') {
        globalNotifications.value.unshift({
          id: Date.now(),
          type: 'project',
          message: `${data.islem}: ${data.detay.name || 'Bilinmeyen'}`,
          timestamp: new Date()
        })

        // Toast bildirimi göster
        switch (data.islem) {
          case 'ekle':
            getToastStore().success(`"${data.detay.name}" projesi oluşturuldu`, '🏗️ Yeni Proje')
            break
          case 'güncelle':
            getToastStore().info(`"${data.detay.name}" projesi güncellendi`, '📝 Proje Güncellendi')
            break
          case 'rezerve':
            getToastStore().warning(`"${data.detay.name}" projesi rezerve edildi`, '🔒 Rezervasyon')
            break
          case 'başlat':
            getToastStore().info(`"${data.detay.name}" projesi başlatıldı`, '▶️ Proje Başladı')
            break
          case 'tamamla':
            getToastStore().success(`"${data.detay.name}" projesi tamamlandı`, '✅ Proje Tamamlandı')
            break
          case 'sil':
            getToastStore().error(`"${data.detay.name}" projesi silindi`, '🗑️ Proje Silindi')
            break
        }
      }
    })

    // Stok güncellemelerini dinle
    globalSocket.on('stock-update', (data: StockUpdateData) => {
      console.log('📦 Stok güncellendi:', data)
      
      // Notification array'e ekle
      globalNotifications.value.unshift({
        id: Date.now(),
        type: 'stock',
        message: `${data.material} stoku güncellendi (${data.newStock})`,
        timestamp: new Date()
      })

      // Toast bildirimi göster
      const typeLabels = {
        'sarf': 'Sarf',
        'celik': 'Çelik',
        'membran': 'Membran',
        'halat': 'Halat',
        'fitil': 'Fitil'
      }
      
      const typeLabel = typeLabels[data.type as keyof typeof typeLabels] || data.type
      
      getToastStore().info(
        `${data.material} stoku güncellendi (${data.newStock})`,
        `📦 ${typeLabel} Stok`
      )
    })

    // Genel bildirimler
    globalSocket.on('notification', (data: any) => {
      console.log('🔔 Genel bildirim:', data)
      
      // Notification array'e ekle
      globalNotifications.value.unshift({
        id: Date.now(),
        type: 'general',
        message: data.message,
        timestamp: new Date()
      })

      // Toast bildirimi göster
      switch (data.type) {
        case 'success':
          getToastStore().success(data.message, data.title)
          break
        case 'error':
          getToastStore().error(data.message, data.title)
          break
        case 'warning':
          getToastStore().warning(data.message, data.title)
          break
        case 'info':
        default:
          getToastStore().info(data.message, data.title)
          break
      }
    })

    // Test eventi - backend'den welcome mesajı
    globalSocket.on('welcome', (data: any) => {
      console.log('👋 Hoş geldin mesajı:', data)
    })
  }

  const connect = (): void => {
    initializeSocket()
  }

  const disconnect = (): void => {
    if (globalSocket) {
      console.log('🔌 Socket.io bağlantısı kapatılıyor...')
      globalSocket.disconnect()
      globalSocket = null
      globalConnected.value = false
      isInitialized = false
    }
  }

  const clearNotifications = (): void => {
    globalNotifications.value = []
  }

  const removeNotification = (id: number): void => {
    const index = globalNotifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      globalNotifications.value.splice(index, 1)
    }
  }

  // Diğer kullanıcılara bildirim gönder
  const sendNotification = (notification: any): void => {
    if (globalSocket?.connected) {
      globalSocket.emit('send-notification', notification)
    }
  }

  // Emit wrapper
  const emit = (event: string, data: any): void => {
    if (globalSocket?.connected) {
      globalSocket.emit(event, data)
    } else {
      console.warn('Socket bağlantısı yok, emit edilemiyor:', event)
    }
  }

  // ✅ HER COMPONENT için aynı instance'ı döndür
  return {
    socket: globalSocket,
    connected,
    notifications,
    connect,
    disconnect,
    clearNotifications,
    removeNotification,
    sendNotification,
    emit,
    initializeSocket // Manual initialization için
  }
}