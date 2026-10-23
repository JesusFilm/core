import { builder } from '../../../../builder'
import { CampaignMediaSide } from '../../../enums'
import { TEXT_CAPS } from '../../../validation'
import { sectionCreateInputFields } from '../../inputs/sectionCreateInput'

export const CampaignFeaturedMediaBlockCreateInput = builder.inputType(
  'CampaignFeaturedMediaBlockCreateInput',
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
      bullets: t.string({
        required: false,
        description: `One bullet per line; at most ${TEXT_CAPS.bullets} characters.`
      }),
      mediaSide: t.field({
        type: CampaignMediaSide,
        required: false,
        description: 'Defaults to `right`.'
      })
    })
  }
)
