import { builder } from '../../../builder'
import { CampaignAiTranslateMode } from '../../enums'

export const CampaignAiTranslateInput = builder.inputType(
  'CampaignAiTranslateInput',
  {
    description:
      'One machine-translation run: the campaign, the campaign language to write into (never the default) and the mode.',
    fields: (t) => ({
      campaignId: t.id({ required: true }),
      languageId: t.id({ required: true }),
      mode: t.field({ type: CampaignAiTranslateMode, required: true })
    })
  }
)
