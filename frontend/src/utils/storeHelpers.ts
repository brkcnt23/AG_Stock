import { BaseItem } from "@/types/common"
import { safeAccess } from "./typeHelpers"

export const convertToStoreItem = <T extends BaseItem>(
  apiItem: any, 
  malzemeTuru: string
): T => {
  return {
    ...apiItem,
    malzemeTuru,
    // Safe property access
    id: apiItem._id || apiItem.id || '',
    kalite: safeAccess(apiItem, 'kalite', ''),
    cins: safeAccess(apiItem, 'cins', ''),
    malzeme: safeAccess(apiItem, 'malzeme', ''),
    // ... diğer safe conversions
  } as T
}

export const convertFromStoreItem = <T>(storeItem: any): Partial<T> => {
  const { malzemeTuru, ...apiItem } = storeItem
  return apiItem
}