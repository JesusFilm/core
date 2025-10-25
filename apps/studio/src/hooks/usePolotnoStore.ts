import { unstable_setAnimationsEnabled } from 'polotno/config'
import { createStore } from 'polotno/model/store'
import type { StoreType } from 'polotno/model/store'
import { useEffect, useMemo } from 'react'

import {
  POLOTNO_STORAGE_KEY,
  POLOTNO_STORAGE_META_KEY,
  loadPolotnoDesign,
  parsePolotnoDesign
} from '../config/polotno-default-state'

export const usePolotnoStore = (): StoreType => {
  const store = useMemo(() => {
    unstable_setAnimationsEnabled(true)

    return createStore({
      key: 'nFA5H9elEytDyPyvKL7T',
      showCredit: true
    })
  }, [])

  useEffect(() => {
    const loadDesign = async () => {
      const storedDesign =
        typeof window === 'undefined'
          ? null
          : window.localStorage.getItem(POLOTNO_STORAGE_KEY)

      try {
        await loadPolotnoDesign(store, parsePolotnoDesign(storedDesign))
      } catch (error) {
        console.error('Failed to load design for Polotno editor:', error)
        await loadPolotnoDesign(store)
      } finally {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(POLOTNO_STORAGE_KEY)
          window.localStorage.removeItem(POLOTNO_STORAGE_META_KEY)
        }
      }
    }

    void loadDesign()
  }, [store])

  return store
}
