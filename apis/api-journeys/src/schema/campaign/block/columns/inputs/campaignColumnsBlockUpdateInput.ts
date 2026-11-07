import { builder } from '../../../../builder'
import { CampaignColumnsRatio } from '../../../enums'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignColumnsBlockUpdateInput = builder.inputType(
  'CampaignColumnsBlockUpdateInput',
  {
    fields: (t) => ({
      ratio: t.field({ type: CampaignColumnsRatio, required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)
