// frontend/src/types/api.ts
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: PaginationInfo
  filters?: Record<string, any>
}

export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiError {
  success: false
  message: string
  errors?: string[]
  statusCode?: number
}

export interface ApiRequestConfig {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface StockMovement {
  id: string
  stockId: string
  stockType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil'
  type: 'in' | 'out' | 'adjustment' | 'transfer'
  quantity: number
  unit: string
  date: string
  description?: string
  projectId?: string
  projectName?: string
  userId?: string
  userName?: string
  reference?: string
}

export interface UserInfo {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  permissions: string[]
}

export interface AuditLog {
  id: string
  action: string
  collection: string
  documentId: string
  oldData?: any
  newData?: any
  userId?: string
  userName?: string
  timestamp: string
  ip?: string
  userAgent?: string
}

export interface SystemStats {
  totalItems: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  recentMovements: number
  activeProjects: number
  lastUpdate: string
}

export interface HealthCheck {
  status: 'OK' | 'ERROR'
  message: string
  timestamp: string
  mongodb: 'connected' | 'disconnected'
  uptime: number
  memory: {
    used: number
    total: number
  }
}

// Export default constants
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Materials
  SARF: '/sarf',
  CELIK: '/celik',
  MEMBRAN: '/membran',
  HALAT: '/halat',
  FITIL: '/fitil',
  
  // Projects
  PROJECTS: '/projects',
  
  // Stats
  STATS: '/stats',
  
  // Movements
  MOVEMENTS: '/movements',
  
  // Users
  USERS: '/users',
  AUTH: '/auth',
  
  // Logs
  LOGS: '/logs'
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const