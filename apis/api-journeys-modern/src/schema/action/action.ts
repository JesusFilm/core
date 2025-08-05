import { GraphQLError } from 'graphql'

import { builder } from '../builder'

export const ActionInterface = builder.prismaInterface('Action', {
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    parentBlock: t.relation('parentBlock', {
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
    return 'LinkAction'
  }
})
