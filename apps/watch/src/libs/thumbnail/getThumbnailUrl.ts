/**
 * Gets the appropriate thumbnail URL by checking for local thumbnails first,
 * then falling back to the original URL. Calls the /api/thumbnail endpoint.
 *
 * @param contentId - The content ID to check for local thumbnails
 * @param originalUrl - The fallback URL if no local thumbnail exists
 * @param options - Additional parameters for more specific thumbnail matching
 * @returns Promise<string> - The thumbnail URL to use (local if available, otherwise original)
 */
export async function getThumbnailUrl(
  contentId: string,
  originalUrl: string | null | undefined,
  options?: {
    orientation?: string
    containerSlug?: string
    variantSlug?: string
    languageId?: string
  }
): Promise<string> {
  if (!contentId || typeof contentId !== 'string') {
    console.warn('getThumbnailUrl: Invalid contentId provided')
    return originalUrl || ''
  }

  try {
    const params = new URLSearchParams({
      contentId: contentId
    })

    if (originalUrl) {
      params.append('originalUrl', originalUrl)
    }

    // Add optional parameters for more specific thumbnail matching
    if (options?.orientation) {
      params.append('orientation', options.orientation)
    }
    if (options?.containerSlug) {
      params.append('containerSlug', options.containerSlug)
    }
    if (options?.variantSlug) {
      params.append('variantSlug', options.variantSlug)
    }
    if (options?.languageId) {
      params.append('languageId', options.languageId)
    }

    const apiUrl = `/api/thumbnail?${params.toString()}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      console.warn(
        `getThumbnailUrl: API request failed with status ${response.status}`
      )
      return originalUrl || ''
    }

    const data = await response.json()

    // Basic validation of response
    if (!data.url || typeof data.url !== 'string') {
      console.warn(
        'getThumbnailUrl: Invalid API response - missing or invalid url'
      )
      return originalUrl || ''
    }

    return data.url
  } catch (error) {
    console.error(
      'getThumbnailUrl: Error fetching thumbnail URL:',
      error
    )
    return originalUrl || ''
  }
}
