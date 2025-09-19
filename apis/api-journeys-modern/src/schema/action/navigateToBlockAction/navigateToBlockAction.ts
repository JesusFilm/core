import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const NavigateToBlockActionRef = builder.prismaObject('Action', {
  interfaces: [ActionInterface],
  variant: 'NavigateToBlockAction',
  isTypeOf: (action: any) => action.blockId != null,
  shareable: true,
  fields: (t) => ({
    blockId: t.string({
      nullable: false,
      resolve: (action) => action.blockId || ''
    })
  })
})

// Register as a federated entity
builder.asEntity(NavigateToBlockActionRef, {
  key: builder.selection<{ parentBlockId: string }>('parentBlockId'),
  resolveReference: async (ref) => {
    return prisma.action.findUnique({
      where: { parentBlockId: ref.parentBlockId }
    })
  }
})
