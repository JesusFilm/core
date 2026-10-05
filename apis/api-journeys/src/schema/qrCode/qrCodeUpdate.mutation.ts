import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { QrCodeUpdateInput } from './inputs'
import { QrCodeRef } from './qrCode'
import { INCLUDE_QR_CODE_ACL, canManageQrCode } from './qrCode.acl'
import { getTo, parseAndVerifyTo, updateShortLink } from './qrCode.service'

builder.mutationField('qrCodeUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: QrCodeRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: QrCodeUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { id, input } = args

        const qrCode = await prisma.qrCode.findUniqueOrThrow({
          where: { id: String(id) },
          include: INCLUDE_QR_CODE_ACL
        })

        if (!canManageQrCode(qrCode, context.user))
          throw new GraphQLError('User is not allowed to update the QrCode', {
            extensions: { code: 'FORBIDDEN' }
          })

        const updateData: {
          toJourneyId?: string
          toBlockId?: string | null
          color?: string
          backgroundColor?: string
        } = {}

        if (input.color != null) updateData.color = input.color
        if (input.backgroundColor != null)
          updateData.backgroundColor = input.backgroundColor

        return await prisma.$transaction(async (tx) => {
          if (input.to != null) {
            const { toJourneyId, toBlockId } = await parseAndVerifyTo(
              qrCode,
              input.to
            )
            const to = await getTo({
              shortLinkId: qrCode.shortLinkId,
              teamId: qrCode.teamId,
              toJourneyId: toJourneyId ?? qrCode.toJourneyId,
              toBlockId
            })
            await updateShortLink({ id: qrCode.shortLinkId, to })

            if (toJourneyId != null) updateData.toJourneyId = toJourneyId
            if (toBlockId != null) updateData.toBlockId = toBlockId
          }

          return tx.qrCode.update({
            ...query,
            where: { id: String(id) },
            data: updateData
          })
        })
      }
    })
)
