// stores/membranStore.ts
import { defineStore } from 'pinia'
import { createBaseStore } from './baseStore'
import { membranService } from '../api/membranService'
import type { MembranItem } from '../types/common'

export const useMembranStore = defineStore('membran', createBaseStore<MembranItem>('Membran', membranService))