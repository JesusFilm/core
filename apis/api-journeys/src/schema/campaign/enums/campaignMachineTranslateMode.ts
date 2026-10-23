import { builder } from '../../builder'

export const CAMPAIGN_MACHINE_TRANSLATE_MODES = ['all', 'missing'] as const

export type CampaignMachineTranslateModeValue =
  (typeof CAMPAIGN_MACHINE_TRANSLATE_MODES)[number]

export const CampaignMachineTranslateMode = builder.enumType(
  'CampaignAiTranslateMode',
  {
    values: CAMPAIGN_MACHINE_TRANSLATE_MODES,
    description:
      'What a machine-translation run writes: `missing` fills only the texts the language has no entry for; `all` also replaces the machine’s earlier translations. A person’s are never replaced.'
  }
)
