import { builder } from '../../../../builder'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignRegionShareBlockUpdateInput = builder.inputType(
  'CampaignRegionShareBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      intro: t.string({
        required: false,
        description: 'At most 500 characters.'
      }),
      ...sectionStyleInputFields(t)
    })
  }
)
