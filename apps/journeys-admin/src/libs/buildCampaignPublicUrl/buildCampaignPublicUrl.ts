/**
 * Public URL of a campaign on the journeys app root domain. `||` (not `??`)
 * so an explicitly-empty env var still falls back to the production host.
 */
export function buildCampaignPublicUrl(slug: string): string {
  const base = (
    process.env.NEXT_PUBLIC_JOURNEYS_URL || 'https://your.nextstep.is'
  ).replace(/\/+$/, '')
  return `${base}/campaign/${encodeURIComponent(slug)}`
}
