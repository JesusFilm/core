// Returns an https iframe-embed URL for supported providers, or null if the
// input does not match a known pattern. Always rewrites to https to avoid
// mixed-content warnings on the page.
export function toEmbedUrl(url: string): string | null {
  const youtube = url.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
  )
  if (youtube != null) return `https://www.youtube.com/embed/${youtube[1]}`

  const loom = url.match(
    /^(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/([\w-]+)/
  )
  if (loom != null) return `https://www.loom.com/embed/${loom[1]}`

  return null
}
