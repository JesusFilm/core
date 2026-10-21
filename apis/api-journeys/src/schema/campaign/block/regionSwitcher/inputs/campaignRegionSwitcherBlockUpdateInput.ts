import { builder } from '../../../../builder'
import { CampaignSwitcherVariant } from '../../../enums'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignRegionSwitcherBlockUpdateInput = builder.inputType(
  'CampaignRegionSwitcherBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      variant: t.field({ type: CampaignSwitcherVariant, required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)
