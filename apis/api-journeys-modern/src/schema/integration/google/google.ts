import { builder } from '../../builder'
import { IntegrationRef } from '../integration'

export const IntegrationGoogleRef = builder.prismaObject('Integration', {
  interfaces: [IntegrationRef],
  include: { team: true },
  variant: 'IntegrationGoogle',
  shareable: true,
  fields: (t) => ({
    accessId: t.exposeString('accessId'),
    accessSecretPart: t.exposeString('accessSecretPart'),
    team: t.relation('team', { nullable: false })
  })
})
