export const localStorage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch {
      return defaultValue || null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('LocalStorage write failed:', error)
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.warn('LocalStorage remove failed:', error)
    }
  },

  clear(): void {
    try {
      window.localStorage.clear()
    } catch (error) {
      console.warn('LocalStorage clear failed:', error)
    }
  }
}

export const sessionStorage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch {
      return defaultValue || null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('SessionStorage write failed:', error)
    }
  },

  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key)
    } catch (error) {
      console.warn('SessionStorage remove failed:', error)
    }
  },

  clear(): void {
    try {
      window.sessionStorage.clear()
    } catch (error) {
      console.warn('SessionStorage clear failed:', error)
    }
  }
}