import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignAnalyticsBlockUpdateInput = builder.inputType(
  'CampaignAnalyticsBlockUpdateInput',
  {
    fields: (t) => ({
      eyebrow: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.eyebrow} characters.`
      }),
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.title} characters.`
      }),
      showMap: t.boolean({ required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)
