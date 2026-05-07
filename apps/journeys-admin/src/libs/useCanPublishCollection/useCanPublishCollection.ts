import { useCustomDomainsQuery } from '../useCustomDomainsQuery'

export interface CanPublishCollectionResult {
  /**
   * True when the team is allowed to publish a template gallery collection.
   *
   * Custom-domain teams (any `customDomain.routeAllTeamJourneys === true`)
   * are blocked because the public gallery page lives on
   * `your.nextstep.is/template-gallery/<slug>` only — there is no
   * routing path for custom domains today.
   */
  canPublish: boolean
  /**
   * User-facing tooltip copy explaining why publish is blocked, or null
   * when publish is allowed. Always wrap in `t(...)` at the call site.
   */
  reason: string | null
  /** Mirrors the underlying query's loading state. */
  loading: boolean
}

/**
 * Verbatim copy from the NES-1644 spec. Exported so consumers can reuse
 * it on Tooltip surfaces directly.
 */
export const CUSTOM_DOMAIN_PUBLISH_BLOCKED_COPY =
  "Teams with custom domains can't publish template galleries. Contact support if you need this."

interface UseCanPublishCollectionArgs {
  /**
   * Active team id. Pass null/undefined when no team is selected; the
   * hook returns `canPublish: false` in that case (no team, no publish).
   */
  teamId: string | null | undefined
}

/**
 * Returns whether the active team is allowed to publish a template
 * gallery collection (NES-1644 / NES-1637 reuse target).
 *
 * Skips the underlying query when teamId is null. While loading the
 * domains query, treats the team as `canPublish: true` to keep the
 * publish CTA enabled by default — the gate is fail-open. The server
 * is the source of truth either way; this hook is a UX guardrail.
 */
export function useCanPublishCollection({
  teamId
}: UseCanPublishCollectionArgs): CanPublishCollectionResult {
  const { data, loading } = useCustomDomainsQuery({
    variables: { teamId: teamId ?? '' },
    skip: teamId == null
  })

  if (teamId == null) {
    return { canPublish: false, reason: null, loading: false }
  }

  const hasRouteAllDomain =
    data?.customDomains.some((domain) => domain.routeAllTeamJourneys) ?? false

  if (hasRouteAllDomain) {
    return {
      canPublish: false,
      reason: CUSTOM_DOMAIN_PUBLISH_BLOCKED_COPY,
      loading
    }
  }

  return { canPublish: true, reason: null, loading }
}
