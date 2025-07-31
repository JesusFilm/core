import { builder } from '../builder'

builder.prismaObject('CustomDomain', {
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
