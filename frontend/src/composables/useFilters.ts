// frontend/src/composables/useFilter.ts
import { ref, reactive, computed, watch } from 'vue'

interface FilterConfig {
  [key: string]: {
    type: 'text' | 'select' | 'range' | 'boolean' | 'date'
    options?: any[]
    defaultValue?: any
    required?: boolean
    validator?: (value: any) => boolean
  }
}

interface UseFilterOptions {
  debounceMs?: number
  syncToUrl?: boolean
  storageKey?: string
}

export function useFilter<T extends Record<string, any>>(
  config: FilterConfig,
  options: UseFilterOptions = {}
) {
  const {
    debounceMs = 300,
    syncToUrl = false,
    storageKey
  } = options

  // Initialize filters with default values
  const initializeFilters = (): T => {
    const filters = {} as any
    Object.keys(config).forEach(key => {
      const field = config[key]
      filters[key] = field.defaultValue ?? getDefaultValue(field.type)
    })
    return filters as T
  }

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'text': return ''
      case 'select': return ''
      case 'range': return { min: '', max: '' }
      case 'boolean': return false
      case 'date': return null
      default: return null
    }
  }

  // Load saved filters from localStorage if available
  const loadSavedFilters = (): T => {
    if (!storageKey) return initializeFilters()
    
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsedFilters = JSON.parse(saved)
        return { ...initializeFilters(), ...parsedFilters }
      }
    } catch (error) {
      console.warn('Filter localStorage okuma hatası:', error)
    }
    
    return initializeFilters()
  }

  // State
  const filters = reactive<T>(loadSavedFilters())
  const searchText = ref('')
  const isFiltering = ref(false)
  
  // Computed
  const hasActiveFilters = computed(() => {
    const initialFilters = initializeFilters()
    return Object.keys(filters).some(key => {
      const current = filters[key]
      const initial = initialFilters[key]
      
      if (typeof current === 'object' && current !== null) {
        return JSON.stringify(current) !== JSON.stringify(initial)
      }
      
      return current !== initial
    }) || searchText.value.trim() !== ''
  })

  const activeFilterCount = computed(() => {
    let count = 0
    const initialFilters = initializeFilters()
    
    Object.keys(filters).forEach(key => {
      const current = filters[key]
      const initial = initialFilters[key]
      
      if (typeof current === 'object' && current !== null) {
        if (JSON.stringify(current) !== JSON.stringify(initial)) count++
      } else if (current !== initial && current !== '') {
        count++
      }
    })
    
    if (searchText.value.trim() !== '') count++
    
    return count
  })

  // Debounced search
  let searchTimer: NodeJS.Timeout | null = null
  
  const debouncedSearch = (callback: () => void) => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(callback, debounceMs)
  }

  // Filter application functions
  const applyTextFilter = (value: string, target: string): boolean => {
    if (!value.trim()) return true
    return target.toLowerCase().includes(value.toLowerCase())
  }

  const applySelectFilter = (filterValue: string, targetValue: string): boolean => {
    if (!filterValue) return true
    return targetValue === filterValue
  }

  const applyRangeFilter = (range: { min: string | number, max: string | number }, targetValue: number): boolean => {
    const min = range.min ? Number(range.min) : -Infinity
    const max = range.max ? Number(range.max) : Infinity
    return targetValue >= min && targetValue <= max
  }

  const applyBooleanFilter = (filterValue: boolean, targetValue: boolean): boolean => {
    return filterValue === targetValue
  }

  const applyDateFilter = (filterDate: string | Date, targetDate: string | Date): boolean => {
    if (!filterDate) return true
    const filterTime = new Date(filterDate).getTime()
    const targetTime = new Date(targetDate).getTime()
    return filterTime === targetTime
  }

  // Main filter function
  const filterData = (data: any[]): any[] => {
    return data.filter(item => {
      // Search text filter
      if (searchText.value.trim()) {
        const searchableText = Object.values(item)
          .filter(val => typeof val === 'string' || typeof val === 'number')
          .join(' ')
          .toLowerCase()
        
        if (!searchableText.includes(searchText.value.toLowerCase())) {
          return false
        }
      }

      // Apply configured filters
      for (const [key, filterConfig] of Object.entries(config)) {
        const filterValue = filters[key]
        const targetValue = item[key]

        if (filterValue === undefined || filterValue === null) continue

        switch (filterConfig.type) {
          case 'text':
            if (!applyTextFilter(filterValue as string, String(targetValue || ''))) {
              return false
            }
            break

          case 'select':
            if (!applySelectFilter(filterValue as string, String(targetValue || ''))) {
              return false
            }
            break

          case 'range':
            if (typeof targetValue === 'number' && 
                !applyRangeFilter(filterValue as any, targetValue)) {
              return false
            }
            break

          case 'boolean':
            if (typeof targetValue === 'boolean' && 
                !applyBooleanFilter(filterValue as boolean, targetValue)) {
              return false
            }
            break

          case 'date':
            if (targetValue && !applyDateFilter(filterValue as any, targetValue)) {
              return false
            }
            break
        }
      }

      return true
    })
  }

  // Methods
  const setFilter = (key: keyof T, value: any) => {
    if (config[key as string]?.validator && !config[key as string].validator!(value)) {
      console.warn(`Filter validation failed for ${key as string}:`, value)
      return
    }
    
    ;(filters as any)[key] = value
    saveFilters()
  }

  const clearFilter = (key: keyof T) => {
    const field = config[key as string]
    ;(filters as any)[key] = field?.defaultValue ?? getDefaultValue(field?.type || 'text')
    saveFilters()
  }

  const clearAllFilters = () => {
    Object.assign(filters, initializeFilters())
    searchText.value = ''
    saveFilters()
  }

  const saveFilters = () => {
    if (!storageKey) return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters))
    } catch (error) {
      console.warn('Filter localStorage yazma hatası:', error)
    }
  }

  const getFilterParams = () => {
    const params: Record<string, any> = {}
    
    Object.keys(filters).forEach(key => {
      const value = filters[key]
      if (value !== null && value !== undefined && value !== '') {
        params[key] = value
      }
    })
    
    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
    }
    
    return params
  }

  // Watch for changes to save filters
  if (storageKey) {
    watch(filters, saveFilters, { deep: true })
  }

  return {
    // State
    filters,
    searchText,
    isFiltering,
    
    // Computed
    hasActiveFilters,
    activeFilterCount,
    
    // Methods
    filterData,
    setFilter,
    clearFilter,
    clearAllFilters,
    getFilterParams,
    debouncedSearch,
    
    // Filter helpers
    applyTextFilter,
    applySelectFilter,
    applyRangeFilter,
    applyBooleanFilter,
    applyDateFilter
  }
}