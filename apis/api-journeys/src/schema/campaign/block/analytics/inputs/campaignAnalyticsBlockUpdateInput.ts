import { builder } from '../../../../builder'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignAnalyticsBlockUpdateInput = builder.inputType(
  'CampaignAnalyticsBlockUpdateInput',
  {
    fields: (t) => ({
      eyebrow: t.string({
        required: false,
        description: 'At most 80 characters.'
      }),
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      showMap: t.boolean({ required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)
