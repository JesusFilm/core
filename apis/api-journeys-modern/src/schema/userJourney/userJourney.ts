import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { JourneyNotificationRef } from '../journeyNotification/journeyNotification'
import { UserRef } from '../user/user'

import { UserJourneyRoleEnum } from './enums'

export const UserJourneyRef = builder.prismaObject('UserJourney', {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeID('userId'),
    journeyId: t.exposeID('journeyId'),
    role: t.field({
      type: UserJourneyRoleEnum,
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
