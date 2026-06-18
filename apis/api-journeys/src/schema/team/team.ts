import { UserTeamRole, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { UserTeamRef } from '../userTeam/userTeam'

export const TeamRef = builder.prismaObject('Team', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    publicTitle: t.exposeString('publicTitle', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    userTeams: t.field({
      type: [UserTeamRef],
      nullable: false,
      resolve: async (team, _args, context) => {
        if (context.type !== 'authenticated') return []

        const userId = context.user.id
        const userTeams = await prisma.userTeam.findMany({
          where: { teamId: team.id },
          include: { team: { include: { userTeams: true } } }
        })

        const isMember = userTeams.some(
          (ut) =>
            ut.userId === userId &&
            (ut.role === UserTeamRole.manager ||
              ut.role === UserTeamRole.member)
        )
        if (!isMember) return []

        return userTeams
      }
    }),
    customDomains: t.relation('customDomains', { nullable: false }),
    integrations: t.relation('integrations', { nullable: false }),
    qrCodes: t.relation('qrCodes', { nullable: false })
  })
})
