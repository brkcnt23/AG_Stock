const API_BASE_URL = 'http://localhost:5000/api'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  total?: number
  page?: number
  limit?: number
}

export class BaseApiService {
  protected baseUrl: string
  protected endpoint: string

  constructor(endpoint: string) {
    this.baseUrl = API_BASE_URL
    this.endpoint = endpoint
  }

  // Test connection
  async testConnection(): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      const data = await response.json()
      
      if (response.ok) {
        return {
          success: true,
          data: { status: 'connected' },
          message: 'Bağlantı başarılı'
        }
      } else {
        return {
          success: false,
          data: { status: 'disconnected' },
          message: 'Bağlantı başarısız'
        }
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      return {
        success: false,
        data: { status: 'error' },
        message: 'Sunucuya bağlanılamıyor'
      }
    }
  }

  // Get all items - Backend response format'ına uygun
  async getItems(params: any = {}): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const url = `${this.baseUrl}/${this.endpoint}${queryParams ? '?' + queryParams : ''}`
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        
        // Backend'den gelen data zaten array olarak geliyor
        return {
          success: true,
          data: Array.isArray(data) ? data : [],
          total: Array.isArray(data) ? data.length : 0,
          message: 'Veriler başarıyla alındı'
        }
      } else {
        console.error(`API Error [${response.status}]:`, await response.text())
        return {
          success: false,
          data: [],
          message: 'Veriler getirilemedi'
        }
      }
    } catch (error) {
      console.error(`${this.endpoint} getItems error:`, error)
      return {
        success: false,
        data: [],
        message: 'Sunucu bağlantısı hatası'
      }
    }
  }

  // Get single item
  async getItem(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          data: data
        }
      } else {
        return {
          success: false,
          data: null,
          message: 'Veri getirilemedi'
        }
      }
    } catch (error) {
      console.error(`${this.endpoint} getItem error:`, error)
      return {
        success: false,
        data: null,
        message: 'Veri getirilemedi'
      }
    }
  }

  // Create item
  async createItem(itemData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          data: data,
          message: 'Başarıyla eklendi'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          data: null,
          message: errorData.message || 'Eklenirken hata oluştu'
        }
      }
    } catch (error) {
      console.error(`${this.endpoint} createItem error:`, error)
      return {
        success: false,
        data: null,
        message: 'Eklenirken hata oluştu'
      }
    }
  }

  // Update item
  async updateItem(id: string, itemData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          data: data,
          message: 'Başarıyla güncellendi'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          data: null,
          message: errorData.message || 'Güncellenirken hata oluştu'
        }
      }
    } catch (error) {
      console.error(`${this.endpoint} updateItem error:`, error)
      return {
        success: false,
        data: null,
        message: 'Güncellenirken hata oluştu'
      }
    }
  }

  // Delete item
  async deleteItem(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        return {
          success: true,
          data: true,
          message: 'Başarıyla silindi'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          data: false,
          message: errorData.message || 'Silinirken hata oluştu'
        }
      }
    } catch (error) {
      console.error(`${this.endpoint} deleteItem error:`, error)
      return {
        success: false,
        data: false,
        message: 'Silinirken hata oluştu'
      }
    }
  }

  // Get statistics
  async getStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}/statistics`)
      
      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          data: data
        }
      } else {
        // Eğer statistics endpoint yoksa default değerler döndür
        return {
          success: true,
          data: {
            totalItems: 0,
            totalValue: 0,
            lowStock: 0,
            recentlyAdded: 0
          },
          message: 'İstatistikler hesaplanamadı'
        }
      }
    } catch (error) {
      console.error(`${this.endpoint} getStatistics error:`, error)
      return {
        success: true,
        data: {
          totalItems: 0,
          totalValue: 0,
          lowStock: 0,
          recentlyAdded: 0
        },
        message: 'İstatistikler hesaplanamadı'
      }
    }
  }
}