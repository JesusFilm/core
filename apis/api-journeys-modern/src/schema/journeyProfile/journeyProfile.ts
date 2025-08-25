import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyProfileUpdateInput } from './inputs'

export const JourneyProfileRef = builder.prismaObject('JourneyProfile', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    acceptedTermsAt: t.expose('acceptedTermsAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastActiveTeamId: t.exposeString('lastActiveTeamId', { nullable: true }),
    journeyFlowBackButtonClicked: t.exposeBoolean(
      'journeyFlowBackButtonClicked',
      { nullable: true }
    ),
    plausibleJourneyFlowViewed: t.exposeBoolean('plausibleJourneyFlowViewed', {
      nullable: true
    }),
    plausibleDashboardViewed: t.exposeBoolean('plausibleDashboardViewed', {
      nullable: true
    })
  })
})

// Register as a federated entity
builder.asEntity(JourneyProfileRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.journeyProfile.findUnique({ where: { id } })
})

// getJourneyProfile query - matches legacy API
builder.queryField('getJourneyProfile', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyProfileRef,
    nullable: true,
    resolve: async (_parent, _args, context) => {
      const user = context.user

      return await prisma.journeyProfile.findUnique({
        where: { userId: user.id }
      })
    }
  })
)

// journeyProfileCreate mutation - matches legacy API
builder.mutationField('journeyProfileCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyProfileRef,
    nullable: false,
    resolve: async (_parent, _args, context) => {
      const user = context.user

      // Check if profile already exists
      const existingProfile = await prisma.journeyProfile.findUnique({
        where: { userId: user.id }
      })

      if (existingProfile != null) {
        return existingProfile
      }

      // Create new profile with accepted terms
      const createdProfile = await prisma.journeyProfile.create({
        data: {
          userId: user.id,
          acceptedTermsAt: new Date()
        }
      })

      // TODO: Add MailChimp integration when needed
      // await this.mailChimpService.syncUser(user)

      return createdProfile
    }
  })
)

// journeyProfileUpdate mutation - matches legacy API
builder.mutationField('journeyProfileUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyProfileRef,
    nullable: false,
    args: {
      input: t.arg({ type: JourneyProfileUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const user = context.user

      // Get existing profile
      const profile = await prisma.journeyProfile.findUnique({
        where: { userId: user.id }
      })

      if (profile == null) {
        throw new GraphQLError('journey profile not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Update profile with input data
      return await prisma.journeyProfile.update({
        where: { id: profile.id },
        data: input
      })
    }
  })
)
