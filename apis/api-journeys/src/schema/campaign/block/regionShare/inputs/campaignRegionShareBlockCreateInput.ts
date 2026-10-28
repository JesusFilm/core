import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import {
  REGION_PAGE_ID_DESCRIPTION,
  sectionCreateInputFields
} from '../../inputs/sectionCreateInput'

export const CampaignRegionShareBlockCreateInput = builder.inputType(
  'CampaignRegionShareBlockCreateInput',
  {
    fields: (t) => ({
      ...sectionCreateInputFields(t, { pageId: REGION_PAGE_ID_DESCRIPTION }),
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.title} characters.`
      }),
      intro: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.intro} characters.`
      })
    })
  }
)
