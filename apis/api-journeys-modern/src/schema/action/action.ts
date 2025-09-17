import { GraphQLError } from 'graphql'

import { builder } from '../builder'

export const ActionInterface = builder.prismaInterface('Action', {
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId', { nullable: false }),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    parentBlock: t.relation('parentBlock', {
      nullable: false
    })
  }),
  resolveType: (action) => {
    if (action.blockId != null) return 'NavigateToBlockAction'
    if (action.email != null) return 'EmailAction'
    if (action.phone != null) return 'PhoneAction'
    return 'LinkAction'
  }
})
