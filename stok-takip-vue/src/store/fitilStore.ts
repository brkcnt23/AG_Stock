// stores/fitilStore.ts
import { defineStore } from 'pinia'
import { createBaseStore } from './baseStore'
import { fitilService } from '../api/fitilService'
import type { FitilItem } from '../types/common'

export const useFitilStore = defineStore('fitil', createBaseStore<FitilItem>('Fitil', fitilService))