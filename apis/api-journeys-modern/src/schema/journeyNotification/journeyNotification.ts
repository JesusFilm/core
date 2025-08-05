import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

export const JourneyNotificationRef = builder.prismaObject(
  'JourneyNotification',
  {
    shareable: true,
    fields: (t) => ({
      id: t.exposeID('id'),
      userId: t.exposeID('userId'),
      journeyId: t.exposeID('journeyId'),
      userTeamId: t.exposeID('userTeamId', { nullable: true }),
      userJourneyId: t.exposeID('userJourneyId', { nullable: true }),
      visitorInteractionEmail: t.exposeBoolean('visitorInteractionEmail'),
      journey: t.relation('journey'),
      userTeam: t.relation('userTeam', { nullable: true }),
      userJourney: t.relation('userJourney', { nullable: true })
    })
  }
)

builder.asEntity(JourneyNotificationRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (journeyNotification) => {
    return await prisma.journeyNotification.findUnique({
      where: { id: journeyNotification.id }
    })
  }
})
