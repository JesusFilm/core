import { builder } from '../../builder'

export const CampaignTranslationFilter = builder.enumType(
  'CampaignTranslationFilter',
  {
    values: ['all', 'needsReview', 'missing', 'edited'] as const,
    description:
      'Which rows `campaignTranslations` returns: `all`; `needsReview` (written by the machine, which flagged the line as a guess a person should check); `missing` (no entry in the language); `edited` (written by a person).'
  }
)
