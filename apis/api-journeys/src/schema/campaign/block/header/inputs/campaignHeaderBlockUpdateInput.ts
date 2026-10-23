import { builder } from '../../../../builder'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignHeaderBlockUpdateInput = builder.inputType(
  'CampaignHeaderBlockUpdateInput',
  {
    description:
      'The header’s Section Background and colour overrides (the shared section fields) and its logo slot.',
    fields: (t) => ({
      ...sectionStyleInputFields(t),
      logoBlockId: t.id({
        required: false,
        description:
          'The owned CampaignImageBlock shown as the Brand Mark; null clears the logo so the campaign title shows instead. Usually set by campaignImageBlockCreate with slot logo.'
      })
    })
  }
)
