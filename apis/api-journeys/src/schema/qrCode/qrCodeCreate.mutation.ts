import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { badUserInput } from '../campaign/errors'

import { QrCodeCreateInput } from './inputs'
import { QrCodeRef } from './qrCode'
import { canManageQrCode } from './qrCode.acl'
import { createShortLink, getShortLinkDomain, getTo } from './qrCode.service'

builder.mutationField('qrCodeCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: QrCodeRef,
      nullable: false,
      args: {
        input: t.arg({ type: QrCodeCreateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { input } = args

        const journey = await prisma.journey.findUnique({
          where: { id: String(input.journeyId) },
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        })

        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!canManageQrCode({ journey, team: journey.team }, context.user))
          throw new GraphQLError('User is not allowed to create the QrCode', {
            extensions: { code: 'FORBIDDEN' }
          })

        if (String(input.teamId) !== journey.teamId)
          throw badUserInput("teamId must be the journey's team", 'teamId')

        const shortLinkId = uuidv4()

        const to = await getTo({
          shortLinkId,
          toJourneyId: journey.id
        })

        const hostname = getShortLinkDomain()

        return await prisma.$transaction(async (tx) => {
          const shortLinkResult = await createShortLink({
            id: shortLinkId,
            hostname,
            to,
            service: 'apiJourneys'
          })

          return tx.qrCode.create({
            ...query,
            data: {
              teamId: journey.teamId,
              journeyId: journey.id,
              toJourneyId: journey.id,
              shortLinkId: shortLinkResult.id
            }
          })
        })
      }
    })
)
