import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { QrCodesFilter } from './inputs'
import { QrCodeRef } from './qrCode'

builder.queryField('qrCodes', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [QrCodeRef],
      nullable: false,
      args: {
        where: t.arg({ type: QrCodesFilter, required: true })
      },
      resolve: async (query, _parent, args) => {
        // A Campaign QR Code is not a journey QR Code, wherever its journey points.
        const filter: Prisma.QrCodeWhereInput = {
          campaignRegionLanguages: { none: {} }
        }
        if (args.where.journeyId)
          filter.journeyId = String(args.where.journeyId)
        if (args.where.teamId) filter.teamId = String(args.where.teamId)

        return prisma.qrCode.findMany({
          ...query,
          where: filter
        })
      }
    })
)
