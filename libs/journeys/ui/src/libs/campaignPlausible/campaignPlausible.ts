/**
 * The custom events a public Campaign Public Page sends to Plausible, on top
 * of its automatic page views. Every name carries the `campaign` prefix so it
 * cannot be mistaken for a journey event (`JourneyPlausibleEvents`). Each one
 * is a goal on the Campaign's own Plausible site, created with the site by the
 * api-journeys plausible worker.
 *
 * Every event also carries the page's own props (`campaign_id`, `region`,
 * `language`), added by `useCampaignPlausible`; the props here are the
 * event's own. `language` is always the Page Language and `shareLanguage` the
 * Share Language a share event is about.
 */
export interface CampaignPlausibleEvents {
  /** A journey opened from a journey card's Open button or the Share section's open-link icon. */
  campaignJourneyClick: {
    /** The journey's slug: the last path segment of its public address; left out when there is none. */
    journey?: string
    source: 'card' | 'share'
    shareLanguage?: string
  }
  /** A Region Switcher card clicked; `region` is the target region's slug. */
  campaignRegionClick: { region: string }
  /** Download QR in the Share section. */
  campaignQrDownload: { shareLanguage: string }
  /** Copy link in the Share section. */
  campaignShareLinkCopy: { shareLanguage: string }
}

/**
 * The props every campaign page view and event carries; a type, so it passes
 * as next-plausible's `pageviewProps`. Keys are lowercase: page-view props
 * travel as `event-<key>` attributes on the script tag, which HTML lowercases,
 * so a camelCase key would reach Plausible under a second spelling.
 */
export type CampaignPlausibleProps = {
  campaign_id: string
  /** The Region Page's slug; absent on the landing page. */
  region?: string
  /** The Page Language's BCP 47 tag. */
  language?: string
}

/** The Plausible site a Campaign reports to on its own. */
export function campaignSiteId(campaignId: string): string {
  return `api-journeys-campaign-${campaignId}`
}
