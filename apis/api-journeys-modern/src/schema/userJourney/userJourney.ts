import { builder } from '../builder'
import { AuthenticatedUserRef } from '../user'

import { UserJourneyRole } from './enums/userJourneyRole'

export const UserJourneyRef = builder.prismaObject('UserJourney', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    journeyId: t.exposeID('journeyId', { nullable: false }),
    role: t.field({
      nullable: false,
      type: UserJourneyRole,
      resolve: (userJourney) => userJourney.role
    }),
    openedAt: t.expose('openedAt', { type: 'DateTime', nullable: true }),
    journey: t.relation('journey'),
    user: t.field({
      type: AuthenticatedUserRef,
      resolve: (userJourney) => ({
        id: userJourney.userId
      })
    }),
    journeyNotification: t.relation('journeyNotification', { nullable: true })
  })
})
