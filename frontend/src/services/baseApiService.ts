// frontend/src/services/baseApiService.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/common';

export class BaseApiService<T> {
  protected api: AxiosInstance;
  protected basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: örneğin auth token eklemek için
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: 401’de login’e yönlendir
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Listeleme: query parametreleri ile sayfalama/filtre desteği
  async getAll(params?: Record<string, any>): Promise<T[]> {
  const response = await this.api.get<ApiResponse<T[]>>(this.basePath, { params });
  return response.data.data;         // <-- sadece içteki data dizisini dönüyoruz
}

  // Tekil kayıt çekme
  async getById(id: string): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(`${this.basePath}/${id}`);
    return response.data;
  }

  // Yeni kayıt oluşturma
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(this.basePath, data);
    return response.data;
  }

  // Var olan kaydı güncelleme
  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  // Kayıt silme
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`${this.basePath}/${id}`);
    return response.data;
  }
}
