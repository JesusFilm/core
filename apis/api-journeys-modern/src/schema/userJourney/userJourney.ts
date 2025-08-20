import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { JourneyNotificationRef } from '../journeyNotification/journeyNotification'
import { UserRef } from '../user'

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
      type: UserRef,
      resolve: (userJourney) => ({
        id: userJourney.userId
      })
    }),
    journeyNotification: t.field({
      type: JourneyNotificationRef,
      nullable: true,
      resolve: async (userJourney) => {
        const journeyNotification = await prisma.userJourney
          .findUnique({
            where: { id: userJourney.id }
          })
          .then((uj) =>
            uj
              ? prisma.journeyNotification.findUnique({
                  where: { userJourneyId: uj.id }
                })
              : null
          )

        return journeyNotification
      }
    })
  })
})
