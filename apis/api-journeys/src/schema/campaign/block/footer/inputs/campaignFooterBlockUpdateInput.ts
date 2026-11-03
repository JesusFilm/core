import { builder } from '../../../../builder'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignFooterBlockUpdateInput = builder.inputType(
  'CampaignFooterBlockUpdateInput',
  {
    description:
      'The footer’s Section Background and colour overrides: the shared section fields and nothing else.',
    fields: (t) => ({
      ...sectionStyleInputFields(t)
    })
  }
)
