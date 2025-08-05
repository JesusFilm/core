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
