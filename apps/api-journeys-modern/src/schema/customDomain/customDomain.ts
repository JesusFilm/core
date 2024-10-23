import { builder } from '../builder'

builder.prismaObject('CustomDomain', {
  fields: (t) => ({
    id: t.exposeID('id'),
    team: t.relation('team'),
    name: t.exposeString('name'),
    apexName: t.exposeString('apexName'),
    journeyCollection: t.relation('journeyCollection', { nullable: true }),
    routeAllTeamJourneys: t.exposeBoolean('routeAllTeamJourneys')
  })
})
