import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { QrCodeRef } from './qrCode'
import { INCLUDE_QR_CODE_ACL, canManageQrCode } from './qrCode.acl'
import { deleteShortLink } from './qrCode.service'

builder.mutationField('qrCodeDelete', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: QrCodeRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const qrCode = await prisma.qrCode.findUniqueOrThrow({
          where: { id: String(args.id) },
          include: INCLUDE_QR_CODE_ACL
        })

        if (!canManageQrCode(qrCode, context.user))
          throw new GraphQLError('User is not allowed to delete the QrCode', {
            extensions: { code: 'FORBIDDEN' }
          })

        return await prisma.$transaction(async (tx) => {
          await deleteShortLink(qrCode.shortLinkId)
          return tx.qrCode.delete({
            ...query,
            where: { id: String(args.id) }
          })
        })
      }
    })
)
