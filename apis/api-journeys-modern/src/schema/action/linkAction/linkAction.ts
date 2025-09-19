import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const LinkActionRef = builder.prismaObject('Action', {
  variant: 'LinkAction',
  shareable: true,
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.url != null && action.email == null,
  fields: (t) => ({
    url: t.string({
      nullable: false,
      resolve: (action) => action.url || ''
    }),
    target: t.exposeString('target', { nullable: true }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    parentStepId: t.exposeString('parentStepId', { nullable: true })
  })
})

// Register as a federated entity
builder.asEntity(LinkActionRef, {
  key: builder.selection<{ parentBlockId: string }>('parentBlockId'),
  resolveReference: async (ref) => {
    return prisma.action.findUnique({
      where: { parentBlockId: ref.parentBlockId }
    })
  }
})
