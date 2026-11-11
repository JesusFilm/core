import { TypographyAlign } from '../../../../block/typography/enums/typographyAlign'
import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import { sectionCreateInputFields } from '../../inputs/sectionCreateInput'

export const CampaignHeroBlockCreateInput = builder.inputType(
  'CampaignHeroBlockCreateInput',
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
      align: t.field({ type: TypographyAlign, required: false })
    })
  }
)
