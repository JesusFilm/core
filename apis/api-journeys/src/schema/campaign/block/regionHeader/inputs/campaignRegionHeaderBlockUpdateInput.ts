import { builder } from '../../../../builder'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignRegionHeaderBlockUpdateInput = builder.inputType(
  'CampaignRegionHeaderBlockUpdateInput',
  {
    fields: (t) => ({
      intro: t.string({
        required: false,
        description: 'At most 500 characters.'
      }),
      ...sectionStyleInputFields(t)
    })
  }
)
