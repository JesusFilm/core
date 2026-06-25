import { builder } from '../builder'

export const JourneyNotificationRef = builder.prismaObject(
  'JourneyNotification',
  {
    shareable: true,
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      userId: t.exposeID('userId', { nullable: false }),
      journeyId: t.exposeID('journeyId', { nullable: false }),
      userTeamId: t.exposeID('userTeamId', { nullable: true }),
      userJourneyId: t.exposeID('userJourneyId', { nullable: true }),
      visitorInteractionEmail: t.exposeBoolean('visitorInteractionEmail', {
        nullable: false
      })
    })
  }
)
