import { builder } from '../../builder'

export const CampaignTranslationFilter = builder.enumType(
  'CampaignTranslationFilter',
  {
    values: ['all', 'needsReview', 'missing', 'edited'] as const,
    description:
      'Which rows `campaignTranslations` returns: `all`; `needsReview` (written by the machine, not yet touched by a person); `missing` (no entry in the language); `edited` (written by a person).'
  }
)
