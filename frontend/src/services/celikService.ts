// frontend/src/services/celikService.ts
import axios from 'axios';
import type { CelikItem } from '../types/celik';  // celikTypes yerine celik'ten import et
import type { ApiResponse } from '../types/api';

const API_URL = '/api/celik';

export const celikService = {
  getAll(params?: any) {
    return axios.get<ApiResponse<CelikItem[]>>(API_URL, { params }).then(res => res.data);
  },

  getById(id: string) {
    return axios.get<ApiResponse<CelikItem>>(`${API_URL}/${id}`).then(res => res.data);
  },

  create(data: Partial<CelikItem>) {
    return axios.post<ApiResponse<CelikItem>>(API_URL, data).then(res => res.data);
  },

  update(id: string, data: Partial<CelikItem>) {
    return axios.put<ApiResponse<CelikItem>>(`${API_URL}/${id}`, data).then(res => res.data);
  },

  delete(id: string) {
    return axios.delete<ApiResponse<null>>(`${API_URL}/${id}`).then(res => res.data);
  }
};
