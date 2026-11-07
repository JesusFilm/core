import { builder } from '../../builder'

export const CAMPAIGN_TRANSLATION_GROUPS = [
  'interface',
  'landing',
  'region',
  'regions'
] as const

export type CampaignTranslationGroupValue =
  (typeof CAMPAIGN_TRANSLATION_GROUPS)[number]

export const CampaignTranslationGroup = builder.enumType(
  'CampaignTranslationGroup',
  {
    values: CAMPAIGN_TRANSLATION_GROUPS,
    description:
      'The Translations view section a row belongs to: `interface` (Campaign Strings, header and footer text, the campaign title), `landing` (landing page sections), `region` (Region Page sections) or `regions` (each Campaign Region’s name and Region Lines).'
  }
)
