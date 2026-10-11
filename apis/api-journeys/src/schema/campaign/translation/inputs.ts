import { builder } from '../../builder'

import { CampaignTextField } from './campaignTextField'

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

export const CampaignTranslationSetInput = builder.inputType(
  'CampaignTranslationSetInput',
  {
    description:
      'One translation write: the target row, which of its Translated Fields, the campaign language (never the default) and the wording. An empty value clears the entry.',
    fields: (t) => ({
      target: t.field({ type: CampaignTranslationTargetInput, required: true }),
      field: t.field({ type: CampaignTextField, required: true }),
      languageId: t.id({ required: true }),
      value: t.string({ required: true })
    })
  }
)
