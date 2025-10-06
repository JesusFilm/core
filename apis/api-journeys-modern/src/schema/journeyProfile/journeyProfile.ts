import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

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
