import { TypographyAlign } from '../../../../block/typography/enums/typographyAlign'
import { builder } from '../../../../builder'
import { mediaSlotInputField } from '../../inputs/mediaSlotInput'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignHeroBlockUpdateInput = builder.inputType(
  'CampaignHeroBlockUpdateInput',
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
      description: t.string({
        required: false,
        description: 'At most 500 characters.'
      }),
      align: t.field({ type: TypographyAlign, required: false }),
      minHeight: t.int({
        required: false,
        description:
          'Minimum height as a percentage of the viewport height, 0 to 100; null for content height.'
      }),
      mediaBlockId: mediaSlotInputField(t),
      ...sectionStyleInputFields(t)
    })
  }
)
