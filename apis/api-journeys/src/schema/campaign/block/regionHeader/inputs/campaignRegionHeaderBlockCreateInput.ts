import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import {
  REGION_PAGE_ID_DESCRIPTION,
  sectionCreateInputFields
} from '../../inputs/sectionCreateInput'

export const CampaignRegionHeaderBlockCreateInput = builder.inputType(
  'CampaignRegionHeaderBlockCreateInput',
  {
    fields: (t) => ({
      ...sectionCreateInputFields(t, { pageId: REGION_PAGE_ID_DESCRIPTION }),
      intro: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.intro} characters.`
      })
    })
  }
)
