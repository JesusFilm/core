/**
 * Retrieves a cookie value by name with proper URL decoding
 *
 * This function safely reads cookies on both client and server side.
 * It handles the custom fingerprint format used by the application (cookieFingerprint---value)
 * and properly decodes URL-encoded values.
 *
 * @param name - The name of the cookie to retrieve
 * @returns The decoded cookie value, or undefined if the cookie doesn't exist or we're on the server
 *
 * @example
 * ```typescript
 * const audioLanguage = getCookie('AUDIO_LANGUAGE') // Returns: "529"
 * const siteLanguage = getCookie('NEXT_LOCALE') // Returns: "en"
 * const nonExistent = getCookie('MISSING') // Returns: undefined
 * ```
 *
 * @remarks
 * - Returns undefined during server-side rendering (SSR) for safety
 * - Handles malformed URI components gracefully with fallback to raw value
 * - Uses exact cookie name matching to prevent false positives
 * - Strips the custom fingerprint prefix if present
 */
export function getCookie(name: string): string | undefined {
  // Check if we're on the client side (document exists)
  if (typeof document === 'undefined') {
    return undefined
  }

  const match = document.cookie
    .split('; ')
    .find((row) => row.split('=')[0] === name)
  if (!match) return undefined
  const raw = match.substring(name.length + 1)
  const value = raw.includes('---') ? raw.split('---')[1] : raw
  try {
    return decodeURIComponent(value)
  } catch {
    // Fallback for malformed URI components
    return value
  }
}

/**
 * Sets a cookie with proper URL encoding and security attributes
 *
 * This function safely sets cookies with appropriate security flags and encoding.
 * It uses a custom fingerprint format and includes security attributes like SameSite
 * protection and proper expiration handling.
 *
 * @param name - The name of the cookie to set
 * @param value - The value to store in the cookie (will be URL-encoded)
 *
 * @example
 * ```typescript
 * setCookie('AUDIO_LANGUAGE', '529')
 * setCookie('NEXT_LOCALE', 'en')
 * setCookie('SUBTITLES_ON', 'true')
 * setCookie('USER_PREFERENCE', 'special chars: éñ中文') // Properly encoded
 * ```
 *
 * @remarks
 * - Does nothing during server-side rendering (SSR) for safety
 * - Values are URL-encoded to handle special characters safely
 * - Uses custom fingerprint format: "cookieFingerprint---encodedValue"
 * - Sets 30-day expiration appropriate for user language preferences
 * - Includes SameSite=Lax for CSRF protection while allowing normal navigation
 * - Sets path=/ to make cookie available across the entire domain
 *
 * @security
 * - SameSite=Lax prevents cross-site request forgery attacks
 * - URL encoding prevents injection of malicious cookie attributes
 * - Explicit expiration prevents indefinite cookie persistence
 */
export function setCookie(name: string, value: string): void {
  // Check if we're on the client side (document exists)
  if (typeof document === 'undefined') {
    return
  }

  const cookieFingerprint = '00005'
  const encodedValue = encodeURIComponent(value)

  // Set cookie with security attributes
  // SameSite=Lax provides CSRF protection while allowing normal navigation
  // 30 days expiration for language preferences
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()

  document.cookie = `${name}=${cookieFingerprint}---${encodedValue}; path=/; SameSite=Lax; expires=${expires}`
}
