import { useCallback, useMemo } from 'react'
import useSWR from 'swr'

import type { LanguageMapPoint } from './types'

class LanguageMapNetworkError extends Error {
  constructor(message = 'NetworkError when attempting to fetch resource.') {
    super(message)
    this.name = 'LanguageMapNetworkError'
  }
}

const fetcher = async (url: string): Promise<LanguageMapPoint[]> => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to load language map')
    return await response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new LanguageMapNetworkError()
    }
    throw error instanceof Error
      ? error
      : new Error('Failed to load language map')
  }
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

export function useLanguageMap(): {
  points: LanguageMapPoint[]
  isLoading: boolean
  error?: Error
  retry: () => void
} {
  const { data, error, isLoading, mutate } = useSWR<LanguageMapPoint[]>(
    '/api/language-map',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: DAY_IN_MS
    }
  )

  const points = useMemo(() => data ?? [], [data])
  const retry = useCallback(() => {
    void mutate()
  }, [mutate])

  return { points, isLoading, error: error ?? undefined, retry }
}
