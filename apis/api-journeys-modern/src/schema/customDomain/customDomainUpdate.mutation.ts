import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { CustomDomainRef } from './customDomain'
import { canAccessCustomDomain } from './customDomain.acl'
import { CustomDomainUpdateInput } from './inputs'

builder.mutationField('customDomainUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: CustomDomainRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CustomDomainUpdateInput, required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const { id, input } = args

      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })

      if (customDomain == null) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessCustomDomain(Action.Update, customDomain, context.user)) {
        throw new GraphQLError('user is not allowed to update custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.customDomain.update({
        ...query,
        where: { id },
        data: {
          routeAllTeamJourneys: input.routeAllTeamJourneys ?? undefined,
          journeyCollection:
            input.journeyCollectionId != null
              ? { connect: { id: input.journeyCollectionId } }
              : undefined
        }
      })
    }
  })
)
