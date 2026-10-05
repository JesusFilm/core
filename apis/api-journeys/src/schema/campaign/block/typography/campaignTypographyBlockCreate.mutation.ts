import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { CampaignTypographyBlock } from '../campaignTypographyBlock'
import {
  assertPlacement,
  authorizeBlockCreate,
  createChildBlock,
  validateParentBlock
} from '../service'

import { CampaignTypographyBlockCreateInput } from './inputs'
import { validateTypographyInput } from './validateTypographyInput'

builder.mutationField('campaignTypographyBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignTypographyBlock,
    nullable: false,
    description:
      'Add a text Extra to a section or chrome block. A new Extra lands last among its siblings (`parentOrder = siblings.length`) on the side the placement names, and copies the parent’s page or region scoping down. Omitted content is empty; the editor shows the placeholder "Your text".\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign.\n- BAD_USER_INPUT (field: `content`, `variant`, `align`, `color`, `placement`): the value fails its rule.',
    args: {
      input: t.arg({ type: CampaignTypographyBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      const campaignId = String(input.campaignId)
      await authorizeBlockCreate(campaignId, context.user)
      const parent = await validateParentBlock(
        String(input.parentBlockId),
        campaignId,
        'CampaignTypographyBlock'
      )
      const data = validateTypographyInput({
        ...input,
        content: input.content ?? ''
      })
      const placement = assertPlacement(input.placement)

      return await prisma.$transaction(
        async (tx) =>
          await createChildBlock(tx, parent, {
            id: input.id != null ? String(input.id) : undefined,
            typename: 'CampaignTypographyBlock',
            ...data,
            placement
          })
      )
    }
  })
)
