import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignRegionHeaderBlockUpdateInput = builder.inputType(
  'CampaignRegionHeaderBlockUpdateInput',
  {
    fields: (t) => ({
      intro: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.intro} characters.`
      }),
      ...sectionStyleInputFields(t)
    })
  }
)
