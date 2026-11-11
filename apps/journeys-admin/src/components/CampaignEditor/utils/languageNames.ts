import { GetCampaign_campaign_languages as CampaignLanguage } from '../../../../__generated__/GetCampaign'

/** Autonym first, the English name beside it when it differs. */
export function languageNames(
  language: Pick<CampaignLanguage, 'languageId' | 'language'>
): {
  autonym: string
  localName?: string
} {
  const names = language.language.name
  const autonym =
    names.find((name) => name.primary)?.value ??
    names[0]?.value ??
    language.languageId
  const localName = names.find((name) => !name.primary)?.value
  return {
    autonym,
    localName:
      localName != null && localName !== autonym ? localName : undefined
  }
}
