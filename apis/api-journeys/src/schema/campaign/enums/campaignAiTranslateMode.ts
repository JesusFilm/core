import { builder } from '../../builder'

export const CampaignAiTranslateMode = builder.enumType(
  'CampaignAiTranslateMode',
  {
    values: ['all', 'missing'] as const,
    description:
      'What a machine-translation run writes: `missing` fills only the texts the language has no entry for; `all` also replaces the machine’s earlier translations. A person’s are never replaced.'
  }
)
