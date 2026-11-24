import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'
import { campaignAcl } from '../campaign/campaign.acl'

export const CustomDomainRef = builder.prismaObject('CustomDomain', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    apexName: t.exposeString('apexName', { nullable: false }),
    routeAllTeamJourneys: t.exposeBoolean('routeAllTeamJourneys', {
      nullable: false
    }),
    team: t.relation('team', { nullable: false }),
    journeyCollection: t.relation('journeyCollection', { nullable: true }),
    campaignId: t.field({
      type: 'ID',
      nullable: true,
      description:
        "Campaign Domain: the campaign this domain belongs to, served at `/` and `/<regionSlug>` on it; null for a team domain, or when the campaign is a draft and the caller cannot read the domain team's campaigns.",
      resolve: async (customDomain, _args, context) => {
        const campaignId = customDomain.campaignId
        if (campaignId == null) return null

        if (context.type === 'authenticated') {
          const userTeam = await prisma.userTeam.findUnique({
            where: {
              teamId_userId: {
                teamId: customDomain.teamId,
                userId: context.user.id
              }
            }
          })
          const subject = {
            team: { userTeams: userTeam == null ? [] : [userTeam] }
          }
          if (campaignAcl(Action.Read, subject, context.user)) return campaignId
        }

        const campaign = await prisma.campaign.findUnique({
          where: { id: campaignId },
          select: { status: true }
        })
        return campaign?.status === 'published' ? campaignId : null
      }
    })
  })
})
