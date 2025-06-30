// stores/celikStore.ts
import { defineStore } from 'pinia'
import { createBaseStore } from './baseStore'
import { celikService } from '../api/celikService'
import type { CelikItem } from '../types/common'

export const useCelikStore = defineStore('celik', createBaseStore<CelikItem>('Celik', celikService))