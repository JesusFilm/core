import { useRouter } from 'next/router'

// Treats an array value as "first wins" (Next.js types query params as
// `string | string[] | undefined`) and an empty string as absent so
// `?useTemplate=` doesn't look active.
function getJourneyIdParam(
  value: string | string[] | undefined
): string | null {
  if (Array.isArray(value)) {
    const [first] = value
    return first != null && first.length > 0 ? first : null
  }
  if (typeof value === 'string' && value.length > 0) return value
  return null
}

/**
 * Returns the journey id from the `?useTemplate=<journeyId>` deep link,
 * or `null` when the param is absent or empty.
 *
 * Single source of truth for the deep-link activation rule — used by
 * `UseTemplateDeepLink` to decide whether to mount its dialog, and by
 * any caller that needs the id itself.
 */
export function useTemplateDeepLinkJourneyId(): string | null {
  const router = useRouter()
  return getJourneyIdParam(router.query.useTemplate)
}

/**
 * Boolean form of `useTemplateDeepLinkJourneyId` for call sites that only
 * need to know whether the deep link is active, not the id itself (e.g.
 * `pages/index.tsx` suppresses the onboarding popover while the deep
 * link is active).
 */
export function useTemplateDeepLinkActive(): boolean {
  return useTemplateDeepLinkJourneyId() != null
}
