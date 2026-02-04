import { builder } from '../../builder'
import { AuthenticatedUserRef } from '../../user'
import { IntegrationRef } from '../integration'

export const IntegrationGoogleRef = builder.prismaObject('Integration', {
  interfaces: [IntegrationRef],
  include: { team: true },
  variant: 'IntegrationGoogle',
  shareable: true,
  fields: (t) => ({
    accountEmail: t.exposeString('accountEmail', { nullable: true }),
    team: t.relation('team', { nullable: false }),
    user: t.field({
      type: AuthenticatedUserRef,
      nullable: true,
      resolve: async (integration) => {
        if (integration.userId == null) return null
        return { id: integration.userId }
      }
    })
  })
})
