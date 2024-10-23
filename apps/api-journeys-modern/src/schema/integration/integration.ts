import { builder } from '../builder'

import { IntegrationType } from './enums/integrationType'

builder.prismaObject('Integration', {
  fields: (t) => ({
    id: t.exposeID('id'),
    team: t.relation('team'),
    type: t.expose('type', { type: IntegrationType })
  })
})
