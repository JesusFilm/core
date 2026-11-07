import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { logger } from '../../logger'
import { builder } from '../builder'
import {
  queuePageSetChange,
  snapshotCampaignAddress
} from '../campaign/revalidateCampaign'

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
        include: { team: { include: { userTeams: true } } }
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

      const { campaignId } = customDomain
      const { before, after } = await prisma.$transaction(async (tx) => {
        const before =
          campaignId == null
            ? null
            : await snapshotCampaignAddress(tx, campaignId)
        await tx.customDomain.delete({ where: { id } })
        const after =
          campaignId == null
            ? null
            : await snapshotCampaignAddress(tx, campaignId)
        await deleteVercelDomain(customDomain.name)
        return { before, after }
      })

      // A Campaign Domain's pages stop resolving and the Campaign Address
      // is back on the Root Domain. It routed no team journey, so no short
      // link moves.
      if (campaignId != null) {
        await queuePageSetChange(before, after)
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
