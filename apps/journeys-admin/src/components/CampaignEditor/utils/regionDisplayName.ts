import { GetCampaign_campaign_regions as CampaignRegion } from '../../../../__generated__/GetCampaign'

import { previewFieldText } from './useTranslatedField/readPreviewField'

/**
 * The region's name in the language being previewed: that language's
 * translation, or the default name where there is none, as the public page
 * shows it.
 */
export function regionDisplayName(
  region: Pick<CampaignRegion, 'name' | 'nameTranslations'>,
  previewLanguageId: string,
  defaultLanguageId: string
): string {
  return previewFieldText({
    field: region.name,
    translations: region.nameTranslations,
    previewLanguageId,
    defaultLanguageId
  })
}
