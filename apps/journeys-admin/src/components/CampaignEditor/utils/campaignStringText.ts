import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignStringKey } from '../../../../__generated__/globalTypes'

import { previewFieldText } from './useTranslatedField/readPreviewField'

/**
 * A Campaign String as the visitor reads it in the previewed language: its
 * translation there, else its default-language wording (`readTranslatedField`,
 * as the API's `resolveText` answers), else `fallback` (what the public
 * page shows for a row the campaign lacks or left blank).
 */
export function campaignStringText(
  campaign: Pick<Campaign, 'strings' | 'defaultLanguageId'>,
  key: CampaignStringKey,
  previewLanguageId: string,
  fallback: string
): string {
  const string = campaign.strings.find((candidate) => candidate.key === key)
  if (string == null) return fallback
  const text = previewFieldText({
    field: string.value,
    translations: string.valueTranslations,
    previewLanguageId,
    defaultLanguageId: campaign.defaultLanguageId
  })
  return text === '' ? fallback : text
}
