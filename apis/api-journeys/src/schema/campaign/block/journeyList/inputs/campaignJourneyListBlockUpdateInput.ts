import { builder } from '../../../../builder'
import { CampaignJourneyListDisplay } from '../../../enums'
import { TEXT_CAPS } from '../../../validation'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignJourneyListBlockUpdateInput = builder.inputType(
  'CampaignJourneyListBlockUpdateInput',
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
      description: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.description} characters.`
      }),
      display: t.field({ type: CampaignJourneyListDisplay, required: false }),
      ...sectionStyleInputFields(t)
    })
  }
)
