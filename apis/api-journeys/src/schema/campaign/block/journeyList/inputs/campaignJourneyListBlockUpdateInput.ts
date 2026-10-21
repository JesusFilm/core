import { builder } from '../../../../builder'
import { CampaignJourneyListDisplay } from '../../../enums'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignJourneyListBlockUpdateInput = builder.inputType(
  'CampaignJourneyListBlockUpdateInput',
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
      lede: t.string({
        required: false,
        description: 'At most 500 characters.'
      }),
      display: t.field({ type: CampaignJourneyListDisplay, required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)
