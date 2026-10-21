import { builder } from '../../builder'

export const CampaignTranslationGroup = builder.enumType(
  'CampaignTranslationGroup',
  {
    values: ['interface', 'landing', 'region', 'regions'] as const,
    description:
      'The Translations view section a row belongs to: `interface` (Campaign Strings, header and footer text, the campaign title), `landing` (landing page sections), `region` (Region Page sections) or `regions` (each Campaign Region’s name and Region Lines).'
  }
)
