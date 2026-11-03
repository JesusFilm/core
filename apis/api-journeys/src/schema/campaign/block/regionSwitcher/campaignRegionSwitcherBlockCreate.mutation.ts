import { builder } from '../../../builder'
import { CAMPAIGN_SWITCHER_VARIANTS } from '../../enums'
import { assertEnum } from '../../validation'
import { CampaignRegionSwitcherBlock } from '../campaignRegionSwitcherBlock'
import { createSection } from '../createSection'
import { SECTION_CREATE_ERRORS } from '../inputs/sectionCreateInput'
import { validateSectionText } from '../validateSectionText'

import { CampaignRegionSwitcherBlockCreateInput } from './inputs'

builder.mutationField('campaignRegionSwitcherBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionSwitcherBlock,
    nullable: false,
    description: `Add a region switcher section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. It reads the campaign’s listed regions; nothing is stored but the title and variant.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`title\` / \`variant\`): the value fails its rule.`,
    args: {
      input: t.arg({
        type: CampaignRegionSwitcherBlockCreateInput,
        required: true
      })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(
        input,
        'CampaignRegionSwitcherBlock',
        context.user,
        () => ({
          ...validateSectionText('CampaignRegionSwitcherBlock', input),
          ...(input.variant != null && {
            switcherVariant: assertEnum(
              input.variant,
              'variant',
              CAMPAIGN_SWITCHER_VARIANTS
            )
          })
        })
      )
  })
)
