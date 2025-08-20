import { builder } from '../builder'

export const CustomDomainRef = builder.prismaObject('CustomDomain', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    apexName: t.exposeString('apexName'),
    routeAllTeamJourneys: t.exposeBoolean('routeAllTeamJourneys'),
    // Relations
    team: t.relation('team'),
    journeyCollection: t.relation('journeyCollection', { nullable: true })
  })
})
