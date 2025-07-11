// Using global fetch available in Node 18+

// Simple in-memory cache entry
interface CacheEntry {
  data: any
  expiresAt: number
}

// Environment variables required for Brightcove Playback API
const ACCOUNT_ID =
  process.env.BC_ACCOUNT_ID ?? process.env.BRIGHTCOVE_ACCOUNT_ID

if (!ACCOUNT_ID) {
  // eslint-disable-next-line no-console
  console.warn(
    'Brightcove ACCOUNT_ID is not configured. Set BC_ACCOUNT_ID or BRIGHTCOVE_ACCOUNT_ID in environment.'
  )
}

// Comma-separated list or JSON array string of policy keys
const policyKeysEnv =
  process.env.BC_POLICY_KEYS_JSON ?? process.env.BRIGHTCOVE_POLICY_KEYS_JSON

const POLICY_KEYS: string[] = (() => {
  if (!policyKeysEnv) return []
  try {
    // Accept either JSON array (e.g. '["key1","key2"]') or CSV (e.g. 'key1,key2')
    return policyKeysEnv.trim().startsWith('[')
      ? (JSON.parse(policyKeysEnv) as string[])
      : policyKeysEnv.split(',').map((k) => k.trim())
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Unable to parse Brightcove policy keys env variable:', err)
    return []
  }
})()

const CACHE_TTL_MS =
  (process.env.BC_CACHE_TTL_SECONDS
    ? Number(process.env.BC_CACHE_TTL_SECONDS)
    : Number(process.env.BRIGHTCOVE_CACHE_TTL_SECONDS) || 300) * 1000

// In-memory LRU approximation using Map + simple eviction when size grows too much
const CACHE_MAX_ENTRIES = 5000
const cache = new Map<string, CacheEntry>()

function setCache(key: string, data: any) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    // delete oldest entry (first inserted) – Map keeps insertion order
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

function getCache(key: string): any | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.data
}

export async function getBrightcoveVideo(ovpReferenceId: string): Promise<any> {
  if (!ACCOUNT_ID) {
    throw new Error('Brightcove ACCOUNT_ID not configured')
  }
  const cached = getCache(ovpReferenceId)
  if (cached) {
    console.log('[Brightcove] cache hit', ovpReferenceId)
    return cached
  }

  if (!POLICY_KEYS.length) {
    throw new Error('Brightcove POLICY_KEYS not configured')
  }

  for (const [idx, key] of POLICY_KEYS.entries()) {
    console.log('[Brightcove] fetching video', ovpReferenceId, 'with key', idx)
    const response = await fetch(
      `https://edge.api.brightcove.com/playback/v1/accounts/${ACCOUNT_ID}/videos/ref:${encodeURIComponent(
        ovpReferenceId
      )}`,
      {
        headers: {
          Authorization: `BCOV-Policy ${key}`
        }
      }
    )

    if (response.ok) {
      const json = await response.json()
      console.log(
        '[Brightcove] API response JSON:',
        JSON.stringify(json, null, 2)
      )
      console.log('[Brightcove] success with key', idx, 'caching result')
      setCache(ovpReferenceId, json)
      return json
    }

    if (response.status === 401 || response.status === 403) {
      console.warn('[Brightcove] unauthorized for key', idx)
    }
    if (response.status !== 401 && response.status !== 403) {
      // Errors other than unauthorized – break and throw
      throw new Error(
        `Brightcove Playback API responded with ${response.status}`
      )
    }
    // else, try next key
  }

  throw new Error('No Brightcove policy key accepted')
}

export type BrightcoveSourceCode = 'hls' | 'dash' | 'dh' | 'dl' | 's'

export function selectBrightcoveSource(
  video: any,
  code: BrightcoveSourceCode
): string | null {
  console.log('[Brightcove] selectBrightcoveSource code:', code)
  console.log(
    '[Brightcove] video.sources:',
    JSON.stringify(video?.sources, null, 2)
  )
  if (!video?.sources || !Array.isArray(video.sources)) return null
  const sources = video.sources as Array<any>
  console.log('[Brightcove] sources found:', sources)

  switch (code) {
    case 'hls': {
      const src = sources.find((s) => s.type === 'application/x-mpegURL')
      console.log('[Brightcove] src selected:', src)
      return src?.src ?? null
    }
    case 'dash': {
      const src = sources.find(
        (s) => s.container === 'MPD' && s.type === 'application/dash+xml'
      )
      console.log('[Brightcove] src selected:', src)
      return src?.src ?? null
    }
    case 'dh': {
      const mp4s = sources.filter((s) => s.container === 'MP4')
      console.log('[Brightcove] MP4s for dh:', mp4s)
      if (!mp4s.length) return null
      const sorted = mp4s.sort(
        (a, b) => (b.avg_bitrate ?? 0) - (a.avg_bitrate ?? 0)
      )
      console.log('[Brightcove] sorted MP4s for dh:', sorted)
      return sorted[0]?.src ?? null
    }
    case 'dl': {
      const mp4s = sources.filter((s) => s.container === 'MP4')
      console.log('[Brightcove] MP4s for dl:', mp4s)
      if (!mp4s.length) return null
      const sorted = mp4s.sort(
        (a, b) => (a.avg_bitrate ?? 0) - (b.avg_bitrate ?? 0)
      )
      console.log('[Brightcove] sorted MP4s for dl:', sorted)
      return sorted[0]?.src ?? null
    }
    case 's': {
      const social = sources.find((s) => /social/i.test(s.src))
      console.log('[Brightcove] social src:', social)
      if (social?.src) return social.src
      // fallback to brightcove player page
      if (!ACCOUNT_ID || !video?.id) return null
      const fallbackUrl = `https://players.brightcove.net/${ACCOUNT_ID}/default_default/index.html?videoId=${video.id}`
      console.log('[Brightcove] fallback player page URL:', fallbackUrl)
      return fallbackUrl
    }
    default:
      return null
  }
}
