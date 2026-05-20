import { ApolloCache, Reference } from '@apollo/client'
import reject from 'lodash/reject'

interface EvictFromTemplateGalleryPagesOptions {
  /**
   * When true (default), the `Journey:<id>` entity is also evicted from
   * the cache. Pass false when the journey itself stays a live entity
   * post-mutation (e.g. archive — the journey still surfaces in the
   * archived list, only the TemplateGalleryItem variant should go).
   */
  evictJourneyEntity?: boolean
}

/**
 * Drops the given journey ids from every cached `TemplateGalleryPage.templates`
 * list, then evicts the `TemplateGalleryItem` variant (and optionally the
 * `Journey` entity itself) from the normalized cache.
 *
 * Used by the trash and archive lifecycle mutations to keep the admin UI
 * in sync without depending on Apollo's dangling-ref filtering, which
 * was observed to be unreliable on stage (NES-1644). Mirrors the
 * `libs/blockDeleteUpdate` pattern: enumerate every parent entity via
 * `cache.extract()`, then `cache.modify` each one to reject the moving
 * ref.
 *
 * Two non-obvious notes:
 *
 * - `cache.modify` without `id` only targets ROOT_QUERY. Enumerating
 *   TemplateGalleryPage entities by id prefix from `cache.extract()` is
 *   the only API-level way to reach every cached page regardless of the
 *   query variables tuple that fetched it.
 * - The templates list stores entities as `TemplateGalleryItem:<id>`
 *   (a Pothos variant of Journey — same DB row, different __typename),
 *   so a `Journey:<id>` evict does not propagate to the parent's
 *   templates list. The filter must reference the variant ref.
 */
export function evictFromTemplateGalleryPages<TCache>(
  cache: ApolloCache<TCache>,
  journeyIds: readonly string[],
  options: EvictFromTemplateGalleryPagesOptions = {}
): void {
  const { evictJourneyEntity = true } = options
  if (journeyIds.length === 0) return

  const templateRefsToDrop = new Set<string>()
  for (const id of journeyIds) {
    const ref = cache.identify({ __typename: 'TemplateGalleryItem', id })
    if (ref != null) templateRefsToDrop.add(ref)
  }

  const snapshot = cache.extract()
  for (const cacheId of Object.keys(snapshot)) {
    if (!cacheId.startsWith('TemplateGalleryPage:')) continue
    cache.modify({
      id: cacheId,
      fields: {
        templates(existing) {
          if (!Array.isArray(existing)) return existing
          return reject(existing as Reference[], (ref) =>
            templateRefsToDrop.has(ref.__ref)
          )
        }
      }
    })
  }

  for (const id of journeyIds) {
    if (evictJourneyEntity) {
      cache.evict({ id: cache.identify({ __typename: 'Journey', id }) })
    }
    cache.evict({ id: cache.identify({ __typename: 'TemplateGalleryItem', id }) })
  }
}
