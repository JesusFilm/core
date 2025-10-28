import type { StoreType } from 'polotno/model/store'

import defaultDesign from './polotno-default-state.json'

export type PolotnoDesignData = typeof defaultDesign

export const POLOTNO_STORAGE_KEY = 'studio-polotno-design'
export const POLOTNO_STORAGE_META_KEY = 'studio-polotno-design-meta'

const cloneDesign = <T>(design: T): T => JSON.parse(JSON.stringify(design))

export const getDefaultPolotnoDesign = (): PolotnoDesignData =>
  cloneDesign(defaultDesign)

export const parsePolotnoDesign = (
  storedValue: string | null
): PolotnoDesignData | null => {
  if (!storedValue) return null

  try {
    return JSON.parse(storedValue) as PolotnoDesignData
  } catch (error) {
    console.warn('Invalid stored Polotno design encountered:', error)
    return null
  }
}

export const loadPolotnoDesign = async (
  store: StoreType,
  design?: PolotnoDesignData | null
): Promise<void> => {
  const targetDesign = design ?? getDefaultPolotnoDesign()

  await store.loadJSON(cloneDesign(targetDesign))

  if (store.pages.length === 0) {
    store.addPage()
  }
}
