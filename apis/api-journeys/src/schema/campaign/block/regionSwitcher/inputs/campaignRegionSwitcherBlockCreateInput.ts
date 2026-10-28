import { builder } from '../../../../builder'
import { CampaignSwitcherVariant } from '../../../enums'
import { TEXT_CAPS } from '../../../validation'
import { sectionCreateInputFields } from '../../inputs/sectionCreateInput'

export const CampaignRegionSwitcherBlockCreateInput = builder.inputType(
  'CampaignRegionSwitcherBlockCreateInput',
  {
    fields: (t) => ({
      ...sectionCreateInputFields(t),
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.title} characters.`
      }),
      variant: t.field({
        type: CampaignSwitcherVariant,
        required: false,
        description: 'Defaults to cards.'
      })
    })
  }
)
