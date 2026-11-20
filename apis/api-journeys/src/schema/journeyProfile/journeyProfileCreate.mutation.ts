import { prisma } from '@core/prisma/journeys/client'

import { capturePermissionEffect } from '../../lib/mcpPermissionEffects'
import { syncMailChimp } from '../../lib/syncMailChimp'
import { builder } from '../builder'
import { logger } from '../logger'

import { JourneyProfileRef } from './journeyProfile'

builder.mutationField('journeyProfileCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyProfileRef,
      nullable: false,
      resolve: async (query, _parent, _args, context) => {
        const existing = await prisma.journeyProfile.findUnique({
          where: { userId: context.user.id }
        })

        if (existing != null) {
          return prisma.journeyProfile.findUniqueOrThrow({
            ...query,
            where: { id: existing.id }
          })
        }

        const created = await prisma.journeyProfile.create({
          ...query,
          data: {
            userId: context.user.id,
            acceptedTermsAt: new Date()
          }
        })

        const user = {
          email: context.user.email,
          firstName: context.user.firstName,
          lastName: context.user.lastName
        }
        if (!capturePermissionEffect({ type: 'mailchimpSubscription', user }))
          void syncMailChimp(user).catch((err) =>
            logger.error(err, 'failed to sync user to MailChimp')
          )

        return created
      }
    })
)
