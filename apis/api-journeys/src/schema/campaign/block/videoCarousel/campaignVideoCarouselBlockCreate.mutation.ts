import { builder } from '../../../builder'
import { TEXT_CAPS } from '../../validation'
import { CampaignVideoCarouselBlock } from '../campaignVideoCarouselBlock'
import { createSection } from '../createSection'
import { SECTION_CREATE_ERRORS } from '../inputs/sectionCreateInput'
import { validateSectionText } from '../validateSectionText'

import { CampaignVideoCarouselBlockCreateInput } from './inputs'

builder.mutationField('campaignVideoCarouselBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignVideoCarouselBlock,
    nullable: false,
    description: `Add a video carousel section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. It starts with no video and no items.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\`): over ${TEXT_CAPS.eyebrow} / ${TEXT_CAPS.title} characters.`,
    args: {
      input: t.arg({
        type: CampaignVideoCarouselBlockCreateInput,
        required: true
      })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(
        input,
        'CampaignVideoCarouselBlock',
        context.user,
        () => validateSectionText('CampaignVideoCarouselBlock', input)
      )
  })
)
