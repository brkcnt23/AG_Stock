// frontend/src/composables/useSocketToast.ts

import { ref, onMounted, onUnmounted } from 'vue'
import { Socket } from 'socket.io-client'
import io from 'socket.io-client'
import { useToastStore } from '../store/toastStore'

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

export function useSocketToast() {
  const socket = ref<typeof Socket | null>(null)
  const connected = ref(false)
  const toastStore = useToastStore()

  const connect = (): void => {
    if (socket.value?.connected) return

    socket.value = io('http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    })
    
    socket.value.on('connect', () => {
      connected.value = true
      console.log('✅ Socket.io bağlandı')
      toastStore.success('Canlı güncellemeler aktif', '🔗 Bağlantı')
    })

    socket.value.on('disconnect', (reason: string) => {
      connected.value = false
      console.log('❌ Socket.io bağlantısı kesildi:', reason)
      
      if (reason === 'io server disconnect') {
        toastStore.warning('Sunucu bağlantısı kesildi', '⚠️ Bağlantı')
      }
    })

    socket.value.on('reconnect', (attemptNumber: any) => {
      console.log('🔄 Socket.io yeniden bağlandı:', attemptNumber)
      toastStore.info('Bağlantı yeniden kuruldu', '🔄 Yeniden Bağlanma')
    })

    socket.value.on('reconnect_error', (error: any) => {
      console.error('❌ Yeniden bağlanma hatası:', error)
    })

    // Proje güncellemelerini dinle
    socket.value.on('log', (data: SocketLogData) => {
      console.log('📡 Socket log event:', data)
      
      if (data.bolum === 'Project') {
        switch (data.islem) {
          case 'ekle':
            toastStore.success(`"${data.detay.name}" projesi oluşturuldu`, '🏗️ Yeni Proje')
            break
          case 'güncelle':
            toastStore.info(`"${data.detay.name}" projesi güncellendi`, '📝 Proje Güncellendi')
            break
          case 'rezerve':
            toastStore.warning(`"${data.detay.name}" projesi rezerve edildi`, '🔒 Rezervasyon')
            break
          case 'başlat':
            toastStore.info(`"${data.detay.name}" projesi başlatıldı`, '▶️ Proje Başladı')
            break
          case 'tamamla':
            toastStore.success(`"${data.detay.name}" projesi tamamlandı`, '✅ Proje Tamamlandı')
            break
          case 'sil':
            toastStore.error(`"${data.detay.name}" projesi silindi`, '🗑️ Proje Silindi')
            break
        }
      }
    })

    // Stok güncellemelerini dinle
    socket.value.on('stock-update', (data: StockUpdateData) => {
      console.log('📦 Stok güncellendi:', data)
      
      const typeLabels = {
        'sarf': 'Sarf',
        'celik': 'Çelik',
        'membran': 'Membran',
        'halat': 'Halat',
        'fitil': 'Fitil'
      }
      
      const typeLabel = typeLabels[data.type as keyof typeof typeLabels] || data.type
      
      toastStore.info(
        `${data.material} stoku güncellendi (${data.newStock})`,
        `📦 ${typeLabel} Stok`
      )
    })

    // Genel bildirimler
    socket.value.on('notification', (data: any) => {
      console.log('🔔 Genel bildirim:', data)
      
      switch (data.type) {
        case 'success':
          toastStore.success(data.message, data.title)
          break
        case 'error':
          toastStore.error(data.message, data.title)
          break
        case 'warning':
          toastStore.warning(data.message, data.title)
          break
        case 'info':
        default:
          toastStore.info(data.message, data.title)
          break
      }
    })
  }

  const disconnect = (): void => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  // Diğer kullanıcılara bildirim gönder
  const sendNotification = (notification: any): void => {
    if (socket.value?.connected) {
      socket.value.emit('send-notification', notification)
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    connected,
    connect,
    disconnect,
    sendNotification
  }
}