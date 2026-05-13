/**
 * Copy a string to the clipboard with a legacy fallback.
 *
 * Prefers `navigator.clipboard.writeText`. When that's unavailable
 * or rejects (insecure context, no permission, MUI Dialog focus trap
 * stealing focus, etc.) falls back to a `copy` event interception:
 * register a one-shot copy listener that writes our text via
 * `clipboardData.setData`, then trigger the copy via `execCommand`.
 *
 * The copy-event path avoids the textarea + selection dance, which is
 * unreliable inside modals because the focus trap yanks focus back
 * before the selection sticks.
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
  let copied = false
  const handler = (event: ClipboardEvent): void => {
    if (event.clipboardData == null) return
    event.clipboardData.setData('text/plain', text)
    event.preventDefault()
    copied = true
  }
  document.addEventListener('copy', handler)
  try {
    document.execCommand('copy')
    return copied
  } catch {
    return false
  } finally {
    document.removeEventListener('copy', handler)
  }
}
