import { TFunction } from 'i18next'

import { CampaignStringKey } from '../../../__generated__/globalTypes'

/**
 * The English wording of the eighteen Campaign Strings, written as `t()` calls
 * so extraction puts each one in the libs-journeys-ui bundle. The API seeds a
 * new campaign by looking these English strings up in the campaign language's
 * bundle (apis/api-journeys/src/schema/campaign/seed/campaignLocale.ts), so
 * keep the wording identical to CAMPAIGN_STRING_DEFAULTS there.
 */
export function getCampaignStringDefaults(
  t: TFunction
): Record<CampaignStringKey, string> {
  return {
    [CampaignStringKey.allRegions]: t('All regions'),
    [CampaignStringKey.step1]: t('Pick a language your friend understands.'),
    [CampaignStringKey.step2]: t('Preview what they will see.'),
    [CampaignStringKey.step2help]: t(
      'Tap through the preview like they would.'
    ),
    [CampaignStringKey.step3]: t('Share this link with them.'),
    [CampaignStringKey.step4]: t('Or download a QR code for print.'),
    [CampaignStringKey.copy]: t('Copy link'),
    [CampaignStringKey.copied]: t('Link copied'),
    [CampaignStringKey.downloadQr]: t('Download QR code'),
    [CampaignStringKey.open]: t('Open'),
    [CampaignStringKey.watch]: t('Watch'),
    [CampaignStringKey.openTemplate]: t('Open journey'),
    [CampaignStringKey.youtube]: t('Watch on YouTube'),
    [CampaignStringKey.totalVisitors]: t('Total visitors'),
    [CampaignStringKey.topCountry]: t('Top country'),
    [CampaignStringKey.seeAllOnWatch]: t('See all on Watch'),
    [CampaignStringKey.videos]: t('videos'),
    [CampaignStringKey.noJourneys]: t(
      'Journeys for this region are coming soon'
    )
  }
}
