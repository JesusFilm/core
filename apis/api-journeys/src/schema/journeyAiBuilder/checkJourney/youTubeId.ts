const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

/** Returns the 11-character video id from a YouTube link, or null. */
export function youTubeId(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^(www\.|m\.)/, '')

  let id: string | null = null
  if (host === 'youtu.be') id = parsed.pathname.slice(1).split('/')[0]
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parsed.pathname === '/watch') id = parsed.searchParams.get('v')
    const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/)
    if (match != null) id = match[2]
  }

  return id != null && YOUTUBE_ID.test(id) ? id : null
}
