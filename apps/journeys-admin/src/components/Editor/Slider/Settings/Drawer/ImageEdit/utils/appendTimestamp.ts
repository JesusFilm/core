/**
 * Appends a timestamp query parameter to a URL to avoid cache issues with image loading
 * Handles URLs that may or may not already have existing query parameters
 *
 * @param url - The URL of the image to append the timestamp to
 * @returns The URL with an appended timestamp query parameter
 *
 * @example
 * // URL without existing query parameters
 * appendTimestamp('https://example.com/image.jpg')
 * // Returns: 'https://example.com/image.jpg?t=1234567890'
 *
 * @example
 * // URL with existing query parameters
 * appendTimestamp('https://example.com/image.jpg?width=100')
 * // Returns: 'https://example.com/image.jpg?width=100&t=1234567890'
 */
export function appendTimestamp(url: string): string {
  // Remove trailing '?' if it exists
  const cleanUrl = url.endsWith('?') ? url.slice(0, -1) : url
  const separator = cleanUrl.includes('?') ? '&' : '?'
  return `${cleanUrl}${separator}t=${Date.now()}`
}
