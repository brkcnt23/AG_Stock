// stores/sarfStore.ts - DEĞİŞTİRİN
import { defineStore } from 'pinia'
import { createBaseStore } from './baseStore'
import { sarfService } from '../api/sarfService'
import type { SarfItem } from '../types/common'

export const useSarfStore = defineStore('sarf', createBaseStore<SarfItem>('Sarf', sarfService))