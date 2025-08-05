import { GraphQLError } from 'graphql'

import { prisma } from '../../../lib/prisma'
import { Block } from '../../block'
import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const EmailActionRef = builder.prismaObject('Action', {
  variant: 'EmailAction',
  shareable: true,
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.email != null,
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    email: t.string({
      nullable: false,
      resolve: (action) => action.email || ''
    }),
    parentBlock: t.field({
      type: Block,
      resolve: async (action) => {
        const block = await prisma.block.findUnique({
          where: { id: action.parentBlockId }
        })
        if (!block) {
          throw new GraphQLError('Parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        return block
      }
    })
  })
})
