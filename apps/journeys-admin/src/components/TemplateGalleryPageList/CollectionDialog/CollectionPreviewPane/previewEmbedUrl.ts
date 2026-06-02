// Client-side preview normalization. The backend is the source of truth for
// validation/normalization on save (Canva/Slides need an oEmbed round-trip we
// cannot do here), so the preview only ever embeds URLs it can safely build
// itself: https + a known directly-embeddable host. YouTube watch/share/shorts
// URLs are normalized to the privacy-friendly nocookie embed form so the
// preview matches the public render. Everything else returns null — the
// caller shows a "preview after saving" placeholder rather than iframing a raw
// share URL (which YouTube/Canva reject with X-Frame-Options).

const YOUTUBE_WATCH_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com'
])

function youTubeId(url: URL): string | null {
  // youtu.be/<id>
  if (url.hostname === 'youtu.be') {
    const id = url.pathname.split('/')[1]
    return id !== '' ? id : null
  }
  if (YOUTUBE_WATCH_HOSTS.has(url.hostname)) {
    // watch?v=<id>
    const v = url.searchParams.get('v')
    if (v != null && v !== '') return v
    // /shorts/<id>, /embed/<id>, /live/<id>
    const [, segment, id] = url.pathname.split('/')
    if (['shorts', 'embed', 'live'].includes(segment) && id != null && id !== '')
      return id
  }
  return null
}

/**
 * Returns an iframe-embeddable https URL for the preview, or null when the URL
 * cannot be safely previewed client-side (empty, non-https, non-allowlisted
 * host, or a provider — like Canva — that needs server normalization).
 */
export function previewEmbedUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim()
  if (trimmed === '') return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (url.protocol !== 'https:') return null

  // Already a normalized YouTube embed — pass through.
  if (
    (url.hostname === 'www.youtube-nocookie.com' ||
      url.hostname === 'youtube-nocookie.com') &&
    url.pathname.startsWith('/embed/')
  ) {
    return trimmed
  }

  const id = youTubeId(url)
  if (id != null) return `https://www.youtube-nocookie.com/embed/${id}`

  // Canva, Google Slides, and unknown hosts need server normalization — not
  // previewable client-side.
  return null
}
