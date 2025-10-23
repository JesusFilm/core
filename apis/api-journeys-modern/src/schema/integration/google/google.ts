import { builder } from '../../builder'
import { UserRef } from '../../user'
import { IntegrationRef } from '../integration'

export const IntegrationGoogleRef = builder.prismaObject('Integration', {
  interfaces: [IntegrationRef],
  include: { team: true },
  variant: 'IntegrationGoogle',
  shareable: true,
  fields: (t) => ({
    accessId: t.exposeString('accessId'),
    accessSecretPart: t.exposeString('accessSecretPart'),
    team: t.relation('team', { nullable: false }),
    user: t.field({
      type: UserRef,
      nullable: true,
      resolve: async (integration) => {
        if (integration.userId == null) return null
        return { __typename: 'User', id: integration.userId } as any
      }
    })
  })
})
