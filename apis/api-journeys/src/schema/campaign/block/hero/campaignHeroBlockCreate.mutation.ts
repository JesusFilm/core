import { builder } from '../../../builder'
import { CAMPAIGN_ALIGNS } from '../../enums'
import { assertEnumOrNull } from '../../validation'
import { CampaignHeroBlock } from '../campaignHeroBlock'
import { createSection } from '../createSection'
import { SECTION_CREATE_ERRORS } from '../inputs/sectionCreateInput'
import { validateSectionText } from '../validateSectionText'

import { CampaignHeroBlockCreateInput } from './inputs'

builder.mutationField('campaignHeroBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignHeroBlock,
    nullable: false,
    description: `Add a hero section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. Text is empty when omitted.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`description\` / \`align\`): the value fails its rule.`,
    args: {
      input: t.arg({ type: CampaignHeroBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(input, 'CampaignHeroBlock', context.user, () => ({
        ...validateSectionText('CampaignHeroBlock', input),
        align: assertEnumOrNull(input.align, 'align', CAMPAIGN_ALIGNS)
      }))
  })
)
