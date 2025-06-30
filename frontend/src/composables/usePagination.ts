// frontend/src/composables/usePagination.ts
import { ref, computed, reactive } from 'vue'

interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 20,
    pageSizeOptions = [10, 20, 50, 100]
  } = options

  const state = reactive<PaginationState>({
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0
  })

  // Computed properties
  const startIndex = computed(() => 
    (state.currentPage - 1) * state.pageSize + 1
  )

  const endIndex = computed(() => 
    Math.min(state.currentPage * state.pageSize, state.totalItems)
  )

  const hasNextPage = computed(() => 
    state.currentPage < state.totalPages
  )

  const hasPrevPage = computed(() => 
    state.currentPage > 1
  )

  const isFirstPage = computed(() => 
    state.currentPage === 1
  )

  const isLastPage = computed(() => 
    state.currentPage === state.totalPages
  )

  // Visible page numbers for pagination controls
  const visiblePages = computed(() => {
    const delta = 2 // Show 2 pages before and after current page
    const range = []
    const left = Math.max(1, state.currentPage - delta)
    const right = Math.min(state.totalPages, state.currentPage + delta)

    // Always show first page
    if (left > 1) {
      range.push(1)
      if (left > 2) {
        range.push('...')
      }
    }

    // Show pages around current page
    for (let i = left; i <= right; i++) {
      range.push(i)
    }

    // Always show last page
    if (right < state.totalPages) {
      if (right < state.totalPages - 1) {
        range.push('...')
      }
      range.push(state.totalPages)
    }

    return range
  })

  // Pagination info text
  const paginationInfo = computed(() => {
    if (state.totalItems === 0) {
      return 'Kayıt bulunamadı'
    }
    return `${startIndex.value}-${endIndex.value} / ${state.totalItems} kayıt`
  })

  // Methods
  const setPage = (page: number) => {
    if (page >= 1 && page <= state.totalPages) {
      state.currentPage = page
    }
  }

  const nextPage = () => {
    if (hasNextPage.value) {
      state.currentPage++
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      state.currentPage--
    }
  }

  const firstPage = () => {
    state.currentPage = 1
  }

  const lastPage = () => {
    state.currentPage = state.totalPages
  }

  const setPageSize = (size: number) => {
    const oldStartIndex = (state.currentPage - 1) * state.pageSize
    state.pageSize = size
    
    // Recalculate current page to maintain position
    state.currentPage = Math.floor(oldStartIndex / size) + 1
    updateTotalPages()
  }

  const setTotalItems = (total: number) => {
    state.totalItems = total
    updateTotalPages()
    
    // Adjust current page if it exceeds total pages
    if (state.currentPage > state.totalPages && state.totalPages > 0) {
      state.currentPage = state.totalPages
    }
  }

  const updateTotalPages = () => {
    state.totalPages = Math.ceil(state.totalItems / state.pageSize)
  }

  const reset = () => {
    state.currentPage = initialPage
    state.pageSize = initialPageSize
    state.totalItems = 0
    state.totalPages = 0
  }

  // Get current page data from an array
  const getCurrentPageData = <T>(data: T[]): T[] => {
    const start = (state.currentPage - 1) * state.pageSize
    const end = start + state.pageSize
    return data.slice(start, end)
  }

  // Get API parameters for server-side pagination
  const getApiParams = () => ({
    page: state.currentPage,
    limit: state.pageSize,
    offset: (state.currentPage - 1) * state.pageSize
  })

  return {
    // State
    ...state,
    
    // Computed
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage,
    visiblePages,
    paginationInfo,
    pageSizeOptions,
    
    // Methods
    setPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    setTotalItems,
    reset,
    getCurrentPageData,
    getApiParams
  }
}