import { builder } from '../builder'

import { IntegrationType as IntegrationTypeEnum } from './enums'

export const IntegrationRef = builder.prismaInterface('Integration', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    type: t.expose('type', { type: IntegrationTypeEnum, nullable: false }),
    team: t.relation('team', { nullable: false })
  })
})
