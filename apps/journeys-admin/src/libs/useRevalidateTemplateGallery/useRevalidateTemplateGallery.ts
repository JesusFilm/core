import { useCallback } from 'react'

// Fire-and-forget hook for asking the admin revalidate proxy to refresh
// public template-gallery pages by slug. Dedupes, drops empties, swallows
// network errors; logs non-OK HTTP responses so prod has a debug signal.
//
// Endpoint contract: POST + `X-Requested-With: XMLHttpRequest` (CSRF).
//
// Returns a `useCallback`-stable function so consumers can list it in
// effect / useCallback / useMemo dependency arrays without retriggering
// on every render.
export function useRevalidateTemplateGallery(): (
  slugs: ReadonlyArray<string | null | undefined>
) => Promise<void> {
  return useCallback(
    async (slugs: ReadonlyArray<string | null | undefined>) => {
      const unique = [...new Set(slugs.filter((s): s is string => !!s))]
      await Promise.all(
        unique.map(async (slug) => {
          const url = `/api/revalidate-template-gallery?slug=${encodeURIComponent(slug)}`
          try {
            const response = await fetch(url, {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            if (!response.ok) {
              console.warn('revalidate failed', {
                slug,
                status: response.status
              })
            }
          } catch {
            // Network-level failure — already swallowed-by-design. Mutation
            // succeeded; ISR fallback or the next mutation will catch up.
          }
        })
      )
    },
    []
  )
}
