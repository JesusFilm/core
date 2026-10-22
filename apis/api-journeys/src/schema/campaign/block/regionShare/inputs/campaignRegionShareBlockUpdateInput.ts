import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignRegionShareBlockUpdateInput = builder.inputType(
  'CampaignRegionShareBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.title} characters.`
      }),
      intro: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.intro} characters.`
      }),
      ...sectionStyleInputFields(t)
    })
  }
)
