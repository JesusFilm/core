import { useMemo } from 'react'
import useSWR from 'swr'

import type { LanguageMapPoint } from './types'

const fetcher = async (url: string): Promise<LanguageMapPoint[]> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to load language map')
  return await response.json()
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

export function useLanguageMap(): {
  points: LanguageMapPoint[]
  isLoading: boolean
  error?: Error
} {
  const { data, error, isLoading } = useSWR<LanguageMapPoint[]>(
    '/api/language-map',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: DAY_IN_MS
    }
  )

  const points = useMemo(() => data ?? [], [data])

  return { points, isLoading, error: error ?? undefined }
}
