import { useState, useEffect } from 'react'

import { getThumbnailUrl } from './getThumbnailUrl'

interface UseThumbnailUrlReturn {
  thumbnailUrl: string
  isLoading: boolean
  error: Error | null
}

/**
 * React hook that fetches the appropriate thumbnail URL by checking for local thumbnails first.
 * Falls back to the original URL if no local thumbnail exists.
 *
 * @param contentId - The content ID to check for local thumbnails, or undefined
 * @param originalUrl - The fallback URL if no local thumbnail exists, or null/undefined
 * @param options - Additional parameters for more specific thumbnail matching
 * @returns Object containing thumbnailUrl, isLoading state, and error
 */
export function useThumbnailUrl(
  contentId: string | undefined,
  originalUrl: string | null | undefined,
  options?: {
    orientation?: string
    containerSlug?: string
    variantSlug?: string
    languageId?: string
  }
): UseThumbnailUrlReturn {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    originalUrl || ''
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // If no contentId, just use the original URL
    if (!contentId) {
      setThumbnailUrl(originalUrl || '')
      setIsLoading(false)
      setError(null)
      return
    }

    // Reset state when inputs change
    setIsLoading(true)
    setError(null)

    // Fetch the thumbnail URL
    getThumbnailUrl(contentId, originalUrl, options)
      .then((url) => {
        setThumbnailUrl(url)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('useThumbnailUrl: Error fetching thumbnail URL:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setThumbnailUrl(originalUrl || '')
        setIsLoading(false)
      })
  }, [contentId, originalUrl, options?.orientation, options?.containerSlug, options?.variantSlug, options?.languageId])

  return {
    thumbnailUrl,
    isLoading,
    error
  }
}
