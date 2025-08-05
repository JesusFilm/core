import { UserTeamRole } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { JourneyNotificationRef } from '../journeyNotification/journeyNotification'
import { UserRef } from '../user/user'

export const UserTeamRef = builder.prismaObject('UserTeam', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeID('teamId'),
    userId: t.exposeID('userId'),
    role: t.field({
      type: UserTeamRole,
      resolve: (userTeam) => userTeam.role
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    team: t.relation('team'),
    user: t.field({
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
      resolve: async (userTeam, args) => {
        const { journeyId } = args
        const journeyNotifications = await prisma.userTeam
          .findUnique({
            where: { id: userTeam.id }
          })
          .then((ut) =>
            ut
              ? prisma.journeyNotification.findMany({
                  where: {
                    userTeamId: ut.id,
                    journeyId
                  }
                })
              : []
          )

        return journeyNotifications[0] || null
      }
    })
  })
})

builder.asEntity(UserTeamRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (userTeam) => {
    return await prisma.userTeam.findUnique({
      where: { id: userTeam.id }
    })
  }
})
