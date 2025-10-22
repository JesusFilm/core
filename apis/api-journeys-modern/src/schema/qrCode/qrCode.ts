import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { QrCodeCreateInput, QrCodeUpdateInput, QrCodesFilter } from './inputs'
import {
  INCLUDE_QR_CODE_ACL,
  QrCode as QrCodeWithAcl,
  qrCodeAcl
} from './qrCode.acl'
import { QrCodeService } from './qrCode.service'

const ShortLink = builder
  .externalRef('ShortLink', builder.selection<{ id: string }>('id'))
  .implement({
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false })
    })
  })

export const QrCodeRef = builder.prismaObject('QrCode', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    toJourneyId: t.exposeString('toJourneyId'),
    color: t.exposeString('color', { nullable: true }),
    backgroundColor: t.exposeString('backgroundColor', { nullable: true }),
    team: t.relation('team', { nullable: true }),
    journey: t.relation('journey', { nullable: true }),
    shortLink: t.field({
      nullable: false,
      type: ShortLink,
      select: {
        shortLinkId: true
      },
      resolve: (qrCode) => ({ id: qrCode.shortLinkId })
    })
  })
})

async function fetchQrCodeWithAclIncludes(
  id: string
): Promise<QrCodeWithAcl | null> {
  return (await prisma.qrCode.findUnique({
    where: { id },
    include: INCLUDE_QR_CODE_ACL
  })) as QrCodeWithAcl | null
}

const qrCodeService = new QrCodeService()

builder.queryField('qrCode', (t) =>
  t.field({
    override: {
      from: 'api-journeys'
    },
    type: QrCodeRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args) => {
      const qrCode = await prisma.qrCode.findUnique({
        where: { id: args.id }
      })

      if (!qrCode) {
        throw new GraphQLError('QrCode not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      return qrCode
    }
  })
)

builder.queryField('qrCodes', (t) =>
  t.field({
    override: {
      from: 'api-journeys'
    },
    type: [QrCodeRef],
    nullable: false,
    args: {
      where: t.arg({ type: QrCodesFilter, required: true })
    },
    resolve: async (_parent, args) => {
      const { where } = args
      const filter: any = {}

      if (where.journeyId) filter.journeyId = where.journeyId
      if (where.teamId) filter.teamId = where.teamId

      return await prisma.qrCode.findMany({ where: filter })
    }
  })
)

// Mutations
builder.mutationField('qrCodeCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: QrCodeRef,
    nullable: false,
    args: {
      input: t.arg({ type: QrCodeCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const shortLinkId = uuidv4()

      return await prisma.$transaction(async (tx) => {
        if (process.env.JOURNEYS_SHORTLINK_DOMAIN == null) {
          throw new GraphQLError('Shortlink domain not added', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          })
        }

        const to = await qrCodeService.getTo({
          shortLinkId,
          teamId: input.teamId,
          toJourneyId: input.journeyId
        })

        const shortLinkCreate = await qrCodeService.createShortLink({
          id: shortLinkId,
          hostname: process.env.JOURNEYS_SHORTLINK_DOMAIN,
          to,
          service: 'apiJourneys'
        })

        if (!shortLinkCreate.data?.id) {
          throw new GraphQLError('Failed to create short link', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          })
        }

        const qrCode = (await tx.qrCode.create({
          data: {
            teamId: input.teamId,
            journeyId: input.journeyId,
            toJourneyId: input.journeyId,
            shortLinkId: shortLinkCreate.data.id
          },
          include: INCLUDE_QR_CODE_ACL
        })) as QrCodeWithAcl

        if (!qrCodeAcl(Action.Manage, qrCode, context.user)) {
          throw new GraphQLError('User is not allowed to create the QrCode', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        return qrCode
      })
    }
  })
)

builder.mutationField('qrCodeUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: QrCodeRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: QrCodeUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const qrCode = await fetchQrCodeWithAclIncludes(id)
      if (!qrCode) {
        throw new GraphQLError('QrCode not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!qrCodeAcl(Action.Manage, qrCode, context.user)) {
        throw new GraphQLError('User is not allowed to update the QrCode', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const updateInput = {
        ...omit(input, 'to'),
        toJourneyId: qrCode.toJourneyId,
        toBlockId: qrCode.toBlockId
      }

      return await prisma.$transaction(async (tx) => {
        if (input.to != null) {
          const { toJourneyId, toBlockId } =
            await qrCodeService.parseAndVerifyTo(qrCode, input.to)
          const to = await qrCodeService.getTo({
            shortLinkId: qrCode.shortLinkId,
            teamId: qrCode.teamId,
            toJourneyId: toJourneyId ?? qrCode.toJourneyId,
            toBlockId: toBlockId ?? undefined
          })
          await qrCodeService.updateShortLink({
            id: qrCode.shortLinkId,
            to
          })

          if (toJourneyId != null) updateInput.toJourneyId = toJourneyId
          if (toBlockId != null) updateInput.toBlockId = toBlockId
        }

        return await tx.qrCode.update({
          where: { id },
          data: updateInput
        })
      })
    }
  })
)

builder.mutationField('qrCodeDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: QrCodeRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const qrCode = await fetchQrCodeWithAclIncludes(id)
      if (!qrCode) {
        throw new GraphQLError('QrCode not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!qrCodeAcl(Action.Manage, qrCode, context.user)) {
        throw new GraphQLError('User is not allowed to delete the QrCode', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Delete the shortlink first
        await qrCodeService.deleteShortLink(qrCode.shortLinkId)

        // Then delete the QR code
        return await tx.qrCode.delete({
          where: { id }
        })
      })
    }
  })
)
