import { BlurhashResult } from './types'

/**
 * Generates blurhash and dominant color for an image URL by calling the API route.
 * Returns null on failure to allow components to use fallback behavior.
 *
 * @param imageUrl - The URL of the image to process
 * @returns Promise<BlurhashResult | null> - The blurhash and dominant color, or null if generation failed
 */
export async function generateBlurhashFromUrl(imageUrl: string): Promise<BlurhashResult | null> {
  if (!imageUrl || typeof imageUrl !== 'string') {
    console.warn('generateBlurhashFromUrl: Invalid imageUrl provided')
    return null
  }

  try {
    const apiUrl = `/api/blurhash?imageUrl=${encodeURIComponent(imageUrl)}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      console.warn(`generateBlurhashFromUrl: API request failed with status ${response.status}`)
      return null
    }

    const data: BlurhashResult = await response.json()

    // Basic validation of response
    if (!data.blurhash || !data.dominantColor) {
      console.warn('generateBlurhashFromUrl: Invalid API response - missing blurhash or dominantColor')
      return null
    }

    return data
  } catch (error) {
    console.error('generateBlurhashFromUrl: Error fetching blurhash data:', error)
    return null
  }
}
