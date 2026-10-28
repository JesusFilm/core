import { builder } from '../../../builder'
import { TEXT_CAPS } from '../../validation'
import { CampaignRegionShareBlock } from '../campaignRegionShareBlock'
import { createSection } from '../createSection'
import { SECTION_CREATE_ERRORS } from '../inputs/sectionCreateInput'
import { validateSectionText } from '../validateSectionText'

import { CampaignRegionShareBlockCreateInput } from './inputs'

builder.mutationField('campaignRegionShareBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionShareBlock,
    nullable: false,
    description: `Add a region share section to the Region Page, last among its sections or at \`parentOrder\` with the later sections renumbered. It reads the region’s Share Languages, so the landing page refuses it.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`pageId\`): the landing page.\n- BAD_USER_INPUT (field: \`title\` / \`intro\`): over ${TEXT_CAPS.title} / ${TEXT_CAPS.intro} characters.`,
    args: {
      input: t.arg({
        type: CampaignRegionShareBlockCreateInput,
        required: true
      })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(input, 'CampaignRegionShareBlock', context.user, () =>
        validateSectionText(input, ['title', 'intro'])
      )
  })
)
