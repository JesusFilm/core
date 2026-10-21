import { builder } from '../../../builder'
import { CampaignRegionShareBlock } from '../campaignRegionShareBlock'
import { SECTION_CREATE_ERRORS, createSection } from '../createSection'
import { validateSectionText } from '../validateSectionText'

import { CampaignRegionShareBlockCreateInput } from './inputs'

builder.mutationField('campaignRegionShareBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionShareBlock,
    nullable: false,
    description: `Add a region share section to the Region Page, last among its sections or at \`parentOrder\` with the later sections renumbered. It reads the region’s Share Languages, so the landing page refuses it.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`pageId\`): the landing page.\n- BAD_USER_INPUT (field: \`title\` / \`intro\`): over 150 / 500 characters.`,
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
