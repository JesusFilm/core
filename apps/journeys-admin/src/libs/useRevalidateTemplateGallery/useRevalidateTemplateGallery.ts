import { useCallback } from 'react'

/**
 * Endpoint exported for tests so they can assert against the URL without
 * duplicating the literal. Production code should call the hook, not the
 * endpoint directly.
 */
export const REVALIDATE_TEMPLATE_GALLERY_ENDPOINT =
  '/api/revalidate-template-gallery'

/**
 * Fires a fire-and-forget request to the admin revalidate proxy for each
 * unique non-empty slug. The proxy authenticates the caller, asks the
 * public journeys app to revalidate `/home/template-gallery/<slug>`, and
 * returns 200. The promise resolves once every request settles — callers
 * may await it (e.g. for a snackbar) but most won't, since the public
 * page revalidate doesn't block the admin UI.
 *
 * Errors are swallowed. A failed revalidate doesn't undo the mutation
 * that just succeeded; the next mutation (or the fallback ISR cadence
 * on the public route) will pick the page back up.
 */
export type RevalidateTemplateGalleryFn = (
  slugs: ReadonlyArray<string | null | undefined>
) => Promise<void>

export function useRevalidateTemplateGallery(): RevalidateTemplateGalleryFn {
  return useCallback(async (slugs) => {
    const unique = Array.from(
      new Set(
        slugs.filter(
          (slug): slug is string => typeof slug === 'string' && slug.length > 0
        )
      )
    )
    if (unique.length === 0) return
    await Promise.all(
      unique.map(async (slug) => {
        try {
          await fetch(
            `${REVALIDATE_TEMPLATE_GALLERY_ENDPOINT}?${new URLSearchParams({
              slug
            }).toString()}`,
            {
              method: 'GET',
              credentials: 'same-origin'
            }
          )
        } catch {
          // Swallow — the mutation already succeeded. The public page will
          // catch up on its next ISR window or the next successful mutation.
        }
      })
    )
  }, [])
}
