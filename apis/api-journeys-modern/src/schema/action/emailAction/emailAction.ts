import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const EmailActionRef = builder.prismaObject('Action', {
  variant: 'EmailAction',
  shareable: true,
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.email != null,
  fields: (t) => ({
    email: t.string({
      nullable: false,
      resolve: (action) => action.email || ''
    }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    parentStepId: t.exposeString('parentStepId', { nullable: true })
  })
})

// Register as a federated entity
builder.asEntity(EmailActionRef, {
  key: builder.selection<{ parentBlockId: string }>('parentBlockId'),
  resolveReference: async (ref) => {
    return prisma.action.findUnique({
      where: { parentBlockId: ref.parentBlockId }
    })
  }
})
