import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { badUserInput } from '../validation'

import { authorizeRegionLanguageUpdate, moveRegionLanguage } from './service'

builder.mutationField('campaignRegionLanguageOrderUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignRegionLanguageRef],
    nullable: false,
    description:
      'Move a Share Language to `order` among its region’s languages (a position past the end moves it last) and renumber them contiguously; the public Share selector follows this order. Returns every Share Language of the region with its new `order`.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `order`): negative.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      order: t.arg({ type: 'Int', required: true })
    },
    resolve: async (_parent, { id, order }, context) => {
      const regionLanguage = await authorizeRegionLanguageUpdate(
        String(id),
        context.user
      )
      if (order < 0) throw badUserInput('order must be zero or more', 'order')
      const { region, qrCode: _qrCode, ...row } = regionLanguage
      return await prisma.$transaction(
        async (tx) =>
          await moveRegionLanguage(tx, row, region.campaignId, order)
      )
    }
  })
)
