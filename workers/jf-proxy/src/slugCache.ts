export const SLUG_CACHE_MAX_AGE = 86400

export type SlugKind = 'video' | 'language'

export function normalizeId(id: string): string {
  return id.replace(/\.html?$/i, '')
}

export function getSlugCacheKey(kind: SlugKind, id: string): string {
  return `https://jf-proxy.local/cache/jf-watch/${kind}/${encodeURIComponent(
    normalizeId(id)
  )}`
}

export async function getCachedSlug(
  kind: SlugKind,
  id: string
): Promise<string | null> {
  const response = await caches.default.match(getSlugCacheKey(kind, id))
  if (response == null) return null

  const slug = (await response.text()).trim()
  return slug.length > 0 ? slug : null
}

export async function putCachedSlug(
  kind: SlugKind,
  id: string,
  slug: string | null | undefined
): Promise<void> {
  const normalizedSlug = slug?.trim()
  if (!normalizedSlug) return

  await caches.default.put(
    getSlugCacheKey(kind, id),
    new Response(normalizedSlug, {
      headers: {
        'Cache-Control': `public, max-age=${SLUG_CACHE_MAX_AGE}`
      }
    })
  )
}
