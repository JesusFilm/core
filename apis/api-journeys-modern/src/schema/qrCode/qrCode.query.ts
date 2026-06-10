import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { QrCodeRef } from './qrCode'

builder.queryField('qrCode', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: QrCodeRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args) => {
        return prisma.qrCode.findUniqueOrThrow({
          ...query,
          where: { id: String(args.id) }
        })
      }
    })
)
