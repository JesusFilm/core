import { GraphQLError } from 'graphql'

import { builder } from '../builder'

export const ActionInterface = builder.prismaInterface('Action', {
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId', { nullable: false }),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    parentBlock: t.relation('parentBlock', {
      nullable: false,
      resolve: async (action: any) => {
        if (!action.parentBlock) {
          throw new GraphQLError('Parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        return action.parentBlock
      }
    })
  }),
  resolveType: (action) => {
    if (action.blockId != null) return 'NavigateToBlockAction'
    if (action.email != null) return 'EmailAction'
    if ((action as any).phone != null) return 'PhoneAction'
    return 'LinkAction'
  }
})
