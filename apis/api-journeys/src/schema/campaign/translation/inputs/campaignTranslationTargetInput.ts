import { builder } from '../../../builder'

export const CampaignTranslationTargetInput = builder.inputType(
  'CampaignTranslationTargetInput',
  {
    description:
      'The row a translation belongs to: exactly one of a live Campaign Block, a Campaign Region, a Campaign String or the Campaign itself (its title).',
    fields: (t) => ({
      blockId: t.id({ required: false }),
      regionId: t.id({ required: false }),
      stringId: t.id({ required: false }),
      campaignId: t.id({ required: false })
    })
  }
)
