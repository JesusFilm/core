import { CampaignSwitcherVariant as PrismaCampaignSwitcherVariant } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { CampaignSwitcherVariant } from '../../enums'
import { assertEnum } from '../../validation'
import { CampaignRegionSwitcherBlock } from '../campaignRegionSwitcherBlock'
import { SECTION_CREATE_ERRORS, createSection } from '../createSection'
import { validateSectionText } from '../validateSectionText'

const SWITCHER_VARIANTS = Object.values(PrismaCampaignSwitcherVariant)

export const CampaignRegionSwitcherBlockCreateInput = builder.inputType(
  'CampaignRegionSwitcherBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({ required: true, description: 'A page of the campaign.' }),
      parentOrder: t.int({
        required: false,
        description:
          'Position among the page’s sections; appended when omitted or past the end.'
      }),
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      variant: t.field({
        type: CampaignSwitcherVariant,
        required: false,
        description: 'Defaults to cards.'
      })
    })
  }
)

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
          ...validateSectionText(input, ['title']),
          switcherVariant: assertEnum(
            input.variant ?? 'cards',
            'variant',
            SWITCHER_VARIANTS
          )
        })
      )
  })
)
