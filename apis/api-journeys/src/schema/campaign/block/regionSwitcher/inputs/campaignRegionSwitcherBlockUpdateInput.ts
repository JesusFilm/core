import { builder } from '../../../../builder'
import { CampaignSwitcherVariant } from '../../../enums'
import { TEXT_CAPS } from '../../../validation'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignRegionSwitcherBlockUpdateInput = builder.inputType(
  'CampaignRegionSwitcherBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.title} characters.`
      }),
      variant: t.field({ type: CampaignSwitcherVariant, required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)
