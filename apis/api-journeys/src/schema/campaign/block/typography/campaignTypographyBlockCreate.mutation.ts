import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { badUserInput } from '../../validation'
import { CampaignTypographyBlock } from '../campaignTypographyBlock'
import {
  assertPlacement,
  authorizeBlockCreate,
  createChildBlock,
  createRegionLine,
  validateParentBlock,
  validateRegion
} from '../service'

import { CampaignTypographyBlockCreateInput } from './inputs'
import { validateTypographyInput } from './validateTypographyInput'

builder.mutationField('campaignTypographyBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignTypographyBlock,
    nullable: false,
    description:
      'Add a text block: with `parentBlockId`, a text Extra of a section or chrome block, landing last among its siblings (`parentOrder = siblings.length`) on the side the placement names and copying the parent’s page or region scoping down; with `regionId`, a Region Line, scoped to the region alone (`pageId`, `parentBlockId` and `placement` null) and appended last among the region’s lines. Omitted content is empty; the editor shows the placeholder "Your text".\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign, or neither / both of parentBlockId and regionId given.\n- BAD_USER_INPUT (field: `regionId`): not a region of this campaign.\n- BAD_USER_INPUT (field: `content`, `variant`, `align`, `color`, `placement`): the value fails its rule; placement is refused on a Region Line.',
    args: {
      input: t.arg({ type: CampaignTypographyBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      const campaignId = String(input.campaignId)
      await authorizeBlockCreate(campaignId, context.user)
      if ((input.parentBlockId == null) === (input.regionId == null))
        throw badUserInput(
          'a text block takes exactly one of parentBlockId and regionId',
          'parentBlockId'
        )
      const data = validateTypographyInput({
        ...input,
        content: input.content ?? ''
      })
      const id = input.id != null ? String(input.id) : undefined

      if (input.regionId != null) {
        if (input.placement != null)
          throw badUserInput(
            'placement applies to section children only',
            'placement'
          )
        const region = await validateRegion(String(input.regionId), campaignId)
        return await prisma.$transaction(
          async (tx) =>
            await createRegionLine(tx, region, {
              id,
              typename: 'CampaignTypographyBlock',
              ...data
            })
        )
      }

      const parent = await validateParentBlock(
        String(input.parentBlockId),
        campaignId,
        'CampaignTypographyBlock'
      )
      const placement = assertPlacement(input.placement)

      return await prisma.$transaction(
        async (tx) =>
          await createChildBlock(tx, parent, {
            id,
            typename: 'CampaignTypographyBlock',
            ...data,
            placement
          })
      )
    }
  })
)
