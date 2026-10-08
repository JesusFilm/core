import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { CampaignRegionRef } from '../campaignRegion'
import { badUserInput } from '../validation'

import { authorizeRegionUpdate, moveRegion } from './service'

builder.mutationField('campaignRegionOrderUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignRegionRef],
    nullable: false,
    description:
      'Move a Campaign Region to `order` among the campaign’s regions (a position past the end moves it last) and renumber them contiguously. One order serves every Region Switcher. Returns every region of the campaign with its new `order`.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `order`): negative.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      order: t.arg({ type: 'Int', required: true })
    },
    resolve: async (_parent, { id, order }, context) => {
      const region = await authorizeRegionUpdate(String(id), context.user)
      if (order < 0) throw badUserInput('order must be zero or more', 'order')
      const { campaign: _campaign, ...row } = region
      return await prisma.$transaction(
        async (tx) => await moveRegion(tx, row, order)
      )
    }
  })
)
