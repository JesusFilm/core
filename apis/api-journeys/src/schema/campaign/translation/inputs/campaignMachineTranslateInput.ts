import { builder } from '../../../builder'
import { CampaignMachineTranslateMode } from '../../enums'

// Machine translation in code; the schema name `CampaignAiTranslateInput` is frozen for journeys-admin.
export const CampaignMachineTranslateInput = builder.inputType(
  'CampaignAiTranslateInput',
  {
    description:
      'One machine-translation run: the campaign, the campaign language to write into (never the default) and the mode.',
    fields: (t) => ({
      campaignId: t.id({ required: true }),
      languageId: t.id({ required: true }),
      mode: t.field({ type: CampaignMachineTranslateMode, required: true })
    })
  }
)
