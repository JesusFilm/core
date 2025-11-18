import useSWR from 'swr'

import { generateBlurhashFromUrl } from './generateBlurhash'
import { BlurhashResult } from './types'

interface UseBlurhashReturn {
  blurhash: string | null
  dominantColor: string | null
  isLoading: boolean
  error: Error | null
}

/**
 * React hook that fetches blurhash and dominant color for an image URL.
 * Uses SWR for caching, deduplication, and automatic revalidation.
 *
 * @param imageUrl - The image URL to generate blurhash for, or null/undefined
 * @returns Object containing blurhash, dominantColor, loading state, and error
 */
export function useBlurhash(imageUrl: string | null | undefined): UseBlurhashReturn {
  const { data, isLoading, error } = useSWR<BlurhashResult | null>(
    imageUrl ? `blurhash:${imageUrl}` : null,
    async () => {
      if (!imageUrl) return null
      return generateBlurhashFromUrl(imageUrl)
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes - blurhash data doesn't change often
      errorRetryCount: 2, // Retry failed requests up to 2 times
      errorRetryInterval: 1000, // Wait 1 second between retries
    }
  )

  return {
    blurhash: data?.blurhash ?? null,
    dominantColor: data?.dominantColor ?? null,
    isLoading,
    error: error as Error | null,
  }
}
