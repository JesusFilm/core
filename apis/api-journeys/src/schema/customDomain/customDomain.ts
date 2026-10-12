import { builder } from '../builder'

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
    campaignId: t.exposeID('campaignId', {
      nullable: true,
      description:
        'Campaign Root: the campaign served at `/` and `/<regionSlug>` on this domain; null when none.'
    })
  })
})
