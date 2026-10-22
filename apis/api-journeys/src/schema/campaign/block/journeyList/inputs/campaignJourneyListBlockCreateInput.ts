import { builder } from '../../../../builder'
import { CampaignJourneyListDisplay } from '../../../enums'
import { TEXT_CAPS } from '../../../validation'
import { sectionCreateInputFields } from '../../inputs/sectionCreateInput'

export const CampaignJourneyListBlockCreateInput = builder.inputType(
  'CampaignJourneyListBlockCreateInput',
  {
    fields: (t) => ({
      ...sectionCreateInputFields(t),
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
      display: t.field({
        type: CampaignJourneyListDisplay,
        required: false,
        description: 'Defaults to grid.'
      })
    })
  }
)
