import { encode } from 'blurhash'
import sharp from 'sharp'
import { z } from 'zod'

import { type ReadyImage, readyImage } from '@core/yoga/mcp/mediaContract'
import { boundedJson } from '@core/yoga/mcp/readContract'

const hosts = new Set([
  'imagedelivery.net',
  'images.unsplash.com',
  'image.mux.com',
  'i.ytimg.com'
])

export function publicMediaUrl(value: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('VALIDATION_FAILED')
  }
  if (
    url.protocol !== 'https:' ||
    !hosts.has(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    url.hash
  )
    throw new Error('VALIDATION_FAILED')
  return url.href
}
export function catalogStreamUrl(value: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('VALIDATION_FAILED')
  }
  const trusted =
    ['stream.mux.com', 'arc.gt', 'video-cdn.jesusfilm.org'].includes(
      url.hostname
    ) ||
    url.hostname.endsWith('.cloudfront.net') ||
    url.hostname.endsWith('.akamaized.net')
  if (
    !trusted ||
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.hash
  )
    throw new Error('VALIDATION_FAILED')
  return url.href
}
async function providerJson(
  url: URL,
  headers: Record<string, string> = {}
): Promise<unknown> {
  const response = await fetch(url, {
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(10000)
  })
  if (!response.ok) throw new Error('DEPENDENCY_UNAVAILABLE')
  return boundedJson(response)
}
export interface MediaProviders {
  catalog: (url: string) => Promise<void>
  image: (url: string) => Promise<ReadyImage>
  unsplash: (id: string) => Promise<ReadyImage>
  searchUnsplash: (
    query: string,
    page: number,
    limit: number
  ) => Promise<Array<{ id: string; preview: string; alt: string | null }>>
  youtube: (id: string) => Promise<{
    title: string
    description: string
    image: string
    duration: number
    subtitleBcp47: string[]
    subtitleStatus: 'ready' | 'unavailable'
  }>
}
const photo = z.object({
  id: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blur_hash: z.string().min(1),
  alt_description: z.string().nullable(),
  urls: z.object({ regular: z.string(), small: z.string() })
})

/** Provider origins and paths are server-owned. Redirects and caller URLs are
 * never accepted as source identities, including Unsplash download locations.
 */
