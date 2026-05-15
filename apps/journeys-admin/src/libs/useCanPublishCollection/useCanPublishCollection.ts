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

/**
 * Shown when the domains query failed (network blip, 500, etc.). We
 * can't tell whether the team has a custom domain in that state, so we
 * fail-closed — better to block a legitimate publish until the user
 * retries than to let a custom-domain team publish a page that won't
 * route. Distinct from the success-but-blocked copy so a frustrated
 * user can tell the two apart.
 */
export const CUSTOM_DOMAIN_PUBLISH_BLOCKED_BY_ERROR_COPY =
  "Couldn't check whether your team can publish. Refresh and try again."

interface UseCanPublishCollectionArgs {
  /**
   * Active team id. Pass null/undefined when no team is selected OR
   * while the team context is still loading; the hook fails open in
   * both cases (`canPublish: true, loading: true`) so the publish CTA
   * isn't flashed disabled on every page load. Callers that genuinely
   * have no team should gate rendering upstream (e.g. show a "Select a
   * team" empty state) rather than relying on this hook to disable.
   */
  teamId: string | null | undefined
}

/**
 * Returns whether the active team is allowed to publish a template
 * gallery collection (NES-1644 / NES-1637 reuse target).
 *
 * Loading contract: while `teamId` is null or the domains query is
 * still loading, returns `canPublish: true` so the publish CTA stays
 * enabled by default. The server is the source of truth either way;
 * this hook is a UX guardrail. Only `routeAllTeamJourneys === true`
 * on a loaded team's customDomains flips canPublish to `false`.
 *
 * Error contract: if the domains query fails (network, 500, etc.) we
 * fail CLOSED — `canPublish: false` with a distinct "couldn't check"
 * reason. Failing open on error lets a custom-domain team publish a
 * page that won't route from the user's domain; blocking is the safer
 * default. The error is logged so operators can see silent failures.
 */
export function useCanPublishCollection({
  teamId
}: UseCanPublishCollectionArgs): CanPublishCollectionResult {
  const { data, loading, error } = useCustomDomainsQuery({
    variables: { teamId: teamId ?? '' },
    skip: teamId == null
  })

  if (teamId == null) {
    // teamId is null/undefined either because no team is selected yet or
    // because the TeamProvider hasn't resolved the active team. We can't
    // distinguish those two cases from inside this hook, so fail open and
    // surface `loading: true` to callers that want to render a spinner.
    return { canPublish: true, reason: null, loading: true }
  }

  if (error != null) {
    // Log so an operator monitoring prod sees the silent failure. The
    // user gets a non-blocking message via the tooltip copy.
    console.warn('[useCanPublishCollection] customDomains query failed', {
      teamId,
      message: error.message
    })
    return {
      canPublish: false,
      reason: CUSTOM_DOMAIN_PUBLISH_BLOCKED_BY_ERROR_COPY,
      loading: false
    }
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
