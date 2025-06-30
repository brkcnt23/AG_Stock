// stores/halatStore.ts
import { defineStore } from 'pinia'
import { createBaseStore } from './baseStore'
import { halatService } from '../api/halatService'
import type { HalatItem } from '../types/common'

export const useHalatStore = defineStore('halat', createBaseStore<HalatItem>('Halat', halatService))