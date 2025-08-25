import { builder } from '../builder'
import { JourneyNotificationRef } from '../journeyNotification'
import { UserRef } from '../user'

import { UserTeamRole } from './enums'

export const UserTeamRef = builder.prismaObject('UserTeam', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    role: t.field({
      nullable: false,
      type: UserTeamRole,
      resolve: (userTeam) => userTeam.role
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    user: t.field({
      nullable: false,
      type: UserRef,
      resolve: (userTeam) => ({
        id: userTeam.userId
      })
    }),
    journeyNotification: t.field({
      type: JourneyNotificationRef,
      nullable: true,
      args: {
        journeyId: t.arg.id({ required: true })
      },
      select: (args) => ({
        journeyNotifications: {
          where: {
            journeyId: args.journeyId
          }
        }
      }),
      resolve: async ({ journeyNotifications }) => {
        return journeyNotifications[0] || null
      }
    })
  })
})
