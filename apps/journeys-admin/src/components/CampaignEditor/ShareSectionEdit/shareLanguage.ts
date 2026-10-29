import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../../__generated__/GetCampaign'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { languageNames } from '../LanguagesPanel'

/** The editor label of a Share Language: autonym plus local name when they differ. */
export function regionLanguageLabel(
  regionLanguage: Pick<CampaignRegionLanguage, 'languageId' | 'language'>
): string {
  const { autonym, localName } = languageNames(regionLanguage)
  return localName != null ? `${autonym} (${localName})` : autonym
}

/** The three states a Share Language can be in on the canvas. */
export type ShareLanguageState = 'live' | 'unpublished' | 'unlinked'

export function shareLanguageState(
  regionLanguage: Pick<CampaignRegionLanguage, 'journeyId' | 'journey'>
): ShareLanguageState {
  if (regionLanguage.journeyId == null) return 'unlinked'
  return regionLanguage.journey?.status === JourneyStatus.published
    ? 'live'
    : 'unpublished'
}
