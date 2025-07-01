import axios from 'axios'
import type { HalatItem, CreateHalatData, UpdateHalatData } from '../types/halat'

const API_URL = '/api/halat'

export const halatService = {
  async getHalats(params?: any) {
    try {
      const timestamp = new Date().getTime();
      const res = await axios.get(`${API_URL}?timestamp=${timestamp}`, { params })
      // Ensure consistent structure
      return {
        success: true,
        data: res.data.data ?? res.data,
        pagination: res.data.pagination ?? null,
        message: res.data.message ?? '',
        ...res.data
      }
    } catch (error) {
      console.error('Halat verileri alınamadı:', error)
      throw error
    }
  },

  async getHalat(id: string) {
    const res = await axios.get(`${API_URL}/${id}`)
    return {
      success: true,
      data: res.data.data ?? res.data,
      message: res.data.message ?? '',
      ...res.data
    }
  },

  async createHalat(data: Partial<CreateHalatData>) {
    const res = await axios.post(API_URL, data)
    return {
      success: true,
      data: res.data.data ?? res.data,
      message: res.data.message ?? '',
      ...res.data
    }
  },

  async updateHalat(id: string, data: Partial<UpdateHalatData>) {
    const res = await axios.put(`${API_URL}/${id}`, data)
    return {
      success: true,
      data: res.data.data ?? res.data,
      message: res.data.message ?? '',
      ...res.data
    }
  },

  async deleteHalat(id: string) {
    const res = await axios.delete(`${API_URL}/${id}`)
    return {
      success: true,
      data: res.data.data ?? res.data,
      message: res.data.message ?? '',
      ...res.data
    }
  }
}
