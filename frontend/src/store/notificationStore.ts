// frontend/src/store/notificationStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  timestamp: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notification_${Date.now()}_${Math.random()}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 5000,
      persistent: notification.persistent ?? false
    }

    notifications.value.push(newNotification)

    // Auto remove after duration (unless persistent)
    if (!newNotification.persistent && (newNotification.duration ?? 0) > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration!)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const clearByType = (type: Notification['type']) => {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    clearByType
  }
})