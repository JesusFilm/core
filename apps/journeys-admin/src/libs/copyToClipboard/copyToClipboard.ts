/**
 * Copy a string to the clipboard with a legacy fallback.
 *
 * Prefers `navigator.clipboard.writeText`. When that's unavailable
 * (insecure context, no permission, missing focus, etc.) falls back to
 * a temporary textarea + `document.execCommand('copy')`. The legacy
 * path is deprecated but still works across every relevant browser
 * and doesn't require a secure context.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText != null
  ) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to legacy.
    }
  }
  if (typeof document === 'undefined') return false
  const textarea = document.createElement('textarea')
  textarea.value = text
  // Avoid scrolling to bottom on iOS Safari.
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  textarea.setAttribute('readonly', '')
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, text.length)
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}
