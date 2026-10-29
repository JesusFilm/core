import type {
  CampaignPublic,
  CampaignRegion
} from '../../components/Campaign/types'

import type {
  CampaignPlausibleEventName,
  CampaignPlausibleEvents,
  CampaignPlausibleProps
} from './campaignPlausibleSite'

/** A language as campaign rows carry it; only its BCP 47 tag is ever sent. */
interface LanguageInput {
  bcp47?: string | null
}

/** A Share Language row: the language a share event is about. */
interface ShareLanguageInput {
  language: LanguageInput
}

/**
 * What a call site hands over for each campaign event: the domain objects the
 * click was about. The props sent are built from them here, so every event
 * follows the same rules.
 */
export interface CampaignEventInputs {
  campaignJourneyClick: {
    source: 'card' | 'share'
    journeyUrl?: string | null
    shareLanguage?: ShareLanguageInput | null
  }
  campaignRegionClick: { targetRegion: Pick<CampaignRegion, 'slug'> }
  campaignQrDownload: { shareLanguage: ShareLanguageInput }
  campaignShareLinkCopy: { shareLanguage: ShareLanguageInput }
}

/**
 * A language prop's value: its BCP 47 tag, or nothing. A language without a
 * tag is left out rather than sent as an internal id no reader can place.
 */
function languageTag(
  language: LanguageInput | null | undefined
): string | undefined {
  return language?.bcp47 ?? undefined
}

/** A journey's slug: the last path segment of its public address; nothing without an address. */
export function journeySlug(
  journeyUrl: string | null | undefined
): string | undefined {
  if (journeyUrl == null || journeyUrl === '') return undefined
  try {
    const segments = new URL(journeyUrl).pathname.split('/').filter(Boolean)
    return segments[segments.length - 1]
  } catch {
    return undefined
  }
}

/**
 * The props every view and event of a campaign page carries: the campaign, the
 * Region Page's slug (none on the landing page) and the Page Language's tag.
 */
export function campaignPlausibleProps(
  campaign: Pick<CampaignPublic, 'id' | 'language'>,
  region: Pick<CampaignRegion, 'slug'> | null
): CampaignPlausibleProps {
  const language = languageTag(campaign.language)
  return {
    campaign_id: campaign.id,
    ...(region != null ? { region: region.slug } : {}),
    ...(language != null ? { language } : {})
  }
}

function shareLanguageProps(
  shareLanguage: ShareLanguageInput | null | undefined
): { shareLanguage?: string } {
  const tag = languageTag(shareLanguage?.language)
  return tag != null ? { shareLanguage: tag } : {}
}

// One builder per event; an event added to the site without one here does
// not compile.
const eventProps: {
  [Event in CampaignPlausibleEventName]: (
    input: CampaignEventInputs[Event]
  ) => CampaignPlausibleEvents[Event]
} = {
  campaignJourneyClick: ({ source, journeyUrl, shareLanguage }) => {
    const journey = journeySlug(journeyUrl)
    return {
      ...(journey != null ? { journey } : {}),
      source,
      ...shareLanguageProps(shareLanguage)
    }
  },
  campaignRegionClick: ({ targetRegion }) => ({
    targetRegion: targetRegion.slug
  }),
  campaignQrDownload: ({ shareLanguage }) => shareLanguageProps(shareLanguage),
  campaignShareLinkCopy: ({ shareLanguage }) =>
    shareLanguageProps(shareLanguage)
}

/** A campaign event's own props, built from what its call site handed over. */
export function campaignEventProps<Event extends CampaignPlausibleEventName>(
  event: Event,
  input: CampaignEventInputs[Event]
): CampaignPlausibleEvents[Event] {
  // TypeScript cannot pair a mapped type's entry with its own key's input.
  const build = eventProps[event] as (
    input: CampaignEventInputs[Event]
  ) => CampaignPlausibleEvents[Event]
  return build(input)
}
