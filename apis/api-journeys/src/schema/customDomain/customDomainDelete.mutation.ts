import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { logger } from '../../logger'
import { builder } from '../builder'
import { enqueueCampaignDomainRevalidation } from '../campaign/revalidateCampaign'

import { CustomDomainRef } from './customDomain'
import { canAccessCustomDomain } from './customDomain.acl'
import { deleteVercelDomain, updateTeamShortLinks } from './service'

builder.mutationField('customDomainDelete', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: CustomDomainRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: {
          team: { include: { userTeams: true } },
          campaign: { include: { regions: true } }
        }
      })

      if (customDomain == null) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessCustomDomain(Action.Delete, customDomain, context.user)) {
        throw new GraphQLError('user is not allowed to delete custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      await prisma.$transaction(async (tx) => {
        await tx.customDomain.delete({ where: { id } })
        await deleteVercelDomain(customDomain.name)
      })

      // A Campaign Domain's pages stop resolving and the Campaign Address
      // is back on the Root Domain. It routed no team journey, so no short
      // link moves.
      if (customDomain.campaign != null) {
        await enqueueCampaignDomainRevalidation(
          [customDomain.campaign],
          customDomain.name
        )
        return customDomain
      }

      try {
        await updateTeamShortLinks(customDomain.teamId)
      } catch (error) {
        logger.error(
          { teamId: customDomain.teamId, error },
          'Failed to update team QR code short links'
        )
      }

      return customDomain
    }
  })
)
