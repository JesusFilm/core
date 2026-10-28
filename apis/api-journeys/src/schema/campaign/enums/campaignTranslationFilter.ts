import { builder } from '../../builder'

export const CAMPAIGN_TRANSLATION_FILTERS = [
  'all',
  'needsReview',
  'missing',
  'edited'
] as const

export type CampaignTranslationFilterValue =
  (typeof CAMPAIGN_TRANSLATION_FILTERS)[number]

export const CampaignTranslationFilter = builder.enumType(
  'CampaignTranslationFilter',
  {
    values: CAMPAIGN_TRANSLATION_FILTERS,
    description:
      'Which rows `campaignTranslations` returns: `all`; `needsReview` (written by the machine, which flagged the line as a guess a person should check); `missing` (no entry in the language); `edited` (written by a person).'
  }
)
