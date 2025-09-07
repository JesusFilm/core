/**
 * URL utility functions for the watch-modern application
 */

/**
 * Builds a sanitized Watch Now URL for a video
 * @param watchUrl - Base watch URL from environment
 * @param slug - Video slug from API
 * @param languageSlugOverride - Optional language-specific slug override
 * @returns Sanitized absolute URL
 */
export function buildWatchNowUrl(
  watchUrl: string,
  slug: string,
  languageSlugOverride: string | null = null
): string {
  // Sanitize the slug: ensure it's a clean path without protocol/host/query/fragment
  const sanitizedSlug = sanitizeSlug(slug)

  // Use languageSlugOverride if provided, otherwise use the sanitized slug
  const finalSlug = languageSlugOverride || sanitizedSlug

  // Build absolute URL: watchUrl + "/" + finalSlug
  return `${watchUrl}/${finalSlug}`
}

/**
 * Sanitizes a video slug to ensure it's a clean path
 * - Removes protocol and host if present
 * - Removes query parameters and fragments
 * - Ensures no leading/trailing slashes
 * - Handles legacy .html extensions appropriately
 * @param slug - Raw slug from configuration or API
 * @returns Sanitized slug path
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) return ''

  // Remove protocol and host if present (shouldn't be in our data, but defensive)
  let sanitized = slug.replace(/^https?:\/\//, '')

  // Remove domain/path prefix if present
  if (sanitized.includes('/')) {
    const parts = sanitized.split('/')
    // Remove domain parts, keep only the path after the first meaningful segment
    const pathStartIndex = parts.findIndex(part => part && !part.includes('.') && part !== 'watch')
    if (pathStartIndex > -1) {
      sanitized = parts.slice(pathStartIndex).join('/')
    }
  }

  // Remove query parameters and fragments
  sanitized = sanitized.split('?')[0].split('#')[0]

  // Remove leading/trailing slashes
  sanitized = sanitized.replace(/^\/+|\/+$/g, '')

  return sanitized
}

/**
 * Validates that a URL is safe to use for external navigation
 * @param url - URL to validate
 * @param allowedHosts - Array of allowed host patterns
 * @returns true if URL is safe, false otherwise
 */
export function isSafeUrl(url: string, allowedHosts: string[] = []): boolean {
  try {
    const urlObj = new URL(url)

    // Check if host is in allowed list (if provided)
    if (allowedHosts.length > 0) {
      const isAllowed = allowedHosts.some(allowedHost =>
        urlObj.hostname === allowedHost || urlObj.hostname.endsWith(`.${allowedHost}`)
      )
      if (!isAllowed) return false
    }

    // Only allow http/https protocols
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    // Invalid URL format
    return false
  }
}
