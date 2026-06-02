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

// A YouTube video id is exactly 11 url-safe base64 chars. Validating the
// shape stops non-video paths (e.g. youtu.be/playlist, /channel/UC…) from
// being mistaken for a video and producing a broken preview iframe.
const YOUTUBE_ID_RE = /^[\w-]{11}$/

function asYouTubeId(candidate: string | null | undefined): string | null {
  return candidate != null && YOUTUBE_ID_RE.test(candidate) ? candidate : null
}

function youTubeId(url: URL): string | null {
  // youtu.be/<id>
  if (url.hostname === 'youtu.be') {
    return asYouTubeId(url.pathname.split('/')[1])
  }
  if (YOUTUBE_WATCH_HOSTS.has(url.hostname)) {
    // watch?v=<id>
    const fromQuery = asYouTubeId(url.searchParams.get('v'))
    if (fromQuery != null) return fromQuery
    // /shorts/<id>, /embed/<id>, /live/<id>
    const [, segment, id] = url.pathname.split('/')
    if (['shorts', 'embed', 'live'].includes(segment)) return asYouTubeId(id)
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
