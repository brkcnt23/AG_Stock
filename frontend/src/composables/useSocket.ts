// frontend/src/composables/useSocket.ts - TypeScript versiyonu

import { ref, onMounted, onUnmounted, Ref } from 'vue'
import io, { Socket } from 'socket.io-client'

interface Notification {
  id: number
  type: 'project' | 'stock' | 'general'
  message: string
  timestamp: Date
}

interface LogData {
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
}

export function useSocket() {
  const socket: Ref<typeof Socket | null> = ref(null)
  const connected = ref(false)
  const notifications: Ref<Notification[]> = ref([])

  const connect = (): void => {
    socket.value = io('http://localhost:5000')
    
    socket.value.on('connect', () => {
      connected.value = true
      console.log('✅ Socket.io bağlandı')
    })

    socket.value.on('disconnect', () => {
      connected.value = false
      console.log('❌ Socket.io bağlantısı kesildi')
    })

    // Proje güncellemelerini dinle
    socket.value.on('log', (data: LogData) => {
      console.log('📡 Socket event alındı:', data)
      
      if (data.bolum === 'Project') {
        notifications.value.unshift({
          id: Date.now(),
          type: 'project',
          message: `Yeni proje: ${data.detay.name || 'Bilinmeyen'}`,
          timestamp: new Date()
        })
      }
    })

    // Stok güncellemelerini dinle
    socket.value.on('stock-update', (data: StockUpdateData) => {
      console.log('📦 Stok güncellendi:', data)
      notifications.value.unshift({
        id: Date.now(),
        type: 'stock',
        message: `${data.material} stoku güncellendi`,
        timestamp: new Date()
      })
    })
  }

  const disconnect = (): void => {
    if (socket.value) {
      socket.value.disconnect()
    }
  }

  const clearNotifications = (): void => {
    notifications.value = []
  }

  const removeNotification = (id: number): void => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
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
    notifications,
    connect,
    disconnect,
    clearNotifications,
    removeNotification
  }
}