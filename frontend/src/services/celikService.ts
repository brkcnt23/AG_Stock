// frontend/src/services/celikService.ts
import { BaseApiService } from './baseApiService';
import type { CelikItem } from '@/types/common';
import type { ApiResponse, Statistics } from '@/types/common';

export class CelikService extends BaseApiService<CelikItem> {
  constructor() {
    super('/celik');
  }

  /**
   * Malzemeye özel istatistikleri getirir.
   */
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    const response = await this.api.get<ApiResponse<Statistics>>(`${this.basePath}/stats`);
    return response.data;
  }

  /**
   * Stoğa özel rezervasyon yapar.
   * @param id Stok öğesinin ID'si
   * @param quantity Rezerve edilecek miktar
   */
  async reserve(id: string, quantity: number): Promise<ApiResponse<CelikItem>> {
    const response = await this.api.post<ApiResponse<CelikItem>>(
      `${this.basePath}/${id}/reserve`,
      { quantity }
    );
    return response.data;
  }
}

export const celikService = new CelikService();
