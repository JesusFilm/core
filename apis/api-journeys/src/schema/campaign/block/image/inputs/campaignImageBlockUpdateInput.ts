import { builder } from '../../../../builder'
import { sectionStyleInputFields } from '../../sectionStyleInput'

export const CampaignImageBlockUpdateInput = builder.inputType(
  'CampaignImageBlockUpdateInput',
  {
    fields: (t) => ({
      src: t.string({
        required: false,
        description:
          'An https imagedelivery.net address; null clears the image. Width and height are re-measured by the server.'
      }),
      alt: t.string({
        required: false,
        description:
          'Default-language alternative text. At most 500 characters.'
      }),
      focalLeft: t.int({
        required: false,
        description:
          'The focal point as a percentage from the left edge, 0 to 100.'
      }),
      focalTop: t.int({
        required: false,
        description:
          'The focal point as a percentage from the top edge, 0 to 100.'
      }),
      ...sectionStyleInputFields(t)
    })
  }
)
