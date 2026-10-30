/**
 * The Campaign Plausible site, defined once and free of React so the
 * api-journeys plausible worker imports it at runtime: its site id, the props
 * every campaign page view carries, and each custom event with the props it
 * adds. The event types, the site's goals and its allowed props are all
 * derived from it, so an event added here becomes a goal and an allowed prop
 * set with no second list to keep.
 */

/** One prop's value type and whether an event may leave it out. */
interface PropSpec<Value extends string, Optional extends boolean> {
  readonly optional: Optional
  /** Type only: never set. */
  readonly value?: Value
}

function required<Value extends string = string>(): PropSpec<Value, false> {
  return { optional: false }
}

function optional<Value extends string = string>(): PropSpec<Value, true> {
  return { optional: true }
}

type PropSpecs = Record<string, PropSpec<string, boolean>>

type ValueOf<Spec> = Spec extends PropSpec<infer Value, boolean> ? Value : never

/** The props object a set of specs describes, optional specs as optional keys. */
type PropsOf<Specs extends PropSpecs> = {
  [Key in keyof Specs as Specs[Key] extends PropSpec<string, false>
    ? Key
    : never]: ValueOf<Specs[Key]>
} & {
  [Key in keyof Specs as Specs[Key] extends PropSpec<string, true>
    ? Key
    : never]?: ValueOf<Specs[Key]>
}

type Flatten<Type> = { [Key in keyof Type]: Type[Key] }

export const campaignPlausibleSite = {
  /** The Plausible site a Campaign reports to on its own. */
  siteId: (campaignId: string): string => `api-journeys-campaign-${campaignId}`,
  /**
   * The props every campaign page view and event carries. Keys are lowercase:
   * page-view props travel as `event-<key>` attributes on the script tag,
   * which HTML lowercases, so a camelCase key would reach Plausible under a
   * second spelling.
   */
  pageProps: {
    campaign_id: required(),
    /** The Region Page's slug; absent on the landing page. */
    region: optional(),
    /** The Page Language's BCP 47 tag. */
    language: optional()
  },
  /**
   * The custom events a Campaign Public Page sends besides its page views,
   * each with the props it adds to the page's. Every name carries the
   * `campaign` prefix so it cannot be mistaken for a journey event
   * (`JourneyPlausibleEvents`).
   */
  events: {
    /** A journey opened from a journey card's Open button or the Share section's open-link icon. */
    campaignJourneyClick: {
      /** The journey's slug: the last path segment of its public address; left out when there is none. */
      journey: optional(),
      source: required<'card' | 'share'>(),
      /** The Share Language's BCP 47 tag, here and on every share event; left out without one. */
      shareLanguage: optional()
    },
    /**
     * A Region Switcher card clicked: `targetRegion` is the region clicked,
     * apart from the page's own `region`, the one the visitor is on.
     */
    campaignRegionClick: { targetRegion: required() },
    /** Download QR in the Share section. */
    campaignQrDownload: { shareLanguage: optional() },
    /** Copy link in the Share section. */
    campaignShareLinkCopy: { shareLanguage: optional() }
  }
} as const satisfies {
  siteId: (campaignId: string) => string
  pageProps: PropSpecs
  events: Record<`campaign${string}`, PropSpecs>
}

type Site = typeof campaignPlausibleSite

/** The props every campaign page view and event carries; a type alias, so it passes as next-plausible's `pageviewProps`. */
export type CampaignPlausibleProps = Flatten<PropsOf<Site['pageProps']>>

/** Each campaign event's own props; `useCampaignPlausible` adds the page's. */
export type CampaignPlausibleEvents = {
  [Event in keyof Site['events']]: Flatten<PropsOf<Site['events'][Event]>>
}

export type CampaignPlausibleEventName = keyof CampaignPlausibleEvents

type CampaignPlausibleProp =
  | keyof Site['pageProps']
  | {
      [Event in CampaignPlausibleEventName]: keyof Site['events'][Event]
    }[CampaignPlausibleEventName]

/** The Plausible site a Campaign reports to on its own. */
export const campaignSiteId = campaignPlausibleSite.siteId

/** The Plausible site of a Team, which a campaign page reports to as well. */
export function teamSiteId(teamId: string): string {
  return `api-journeys-team-${teamId}`
}

/**
 * The campaign site's goals: every campaign event, plus the outbound clicks
 * the public page's script reports (`trackOutboundLinks`).
 */
export const campaignGoals: Array<
  CampaignPlausibleEventName | 'Outbound Link: Click'
> = [
  ...(Object.keys(
    campaignPlausibleSite.events
  ) as CampaignPlausibleEventName[]),
  'Outbound Link: Click'
]

/**
 * The props the campaign site's dashboard breaks down by: every page and event
 * prop but `campaign_id`, which has one value on a campaign's own site.
 * Plausible stores every prop sent but shows only the ones a site allows.
 */
export const campaignAllowedProps: Array<
  Exclude<CampaignPlausibleProp, 'campaign_id'>
> = [
  ...new Set(
    [
      campaignPlausibleSite.pageProps,
      ...Object.values(campaignPlausibleSite.events)
    ].flatMap((specs) => Object.keys(specs))
  )
].filter(
  (prop): prop is Exclude<CampaignPlausibleProp, 'campaign_id'> =>
    prop !== 'campaign_id'
)
