import { builder } from '../builder'

export const JourneyNotificationRef = builder.prismaObject(
  'JourneyNotification',
  {
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
