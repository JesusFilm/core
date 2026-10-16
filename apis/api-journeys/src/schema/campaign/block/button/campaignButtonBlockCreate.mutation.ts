import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { CampaignButtonBlock } from '../campaignButtonBlock'
import {
  assertPlacement,
  authorizeBlockCreate,
  createChildBlock,
  validateParentBlock
} from '../service'

import { CampaignButtonBlockCreateInput } from './inputs'
import { NEW_BUTTON_LABEL, validateButtonInput } from './validateButtonInput'

builder.mutationField('campaignButtonBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignButtonBlock,
    nullable: false,
    description:
      'Add a button Extra to a section or chrome block, with no action. A new Extra lands last among its siblings (`parentOrder = siblings.length`) on the side the placement names, and copies the parent’s page or region scoping down. An omitted label is "Button".\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign.\n- BAD_USER_INPUT (field: `label`, `variant`, `size`, `align`, `color`, `labelColor`, `placement`): the value fails its rule.',
    args: {
      input: t.arg({ type: CampaignButtonBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      const campaignId = String(input.campaignId)
      await authorizeBlockCreate(campaignId, context.user)
      const parent = await validateParentBlock(
        String(input.parentBlockId),
        campaignId,
        'CampaignButtonBlock'
      )
      const data = validateButtonInput({
        ...input,
        label: input.label ?? NEW_BUTTON_LABEL
      })
      const placement = assertPlacement(input.placement)

      return await prisma.$transaction(
        async (tx) =>
          await createChildBlock(tx, parent, {
            id: input.id != null ? String(input.id) : undefined,
            typename: 'CampaignButtonBlock',
            ...data,
            placement
          })
      )
    }
  })
)
