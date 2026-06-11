import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { QrCodeCreateInput } from './inputs'
import { QrCodeRef } from './qrCode'
import { INCLUDE_QR_CODE_ACL, canManageQrCode } from './qrCode.acl'
import { createShortLink, getShortLinkDomain, getTo } from './qrCode.service'

builder.mutationField('qrCodeCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: QrCodeRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        input: t.arg({ type: QrCodeCreateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { input } = args
        const shortLinkId = uuidv4()

        const to = await getTo({
          shortLinkId,
          teamId: String(input.teamId),
          toJourneyId: String(input.journeyId)
        })

        const hostname = getShortLinkDomain()

        return await prisma.$transaction(async (tx) => {
          const shortLinkResult = await createShortLink({
            id: shortLinkId,
            hostname,
            to,
            service: 'apiJourneys'
          })

          const qrCode = await tx.qrCode.create({
            data: {
              teamId: String(input.teamId),
              journeyId: String(input.journeyId),
              toJourneyId: String(input.journeyId),
              shortLinkId: shortLinkResult.id
            },
            include: INCLUDE_QR_CODE_ACL
          })

          if (!canManageQrCode(qrCode, context.user))
            throw new GraphQLError('User is not allowed to create the QrCode', {
              extensions: { code: 'FORBIDDEN' }
            })

          return tx.qrCode.findUniqueOrThrow({
            ...query,
            where: { id: qrCode.id }
          })
        })
      }
    })
)
