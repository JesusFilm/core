import { builder } from '../../../builder'
import { CampaignTextField } from '../../enums'

import { CampaignTranslationTargetInput } from './campaignTranslationTargetInput'

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