export function mediaProviders(env: NodeJS.ProcessEnv): MediaProviders {
  let cachedCaptionToken: { token: string; expiresAt: number } | undefined
  const captionToken = async (): Promise<string | undefined> => {
    if (env.YOUTUBE_CAPTIONS_ACCESS_TOKEN)
      return env.YOUTUBE_CAPTIONS_ACCESS_TOKEN
    const configured = [
      env.YOUTUBE_CAPTIONS_CLIENT_ID,
      env.YOUTUBE_CAPTIONS_CLIENT_SECRET,
      env.YOUTUBE_CAPTIONS_REFRESH_TOKEN
    ]
    if (!configured.every(Boolean)) return
    if (cachedCaptionToken && cachedCaptionToken.expiresAt > Date.now())
      return cachedCaptionToken.token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: env.YOUTUBE_CAPTIONS_CLIENT_ID!,
        client_secret: env.YOUTUBE_CAPTIONS_CLIENT_SECRET!,
        refresh_token: env.YOUTUBE_CAPTIONS_REFRESH_TOKEN!
      })
    })
    if (!response.ok) throw new Error('DEPENDENCY_UNAVAILABLE')
    const value = z
      .object({
        access_token: z.string().min(1),
        expires_in: z.number().positive()
      })
      .parse(await boundedJson(response))
    cachedCaptionToken = {
      token: value.access_token,
      expiresAt: Date.now() + Math.max(0, value.expires_in - 30) * 1000
    }
    return value.access_token
  }
  const unsplash = async (
    path: string,
    params: Record<string, string> = {}
  ) => {
    if (!env.UNSPLASH_ACCESS_KEY) throw new Error('DEPENDENCY_UNAVAILABLE')
    const url = new URL(path, 'https://api.unsplash.com')
    url.search = new URLSearchParams(params).toString()
    return providerJson(url, {
      Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`
    })
  }
  return {
    async catalog(value) {
      let url = catalogStreamUrl(value)
      for (let redirect = 0; redirect <= 3; redirect++) {
        const response = await fetch(url, {
          redirect: 'manual',
          signal: AbortSignal.timeout(10000)
        })
        if (response.status >= 300 && response.status < 400) {
          await response.body?.cancel()
          const location = response.headers.get('location')
          if (!location || redirect === 3) throw new Error('VALIDATION_FAILED')
          url = catalogStreamUrl(new URL(location, url).href)
          continue
        }
        if (!response.ok || !response.body)
          throw new Error('DEPENDENCY_UNAVAILABLE')
        const reader = response.body.getReader(),
          chunks: Uint8Array[] = []
        let bytes = 0
        try {
          while (true) {
            const chunk = await reader.read()
            if (chunk.done) break
            bytes += chunk.value.length
            if (bytes > 524288) throw new Error('LIMIT_EXCEEDED')
            chunks.push(chunk.value)
          }
        } finally {
          await reader.cancel()
        }
        if (
          !Buffer.concat(chunks)
            .toString('utf8')
            .trimStart()
            .startsWith('#EXTM3U')
        )
          throw new Error('VALIDATION_FAILED')
        return
      }
    },
    async image(value) {
      const url = publicMediaUrl(value)
      if (
        !['imagedelivery.net', 'images.unsplash.com'].includes(
          new URL(url).hostname
        )
      )
        throw new Error('VALIDATION_FAILED')
      const response = await fetch(url, {
        redirect: 'error',
        signal: AbortSignal.timeout(10000)
      })
      if (!response.ok || !response.body)
        throw new Error('DEPENDENCY_UNAVAILABLE')
      const chunks: Uint8Array[] = []
      let bytes = 0
      const reader = response.body.getReader()
      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          bytes += value.length
          if (bytes > 10000000) throw new Error('LIMIT_EXCEEDED')
          chunks.push(value)
        }
      } finally {
        await reader.cancel()
      }
      const image = sharp(Buffer.concat(chunks), { limitInputPixels: 40000000 })
      const metadata = await image.metadata()
      const { data, info } = await image
        .ensureAlpha()
        .resize(32, 32, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true })
      return readyImage.parse({
        kind: 'image',
        src: url,
        width: metadata.width,
        height: metadata.height,
        blurhash: encode(
          new Uint8ClampedArray(data),
          info.width,
          info.height,
          4,
          4
        )
      })
    },
    async unsplash(id) {
      const value = photo.parse(
        await unsplash(`/photos/${encodeURIComponent(id)}`)
      )
      return readyImage.parse({
        kind: 'image',
        src: publicMediaUrl(value.urls.regular),
        width: value.width,
        height: value.height,
        blurhash: value.blur_hash
      })
    },
    async searchUnsplash(query, page, limit) {
      const result = z.object({ results: z.array(photo) }).parse(
        await unsplash('/search/photos', {
          query,
          page: String(page),
          per_page: String(limit),
          content_filter: 'high'
        })
      )
      return result.results.map((value) => ({
        id: value.id,
        preview: publicMediaUrl(value.urls.small),
        alt: value.alt_description
      }))
    },
    async youtube(id) {
      if (!env.FIREBASE_API_KEY) throw new Error('DEPENDENCY_UNAVAILABLE')
      const url = new URL('https://www.googleapis.com/youtube/v3/videos')
      url.search = new URLSearchParams({
        key: env.FIREBASE_API_KEY,
        id,
        part: 'snippet,contentDetails,status'
      }).toString()
      const value = z
        .object({
          items: z.array(
            z.object({
              status: z.object({
                privacyStatus: z.literal('public'),
                uploadStatus: z.literal('processed'),
                embeddable: z.literal(true)
              }),
              snippet: z.object({
                title: z.string(),
                description: z.string(),
                thumbnails: z.object({ high: z.object({ url: z.string() }) })
              }),
              contentDetails: z.object({
                duration: z.string(),
                caption: z.enum(['true', 'false']).default('false')
              })
            })
          )
        })
        .parse(await providerJson(url)).items[0]
      if (!value) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      const duration = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(
        value.contentDetails.duration
      )
      if (!duration) throw new Error('VALIDATION_FAILED')
      const subtitleBcp47: string[] = []
      let subtitleStatus: 'ready' | 'unavailable' = 'ready'
      const token =
        value.contentDetails.caption === 'true'
          ? await captionToken().catch(() => undefined)
          : undefined
      if (value.contentDetails.caption === 'true' && !token)
        subtitleStatus = 'unavailable'
      if (value.contentDetails.caption === 'true' && token) {
        const captions = new URL(
          'https://www.googleapis.com/youtube/v3/captions'
        )
        captions.search = new URLSearchParams({
          videoId: id,
          part: 'snippet'
        }).toString()
        try {
          const tracks = z
            .object({
              items: z.array(
                z.object({
                  snippet: z.object({
                    language: z.string(),
                    trackKind: z.string(),
                    status: z.string(),
                    isDraft: z.boolean()
                  })
                })
              )
            })
            .parse(
              await providerJson(captions, { Authorization: `Bearer ${token}` })
            )
          subtitleBcp47.push(
            ...tracks.items
              .filter(
                (item) =>
                  item.snippet.trackKind === 'standard' &&
                  item.snippet.status === 'serving' &&
                  !item.snippet.isDraft
              )
              .map((item) => item.snippet.language.toLowerCase())
          )
        } catch {
          subtitleStatus = 'unavailable'
        }
      }
      return {
        title: value.snippet.title,
        description: value.snippet.description,
        image: publicMediaUrl(value.snippet.thumbnails.high.url),
        duration:
          Number(duration[1] ?? 0) * 3600 +
          Number(duration[2] ?? 0) * 60 +
          Number(duration[3] ?? 0),
        subtitleBcp47,
        subtitleStatus
      }
    }
  }
}
